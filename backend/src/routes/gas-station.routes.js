const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

// Parser helper
function parseFuelData(apiResponse) {
  if (!apiResponse || !apiResponse.data || !apiResponse.data.content) {
    throw new Error("Invalid API response structure");
  }
  
  const content = apiResponse.data.content;
  const productTableNode = Object.values(content).find(
    node => node && node.type && node.type.resolvedName === "ProductTable"
  );
  
  if (!productTableNode || !productTableNode.props || !Array.isArray(productTableNode.props.items)) {
    throw new Error("ProductTable not found in content");
  }
  
  const items = productTableNode.props.items;
  
  const headingNode = Object.values(content).find(
    node => node && node.type && node.type.resolvedName === "Heading"
  );
  const lastUpdated = headingNode?.props?.text || apiResponse.data.title || "Update terbaru";
  
  const gasoline = [];
  const diesel = [];
  
  items.forEach(item => {
    const isGasoline = item.title && (item.title.toLowerCase() === "gasoline" || item.title.toLowerCase() === "bensin");
    const list = isGasoline ? gasoline : diesel;
    
    if (Array.isArray(item.data)) {
      item.data.forEach(row => {
        const parsed = {
          region: row.REGION?.trim(),
          pertalite: null,
          pertamax: null,
          pertamaxGreen: null,
          pertamaxTurbo: null,
          pertamaxPertashop: null,
          pertaminaDex: null,
          dexlite: null,
          bioSolarNonSubsidi: null,
          bioSolarSubsidi: null
        };
        
        for (const [key, value] of Object.entries(row)) {
          if (key === "REGION") continue;
          
          const cleanVal = value?.trim().replace(/,/g, "");
          const numericVal = (cleanVal && cleanVal !== "-" && !isNaN(cleanVal)) ? parseInt(cleanVal, 10) : null;
          
          if (key.includes("product-table-pertalite.png")) {
            parsed.pertalite = numericVal;
          } else if (key.includes("product-table-pertamax.png")) {
            parsed.pertamax = numericVal;
          } else if (key.includes("product-table-pertamax-green-95.png")) {
            parsed.pertamaxGreen = numericVal;
          } else if (key.includes("product-table-pertamax-turbo.png")) {
            parsed.pertamaxTurbo = numericVal;
          } else if (key.includes("harga-produk-pertamax-pertashop.jpg")) {
            parsed.pertamaxPertashop = numericVal;
          } else if (key.includes("product-table-pertamina-dex.png")) {
            parsed.pertaminaDex = numericVal;
          } else if (key.includes("product-table-dexlite.png")) {
            parsed.dexlite = numericVal;
          } else if (key.includes("harga-produk-bio-solar-non-subsidi.jpg")) {
            parsed.bioSolarNonSubsidi = numericVal;
          } else if (key.includes("harga-produk-bio-solar-subsidi.jpg")) {
            parsed.bioSolarSubsidi = numericVal;
          }
        }
        
        list.push(parsed);
      });
    }
  });
  
  return {
    succeeded: true,
    lastUpdated,
    gasoline,
    diesel
  };
}

