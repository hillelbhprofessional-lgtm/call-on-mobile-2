const express = require("express");
const app = express();
app.use(express.json());

const AUTH_TOKEN = process.env.AUTH_TOKEN || "your-token-here";
let latestNumber = "";

app.get("/", (req, res) => {
  res.json({ status: "Call on Mobile running ✓" });
});

app.get("/latest", (req, res) => {
  const num = latestNumber;
  latestNumber = "";
  res.send(num);
});

app.post("/call", (req, res) => {
  const auth = (req.headers.authorization || "").replace("Bearer ", "");
  if (auth !== AUTH_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "phone required" });
  latestNumber = phone;
  console.log("Stored number:", phone);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
