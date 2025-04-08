const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const usersFile = "./users.json";
const inventoryFile = "./inventory.json";

// Ensure users file exists
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]", "utf-8");
}

// Ensure inventory file exists
if (!fs.existsSync(inventoryFile)) {
  fs.writeFileSync(inventoryFile, "[]", "utf-8");
}

// Register
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  const userExists = users.find((u) => u.username === username);

  if (userExists) {
    return res.json({ success: false, message: "Username already exists." });
  }

  users.push({ username, password });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ success: true, message: "User registered successfully." });
});

// Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.json({ success: false, message: "Invalid credentials." });
  }

  res.json({ success: true, message: "Login successful." });
});

// Get all inventory items
app.get("/api/inventory", (req, res) => {
  const items = JSON.parse(fs.readFileSync(inventoryFile, "utf-8"));
  res.json(items);
});

// Add new inventory item
app.post("/api/inventory", (req, res) => {
  const { name, quantity } = req.body;
  const items = JSON.parse(fs.readFileSync(inventoryFile, "utf-8"));

  const newItem = {
    id: Date.now(), // simple ID
    name,
    quantity,
  };

  items.push(newItem);
  fs.writeFileSync(inventoryFile, JSON.stringify(items, null, 2));

  res.json({ success: true, message: "Item added", item: newItem });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