// GET latest Pertamina fuel prices (cached, daily fetch)
router.get("/fuel-prices", async (_req, res) => {
  try {
    // 1. Check if we have a fresh DB cache
    const { rows } = await pool.query(
      "SELECT * FROM pertamina_fuel_prices ORDER BY last_fetched_at DESC LIMIT 1"
    );
    
    let rawData = null;
    let shouldFetch = true;
    
    if (rows.length > 0) {
      const cache = rows[0];
      const now = new Date();
      const lastFetched = new Date(cache.last_fetched_at);
      const diffMs = now - lastFetched;
      
      // If cached less than 24 hours ago, use cache
      if (diffMs < 24 * 60 * 60 * 1000) {
        rawData = cache.raw_data;
        shouldFetch = false;
        console.log("Serving fuel prices from DB cache");
      }
    }
    
    if (shouldFetch) {
      console.log("DB Cache stale or missing. Fetching fresh fuel prices from Pertamina API...");
      try {
        const response = await fetch(
          "https://pertaminapatraniaga.com/api/api/v1/post/get-by-slug/page/harga-terbaru-bbm?language=id"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        rawData = await response.json();
        
        // Save to DB cache
        await pool.query(
          "INSERT INTO pertamina_fuel_prices (last_fetched_at, raw_data) VALUES (NOW(), $1)",
          [JSON.stringify(rawData)]
        );
        console.log("Successfully cached fresh fuel prices to DB");
      } catch (fetchErr) {
        console.error("Failed to fetch fresh fuel prices from Pertamina API:", fetchErr);
        // Fall back to stale cache from DB if available
        if (rows.length > 0) {
          rawData = rows[0].raw_data;
          console.warn("Serving stale fuel prices from DB cache after fetch failure");
        } else {
          // If no DB cache exists, read from local fallback file
          console.warn("No DB cache available. Loading from pertamina-fallback.json file");
          const fallbackPath = path.join(__dirname, "pertamina-fallback.json");
          const fileData = fs.readFileSync(fallbackPath, "utf8");
          rawData = JSON.parse(fileData);
        }
      }
    }
    
    const parsed = parseFuelData(rawData);
    res.json(parsed);
  } catch (err) {
    console.error("Error in /fuel-prices endpoint:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


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

// GET all gas station markers
router.get("/markers", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT gsm.*, u.username AS created_by_username
      FROM gas_station_markers gsm
      LEFT JOIN users u ON u.id = gsm.created_by
      ORDER BY gsm.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET stats
router.get("/stats", async (_req, res) => {
  try {
    const totalResult = await pool.query("SELECT COUNT(*) FROM gas_station_markers");
    const categoryResult = await pool.query(`
      SELECT marker_category, COUNT(*) as count 
      FROM gas_station_markers 
      GROUP BY marker_category
    `);
    const activeEvResult = await pool.query(`
      SELECT COUNT(*) FROM gas_station_markers 
      WHERE marker_category = 'charging-station' AND status = 'Active'
    `);

    const stats = {
      total: parseInt(totalResult.rows[0].count, 10),
      gas_pump: 0,
      charging_station: 0,
      charging_station_active: parseInt(activeEvResult.rows[0].count, 10),
      wrench: 0
    };

    categoryResult.rows.forEach(r => {
      const cat = r.marker_category;
      if (cat === "gas-pump") stats.gas_pump = parseInt(r.count, 10);
      else if (cat === "charging-station") stats.charging_station = parseInt(r.count, 10);
      else if (cat === "wrench") stats.wrench = parseInt(r.count, 10);
    });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET single marker
router.get("/markers/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT gsm.*, u.username AS created_by_username
      FROM gas_station_markers gsm
      LEFT JOIN users u ON u.id = gsm.created_by
      WHERE gsm.id = $1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST new marker
router.post("/markers", requireAuth, async (req, res) => {
  const { name, marker_category, brand, sub_type, gas_types, operating_hours, status, latitude, longitude, notes } = req.body;

  if (!name || !marker_category || latitude == null || longitude == null) {
    return res.status(400).json({ error: "name, marker_category, latitude, longitude are required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO gas_station_markers (
        name, marker_category, brand, sub_type, gas_types, operating_hours, status, latitude, longitude, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        name,
        marker_category,
        brand ?? null,
        sub_type ?? null,
        gas_types ? JSON.stringify(gas_types) : null,
        operating_hours ?? null,
        status ?? null,
        latitude,
        longitude,
        notes ?? null,
        req.user.sub
      ]
    );
    res.status(201).json({ ...rows[0], created_by_username: req.user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// PUT update marker
router.put("/markers/:id", requireAuth, async (req, res) => {
  const { name, marker_category, brand, sub_type, gas_types, operating_hours, status, latitude, longitude, notes } = req.body;

  try {
    const { rows } = await pool.query(`
      WITH updated AS (
        UPDATE gas_station_markers
        SET name = COALESCE($1, name),
            marker_category = COALESCE($2, marker_category),
            brand = $3,
            sub_type = $4,
            gas_types = $5,
            operating_hours = $6,
            status = $7,
            latitude = COALESCE($8, latitude),
            longitude = COALESCE($9, longitude),
            notes = $10,
            updated_at = NOW()
        WHERE id = $11
        RETURNING *
      )
      SELECT updated.*, u.username AS created_by_username
      FROM updated
      LEFT JOIN users u ON u.id = updated.created_by
    `, [
      name ?? null,
      marker_category ?? null,
      brand ?? null,
      sub_type ?? null,
      gas_types ? JSON.stringify(gas_types) : null,
      operating_hours ?? null,
      status ?? null,
      latitude ?? null,
      longitude ?? null,
      notes ?? null,
      req.params.id
    ]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE marker
router.delete("/markers/:id", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM gas_station_markers WHERE id = $1",
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
