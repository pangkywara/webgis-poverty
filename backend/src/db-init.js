const bcrypt = require("bcryptjs");
const pool = require("./db");
const {
  SEED_HOUSEHOLDS,
  SEED_POI,
  SEED_LAND_MARKERS,
  SEED_LAND_SHAPES,
  SEED_GAS_STATIONS,
} = require("./seed-data");

const SALT = 10;

const SEED_USERS = [
  { username: "superadmin",    email: "superadmin@app.local", role: "superadmin",        password: "Super@1234"   },
  { username: "admin_poverty", email: "poverty@app.local",    role: "admin_poverty",     password: "Poverty@1234" },
  { username: "admin_lands",   email: "lands@app.local",      role: "admin_lands_roads", password: "Lands@1234"   },
  { username: "admin_gas",     email: "gas@app.local",        role: "admin_gas_stations",password: "Gas@1234"     },
];

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      username      VARCHAR(255) UNIQUE NOT NULL,
      email         VARCHAR(255) UNIQUE NOT NULL,
      role          VARCHAR(100)        NOT NULL,
      password_hash TEXT                NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS poor_households (
      id              SERIAL PRIMARY KEY,
      head_name       VARCHAR(255) NOT NULL,
      family_count    INT NOT NULL DEFAULT 1,
      poverty_level   VARCHAR(10) NOT NULL DEFAULT 'Miskin',
      latitude        DECIMAL(10, 8) NOT NULL,
      longitude       DECIMAL(11, 8) NOT NULL,
      notes           TEXT,
      penghasilan     INT NOT NULL DEFAULT 0,
      kondisi_rumah   SMALLINT NOT NULL DEFAULT 5,
      kepemilikan_aset SMALLINT NOT NULL DEFAULT 5,
      marker_type     VARCHAR(50) DEFAULT 'marker',
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS poi_markers (
      id               SERIAL PRIMARY KEY,
      name             VARCHAR(255) NOT NULL,
      poi_type         VARCHAR(50)  NOT NULL,
      religion_subtype VARCHAR(50),
      latitude         DECIMAL(10,8) NOT NULL,
      longitude        DECIMAL(11,8) NOT NULL,
      notes            TEXT,
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE poor_households
      ADD COLUMN IF NOT EXISTS fuzzy_score DECIMAL(5,2) DEFAULT NULL
  `);

  await pool.query(`
    ALTER TABLE poor_households
      ADD COLUMN IF NOT EXISTS fuzzy_label VARCHAR(50) DEFAULT NULL
  `);

  await pool.query(`
    ALTER TABLE poi_markers
      ADD COLUMN IF NOT EXISTS radius_meters INT DEFAULT 0
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS land_markers (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      marker_type VARCHAR(50)  NOT NULL,
      latitude    DECIMAL(10,8) NOT NULL,
      longitude   DECIMAL(11,8) NOT NULL,
      notes       TEXT,
      created_by  INT REFERENCES users(id) ON DELETE SET NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_land_markers_created_by ON land_markers(created_by)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS land_shapes (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(255) NOT NULL,
      shape_type    VARCHAR(50)  NOT NULL,
      status        VARCHAR(50),
      latitude      DECIMAL(10,8) NOT NULL,
      longitude     DECIMAL(11,8) NOT NULL,
      coordinates   JSONB,
      radius_meters DECIMAL(10,2),
      notes         TEXT,
      created_by    INT REFERENCES users(id) ON DELETE SET NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_land_shapes_created_by ON land_shapes(created_by)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS gas_station_markers (
      id               SERIAL PRIMARY KEY,
      name             VARCHAR(255) NOT NULL,
      marker_category  VARCHAR(50)  NOT NULL,
      brand            VARCHAR(50),
      sub_type         VARCHAR(100),
      gas_types        JSONB,
      operating_hours  VARCHAR(255),
      status           VARCHAR(50),
      latitude         DECIMAL(10,8) NOT NULL,
      longitude        DECIMAL(11,8) NOT NULL,
      notes            TEXT,
      created_by       INT REFERENCES users(id) ON DELETE SET NULL,
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_gas_station_markers_created_by ON gas_station_markers(created_by)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_gas_station_markers_category ON gas_station_markers(marker_category)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pertamina_fuel_prices (
      id               SERIAL PRIMARY KEY,
      last_fetched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      raw_data         JSONB NOT NULL
    )
  `);

  // ── Seed Users ──────────────────────────────────────────────────────────────
  for (const u of SEED_USERS) {
    const hash = await bcrypt.hash(u.password, SALT);
    await pool.query(
      `INSERT INTO users (username, email, role, password_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING`,
      [u.username, u.email, u.role, hash]
    );
  }
  console.log(`[seed] users seeded (${SEED_USERS.length} entries)`);

  // ── Seed Poor Households ────────────────────────────────────────────────────
  const hhCount = await pool.query("SELECT COUNT(*)::int AS c FROM poor_households");
  if (hhCount.rows[0].c === 0) {
    for (const h of SEED_HOUSEHOLDS) {
      await pool.query(
        `INSERT INTO poor_households
           (head_name, family_count, poverty_level, latitude, longitude, notes,
            penghasilan, kondisi_rumah, kepemilikan_aset, fuzzy_score, fuzzy_label)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          h.head_name, h.family_count, h.poverty_level,
          h.latitude, h.longitude, h.notes,
          h.penghasilan, h.kondisi_rumah, h.kepemilikan_aset,
          h.fuzzy_score, h.fuzzy_label,
        ]
      );
    }
    console.log(`[seed] poor_households seeded (${SEED_HOUSEHOLDS.length} entries)`);
  }

  // ── Seed POI Markers ────────────────────────────────────────────────────────
  const poiCount = await pool.query("SELECT COUNT(*)::int AS c FROM poi_markers");
  if (poiCount.rows[0].c === 0) {
    for (const p of SEED_POI) {
      await pool.query(
        `INSERT INTO poi_markers (name, poi_type, religion_subtype, latitude, longitude, notes, radius_meters)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [p.name, p.poi_type, p.religion_subtype, p.latitude, p.longitude, p.notes, p.radius_meters]
      );
    }
    console.log(`[seed] poi_markers seeded (${SEED_POI.length} entries)`);
  }

  // ── Seed Land Markers ───────────────────────────────────────────────────────
  const lmCount = await pool.query("SELECT COUNT(*)::int AS c FROM land_markers");
  if (lmCount.rows[0].c === 0) {
    // Get superadmin id for created_by
    const adminRow = await pool.query("SELECT id FROM users WHERE username = 'superadmin' LIMIT 1");
    const createdBy = adminRow.rows.length ? adminRow.rows[0].id : null;

    for (const lm of SEED_LAND_MARKERS) {
      await pool.query(
        `INSERT INTO land_markers (name, marker_type, latitude, longitude, notes, created_by)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [lm.name, lm.marker_type, lm.latitude, lm.longitude, lm.notes, createdBy]
      );
    }
    console.log(`[seed] land_markers seeded (${SEED_LAND_MARKERS.length} entries)`);
  }

  // ── Seed Land Shapes ────────────────────────────────────────────────────────
  const lsCount = await pool.query("SELECT COUNT(*)::int AS c FROM land_shapes");
  if (lsCount.rows[0].c === 0) {
    const adminRow2 = await pool.query("SELECT id FROM users WHERE username = 'superadmin' LIMIT 1");
    const createdBy2 = adminRow2.rows.length ? adminRow2.rows[0].id : null;

    for (const ls of SEED_LAND_SHAPES) {
      await pool.query(
        `INSERT INTO land_shapes (name, shape_type, status, latitude, longitude, coordinates, radius_meters, notes, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [ls.name, ls.shape_type, ls.status, ls.latitude, ls.longitude, ls.coordinates, ls.radius_meters, ls.notes, createdBy2]
      );
    }
    console.log(`[seed] land_shapes seeded (${SEED_LAND_SHAPES.length} entries)`);
  }

  // ── Seed Gas Station Markers ────────────────────────────────────────────────
  const gsCount = await pool.query("SELECT COUNT(*)::int AS c FROM gas_station_markers");
  if (gsCount.rows[0].c === 0) {
    const adminRow3 = await pool.query("SELECT id FROM users WHERE username = 'superadmin' LIMIT 1");
    const createdBy3 = adminRow3.rows.length ? adminRow3.rows[0].id : null;

    for (const gs of SEED_GAS_STATIONS) {
      await pool.query(
        `INSERT INTO gas_station_markers
           (name, marker_category, brand, sub_type, gas_types, operating_hours, status, latitude, longitude, notes, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          gs.name, gs.marker_category, gs.brand, gs.sub_type,
          gs.gas_types, gs.operating_hours, gs.status,
          gs.latitude, gs.longitude, gs.notes, createdBy3,
        ]
      );
    }
    console.log(`[seed] gas_station_markers seeded (${SEED_GAS_STATIONS.length} entries)`);
  }

  console.log("[seed] Database initialization complete.");
}

module.exports = initDb;
