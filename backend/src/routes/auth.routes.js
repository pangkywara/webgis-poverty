const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findByUsernameOrEmail } = require("../users");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = "8h";

router.post("/login", async (req, res) => {
  const username = req.body.username?.trim();
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const user = await findByUsernameOrEmail(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = {
    sub: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({
      user: {
        id: payload.sub,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
