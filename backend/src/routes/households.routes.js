const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const FUZZY_URL = process.env.FUZZY_SERVICE_URL ?? "http://localhost:5001";

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

const FUZZY_LABEL_TO_POVERTY_LEVEL = {
  "SANGAT TINGGI": "Extreme",
  "TINGGI": "Extreme",
  "SEDANG": "Miskin",
  "RENDAH": "Miskin",
  "TIDAK PRIORITAS": "Rentan",
};

async function callFuzzyService(id, penghasilan, tanggungan, kondisi_rumah, kepemilikan_aset) {
  try {
    const res = await fetch(`${FUZZY_URL}/compute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, penghasilan, tanggungan, kondisi_rumah, kepemilikan_aset }),
    });
    if (!res.ok) return null;
    return await res.json(); // { id, score, label }
  } catch {
    return null; // degrade gracefully when service is unavailable
  }
}

router.get("/stats-fuzzy", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT fuzzy_label, COUNT(*) AS count
      FROM poor_households
      WHERE fuzzy_label IS NOT NULL
      GROUP BY fuzzy_label
    `);
    const labels = ["SANGAT TINGGI", "TINGGI", "SEDANG", "RENDAH", "TIDAK PRIORITAS"];
    const stats = Object.fromEntries(labels.map((l) => [l, 0]));
    for (const row of rows) stats[row.fuzzy_label] = parseInt(row.count, 10);
    res.json(stats);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

// Aggregated, DB-backed numbers for the poverty dashboard.
router.get("/stats-overview", async (_req, res) => {
  try {
    const [totalsQ, labelsQ, monthlyQ, poiQ] = await Promise.all([
      pool.query(`
        SELECT COUNT(*)::int                 AS household_count,
               COALESCE(SUM(family_count),0)::int AS total_dependents,
               COALESCE(AVG(penghasilan),0)::float AS avg_income,
               AVG(fuzzy_score)::float       AS avg_score
        FROM poor_households
      `),
      pool.query(`
        SELECT fuzzy_label, COUNT(*)::int AS count
        FROM poor_households
        WHERE fuzzy_label IS NOT NULL
        GROUP BY fuzzy_label
      `),
      pool.query(`
        SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
               COUNT(*)::int       AS count,
               AVG(fuzzy_score)::float AS avg_score
        FROM poor_households
        WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '11 months'
        GROUP BY 1
        ORDER BY 1
      `),
      pool.query(`
        SELECT poi_type, COUNT(*)::int AS count
        FROM poi_markers
        GROUP BY poi_type
      `),
    ]);

    const labels = ["SANGAT TINGGI", "TINGGI", "SEDANG", "RENDAH", "TIDAK PRIORITAS"];
    const byLabel = Object.fromEntries(labels.map((l) => [l, 0]));
    for (const row of labelsQ.rows) byLabel[row.fuzzy_label] = row.count;

    res.json({
      totals: totalsQ.rows[0],
      by_label: byLabel,
      monthly: monthlyQ.rows,
      poi: Object.fromEntries(poiQ.rows.map((r) => [r.poi_type, r.count])),
    });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

// Re-score every stored household with the current fuzzy engine.
router.post("/recompute-fuzzy", requireAuth, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, penghasilan, family_count, kondisi_rumah, kepemilikan_aset
       FROM poor_households`
    );
    if (!rows.length) return res.json({ updated: 0, total: 0 });

    const fuzzyRes = await fetch(`${FUZZY_URL}/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        households: rows.map((r) => ({
          id: r.id,
          penghasilan: r.penghasilan,
          tanggungan: r.family_count,
          kondisi_rumah: r.kondisi_rumah,
          kepemilikan_aset: r.kepemilikan_aset,
        })),
      }),
    });
    if (!fuzzyRes.ok) {
      return res.status(502).json({ error: "Fuzzy service unavailable" });
    }
    const { results } = await fuzzyRes.json();

    let updated = 0;
    for (const r of results) {
      const povertyLevel = FUZZY_LABEL_TO_POVERTY_LEVEL[r.label];
      const { rowCount } = await pool.query(
        `UPDATE poor_households
         SET fuzzy_score = $1, fuzzy_label = $2,
             poverty_level = COALESCE($3, poverty_level)
         WHERE id = $4`,
        [r.score, r.label, povertyLevel ?? null, r.id]
      );
      updated += rowCount;
    }
    res.json({ updated, total: rows.length });
  } catch {
    res.status(500).json({ error: "Recompute failed" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM poor_households ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const {
    head_name,
    family_count,
    latitude,
    longitude,
    notes,
    penghasilan,
    kondisi_rumah,
    kepemilikan_aset,
    marker_type,
  } = req.body;

  if (!head_name || latitude == null || longitude == null) {
    return res.status(400).json({ error: "head_name, latitude, longitude are required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO poor_households
         (head_name, family_count, poverty_level, latitude, longitude,
          notes, penghasilan, kondisi_rumah, kepemilikan_aset, marker_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        head_name,
        family_count ?? 1,
        "Miskin",
        latitude,
        longitude,
        notes ?? null,
        penghasilan ?? 0,
        kondisi_rumah ?? 5,
        kepemilikan_aset ?? 5,
        marker_type ?? "marker",
      ]
    );

    const household = rows[0];

    const fuzzyResult = await callFuzzyService(
      household.id,
      household.penghasilan,
      household.family_count,   // family_count = tanggungan
      household.kondisi_rumah,
      household.kepemilikan_aset
    );

    if (fuzzyResult) {
      const povertyLevel = FUZZY_LABEL_TO_POVERTY_LEVEL[fuzzyResult.label] ?? household.poverty_level;
      await pool.query(
        `UPDATE poor_households SET fuzzy_score = $1, fuzzy_label = $2, poverty_level = $3 WHERE id = $4`,
        [fuzzyResult.score, fuzzyResult.label, povertyLevel, household.id]
      );
      household.fuzzy_score = fuzzyResult.score;
      household.fuzzy_label = fuzzyResult.label;
      household.fuzzy_detail = fuzzyResult.faktor ?? null; // not persisted, response only
      household.poverty_level = povertyLevel;
    }

    res.status(201).json(household);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  const {
    head_name,
    family_count,
    latitude,
    longitude,
    notes,
    penghasilan,
    kondisi_rumah,
    kepemilikan_aset,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE poor_households
       SET head_name       = COALESCE($1, head_name),
           family_count    = COALESCE($2, family_count),
           latitude        = COALESCE($3, latitude),
           longitude       = COALESCE($4, longitude),
           notes           = $5,
           penghasilan     = COALESCE($6, penghasilan),
           kondisi_rumah   = COALESCE($7, kondisi_rumah),
           kepemilikan_aset= COALESCE($8, kepemilikan_aset)
       WHERE id = $9
       RETURNING *`,
      [
        head_name ?? null,
        family_count ?? null,
        latitude ?? null,
        longitude ?? null,
        notes ?? null,
        penghasilan ?? null,
        kondisi_rumah ?? null,
        kepemilikan_aset ?? null,
        req.params.id,
      ]
    );

    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const household = rows[0];
    const fuzzyResult = await callFuzzyService(
      household.id,
      household.penghasilan,
      household.family_count,
      household.kondisi_rumah,
      household.kepemilikan_aset
    );

    if (fuzzyResult) {
      const povertyLevel = FUZZY_LABEL_TO_POVERTY_LEVEL[fuzzyResult.label] ?? household.poverty_level;
      await pool.query(
        `UPDATE poor_households SET fuzzy_score = $1, fuzzy_label = $2, poverty_level = $3 WHERE id = $4`,
        [fuzzyResult.score, fuzzyResult.label, povertyLevel, household.id]
      );
      household.fuzzy_score = fuzzyResult.score;
      household.fuzzy_label = fuzzyResult.label;
      household.fuzzy_detail = fuzzyResult.faktor ?? null; // not persisted, response only
      household.poverty_level = povertyLevel;
    }

    res.json(household);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM poor_households WHERE id = $1",
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
