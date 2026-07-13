const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

/**
 * Routes
 */
const authRoutes = require("./routes/auth.routes");
const songRoutes = require("./routes/song.routes");

app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);

// FIX 1: Use an absolute path to serve static files securely
app.use(express.static(path.join(__dirname, "..", "public")));

// FIX 2: Use regex /(.*)/ for Express 5+ compatibility
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
