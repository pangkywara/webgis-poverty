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

/* ───────── land_markers (marker / flag / protected / registry) ───────── */

router.get("/markers", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT lm.*, u.username AS created_by_username
      FROM land_markers lm
      LEFT JOIN users u ON u.id = lm.created_by
      ORDER BY lm.created_at DESC
    `);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/markers/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT lm.*, u.username AS created_by_username
      FROM land_markers lm
      LEFT JOIN users u ON u.id = lm.created_by
      WHERE lm.id = $1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/markers", requireAuth, async (req, res) => {
  const { name, marker_type, latitude, longitude, notes } = req.body;

  if (!name || !marker_type || latitude == null || longitude == null) {
    return res.status(400).json({ error: "name, marker_type, latitude, longitude are required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO land_markers (name, marker_type, latitude, longitude, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, marker_type, latitude, longitude, notes ?? null, req.user.sub]
    );
    res.status(201).json({ ...rows[0], created_by_username: req.user.username });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/markers/:id", requireAuth, async (req, res) => {
  const { name, marker_type, latitude, longitude, notes } = req.body;

  try {
    const { rows } = await pool.query(`
      WITH updated AS (
        UPDATE land_markers
        SET name = COALESCE($1, name),
            marker_type = COALESCE($2, marker_type),
            latitude = COALESCE($3, latitude),
            longitude = COALESCE($4, longitude),
            notes = $5,
            updated_at = NOW()
        WHERE id = $6
        RETURNING *
      )
      SELECT updated.*, u.username AS created_by_username
      FROM updated
      LEFT JOIN users u ON u.id = updated.created_by
    `, [
      name ?? null,
      marker_type ?? null,
      latitude ?? null,
      longitude ?? null,
      notes ?? null,
      req.params.id
    ]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/markers/:id", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM land_markers WHERE id = $1",
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

/* ───────── land_shapes (line / polygon / circle) ───────── */

router.get("/shapes", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ls.*, u.username AS created_by_username
      FROM land_shapes ls
      LEFT JOIN users u ON u.id = ls.created_by
      ORDER BY ls.created_at DESC
    `);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/shapes/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ls.*, u.username AS created_by_username
      FROM land_shapes ls
      LEFT JOIN users u ON u.id = ls.created_by
      WHERE ls.id = $1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/shapes", requireAuth, async (req, res) => {
  const { name, shape_type, status, latitude, longitude, coordinates, radius_meters, notes } = req.body;

  if (!name || !shape_type || latitude == null || longitude == null) {
    return res.status(400).json({ error: "name, shape_type, latitude, longitude are required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO land_shapes (name, shape_type, status, latitude, longitude, coordinates, radius_meters, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        shape_type,
        status ?? null,
        latitude,
        longitude,
        coordinates ? JSON.stringify(coordinates) : null,
        radius_meters ?? null,
        notes ?? null,
        req.user.sub
      ]
    );
    res.status(201).json({ ...rows[0], created_by_username: req.user.username });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/shapes/:id", requireAuth, async (req, res) => {
  const { name, shape_type, status, latitude, longitude, coordinates, radius_meters, notes } = req.body;

  try {
    const { rows } = await pool.query(`
      WITH updated AS (
        UPDATE land_shapes
        SET name = COALESCE($1, name),
            shape_type = COALESCE($2, shape_type),
            status = $3,
            latitude = COALESCE($4, latitude),
            longitude = COALESCE($5, longitude),
            coordinates = COALESCE($6, coordinates),
            radius_meters = COALESCE($7, radius_meters),
            notes = $8,
            updated_at = NOW()
        WHERE id = $9
        RETURNING *
      )
      SELECT updated.*, u.username AS created_by_username
      FROM updated
      LEFT JOIN users u ON u.id = updated.created_by
    `, [
      name ?? null,
      shape_type ?? null,
      status ?? null,
      latitude ?? null,
      longitude ?? null,
      coordinates ? JSON.stringify(coordinates) : null,
      radius_meters ?? null,
      notes ?? null,
      req.params.id
    ]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/shapes/:id", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM land_shapes WHERE id = $1",
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
