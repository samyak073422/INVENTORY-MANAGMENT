const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const usersFile = "./users.json";

// Ensure the users file exists
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]", "utf-8");
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

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
fetch("http://localhost:3000/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    // Save username locally and redirect to dashboard
    localStorage.setItem("activeUser", username);
    window.location.href = "dashboard.html";
  } else {
    alert(data.message);
  }
});
app.get("/api/inventory", async (req, res) => {
  try {
    const items = await InventoryItem.find(); // Assuming your model name
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/api/inventory", async (req, res) => {
  try {
    const items = await InventoryItem.find(); // Assuming your model name
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
