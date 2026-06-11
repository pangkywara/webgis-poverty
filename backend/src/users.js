const pool = require("./db");

async function findByUsernameOrEmail(identifier) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE username = $1 OR email = $1 LIMIT 1",
    [identifier]
  );
  return rows[0] ?? null;
}

module.exports = { findByUsernameOrEmail };
