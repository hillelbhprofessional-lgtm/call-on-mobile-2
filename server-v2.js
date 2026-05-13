// server.js — relay server with polling support for MIT App Inventor
// Deploy this on Railway.app

const express = require("express");
const app = express();
app.use(express.json());

// ─── YOUR SETTINGS ────────────────────────────────────────────────────────────
const AUTH_TOKEN = process.env.AUTH_TOKEN || "CHANGE-THIS-TO-A-LONG-RANDOM-PASSWORD";
// ─────────────────────────────────────────────────────────────────────────────

// Stores the latest phone number waiting to be picked up by the Android app
let pendingNumber = null;

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Call on Mobile server is running ✓" });
});

// Chrome extension calls this → stores the number
app.post("/call", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "phone required" });

  pendingNumber = phone;
  console.log(`Stored number for pickup: ${phone}`);
  res.json({ ok: true });
});

// Android app polls this every 3 seconds → returns number if one is waiting
app.get("/poll", (req, res) => {
  const token = req.query.token;

  if (token !== AUTH_TOKEN) {
    return res.status(401).send("none");
  }

  if (pendingNumber) {
    const number = pendingNumber;
    pendingNumber = null; // clear it so it only dials once
    console.log(`Delivering number to phone: ${number}`);
    res.send(number);
  } else {
    res.send("none");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
