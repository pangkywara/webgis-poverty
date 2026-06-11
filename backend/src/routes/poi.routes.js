const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

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

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM poi_markers ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM poi_markers WHERE id = $1",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { name, poi_type, religion_subtype, latitude, longitude, notes, radius_meters } = req.body;

  if (!name || !poi_type || latitude == null || longitude == null) {
    return res.status(400).json({ error: "name, poi_type, latitude, longitude are required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO poi_markers (name, poi_type, religion_subtype, latitude, longitude, notes, radius_meters)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, poi_type, religion_subtype ?? null, latitude, longitude, notes ?? null, radius_meters ?? 0]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  const { name, poi_type, religion_subtype, latitude, longitude, notes, radius_meters } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE poi_markers
       SET name = COALESCE($1, name),
           poi_type = COALESCE($2, poi_type),
           religion_subtype = $3,
           latitude = COALESCE($4, latitude),
           longitude = COALESCE($5, longitude),
           notes = $6,
           radius_meters = COALESCE($7, radius_meters),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        name ?? null,
        poi_type ?? null,
        religion_subtype ?? null,
        latitude ?? null,
        longitude ?? null,
        notes ?? null,
        radius_meters ?? null,
        req.params.id
      ]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM poi_markers WHERE id = $1",
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
