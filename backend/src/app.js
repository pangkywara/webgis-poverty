require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const householdsRoutes = require("./routes/households.routes");
const poiRoutes = require("./routes/poi.routes");
const landRoutes = require("./routes/land.routes");
const gasStationRoutes = require("./routes/gas-station.routes");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/households", householdsRoutes);
app.use("/poi", poiRoutes);
app.use("/land", landRoutes);
app.use("/gas-station", gasStationRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

module.exports = app;
