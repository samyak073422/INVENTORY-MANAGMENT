let inventory = [];
let logs = [];
let darkMode = false;

window.onload = () => {
  const username = localStorage.getItem("activeUser");
  if (!username) {
    alert("You are not logged in!");
    window.location.href = "index.html";
    return;
  }

  loadInventory();
  renderInventory();
  updateSummary();
  populateCategoryFilter();
};

function loadInventory() {
  const username = localStorage.getItem("activeUser");
  inventory = JSON.parse(localStorage.getItem(`inventory_${username}`)) || [];
  logs = JSON.parse(localStorage.getItem(`logs_${username}`)) || [];
}

function saveInventory() {
  const username = localStorage.getItem("activeUser");
  localStorage.setItem(`inventory_${username}`, JSON.stringify(inventory));
  localStorage.setItem(`logs_${username}`, JSON.stringify(logs));
}

function toggleForm(index = null) {
  const form = document.getElementById("formSection");
  const formTitle = document.getElementById("formTitle");
  form.style.display = form.style.display === "none" ? "block" : "none";

  if (index !== null) {
    const item = inventory[index];
    document.getElementById("itemIndex").value = index;
    document.getElementById("itemName").value = item.name;
    document.getElementById("itemQty").value = item.qty;
    document.getElementById("itemPrice").value = item.price;
    document.getElementById("itemCategory").value = item.category;
    formTitle.textContent = "Edit Item";
  } else {
    document.getElementById("itemForm").reset();
    document.getElementById("itemIndex").value = "";
    formTitle.textContent = "Add New Item";
  }
}

function saveItem(e) {
  e.preventDefault();

  const index = document.getElementById("itemIndex").value;
  const name = document.getElementById("itemName").value.trim();
  const qty = parseInt(document.getElementById("itemQty").value);
  const price = parseFloat(document.getElementById("itemPrice").value);
  const category = document.getElementById("itemCategory").value.trim();

  const item = { name, qty, price, category };

  if (index) {
    inventory[index] = item;
    logs.push(`📝 Edited item: ${name}`);
  } else {
    inventory.push(item);
    logs.push(`➕ Added item: ${name}`);
  }

  saveInventory();
  renderInventory();
  updateSummary();
  populateCategoryFilter();
  toggleForm();
}

function renderInventory() {
  const tableSection = document.getElementById("inventoryTable");
  const search = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  let filtered = inventory.filter(item =>
    (item.name.toLowerCase().includes(search) || item.category.toLowerCase().includes(search)) &&
    (category === "all" || item.category === category)
  );

  if (filtered.length === 0) {
    tableSection.innerHTML = "<p>No items found.</p>";
    return;
  }

  let html = `<table><tr>
    <th>Name</th><th>Qty</th><th>Price</th><th>Category</th><th>Value</th><th>Actions</th>
  </tr>`;

  filtered.forEach((item, i) => {
    html += `<tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td>${item.category}</td>
      <td>₹${(item.qty * item.price).toFixed(2)}</td>
      <td>
        <button onclick="toggleForm(${i})">✏️</button>
        <button onclick="deleteItem(${i})">🗑️</button>
      </td>
    </tr>`;
  });

  html += `</table>`;
  tableSection.innerHTML = html;
}

function deleteItem(index) {
  const removed = inventory.splice(index, 1)[0];
  logs.push(`❌ Deleted item: ${removed.name}`);
  saveInventory();
  renderInventory();
  updateSummary();
  populateCategoryFilter();
}

function updateSummary() {
  const totalItems = inventory.length;
  const totalQty = inventory.reduce((sum, item) => sum + item.qty, 0);
  const totalValue = inventory.reduce((sum, item) => sum + item.qty * item.price, 0);

  const categoryCount = {};
  inventory.forEach(item => {
    categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
  });

  const lowStockCount = inventory.filter(item => item.qty <= 5).length;
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  document.getElementById("totalItems").textContent = `📦 Total Items: ${totalItems}`;
  document.getElementById("totalQty").textContent = `🔢 Total Quantity: ${totalQty}`;
  document.getElementById("totalValue").textContent = `💰 Total Value: ₹${totalValue.toFixed(2)}`;
  document.getElementById("lowStock").textContent = `⚠️ Low Stock Items: ${lowStockCount}`;
  document.getElementById("topCategory").textContent = `🏷️ Top Category: ${topCategory}`;
}

function populateCategoryFilter() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(inventory.map(item => item.category))];

  categoryFilter.innerHTML = categories
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join("");
}

function exportCSV() {
  let csv = "Name,Qty,Price,Category,Value\n";
  inventory.forEach(item => {
    csv += `${item.name},${item.qty},${item.price},${item.category},${(item.qty * item.price).toFixed(2)}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "inventory.csv";
  link.click();
}

function printInventory() {
  const printWindow = window.open("", "_blank");
  printWindow.document.write("<pre>" + JSON.stringify(inventory, null, 2) + "</pre>");
  printWindow.document.close();
  printWindow.print();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  darkMode = !darkMode;
}

function logout() {
  localStorage.removeItem("activeUser");
  window.location.href = "index.html";
}

function showStockLog() {
  const logDiv = document.getElementById("logList");
  const logModal = document.getElementById("logModal");
  logDiv.innerHTML = logs.map(log => `<p>${log}</p>`).join("");
  logModal.style.display = "block";
}

function closeLogModal() {
  document.getElementById("logModal").style.display = "none";
}
async function exportCSV() {
  try {
    const response = await fetch("/api/inventory"); // Update URL if needed
    const inventory = await response.json();

    if (!inventory || inventory.length === 0) {
      alert("📭 No inventory data to export!");
      return;
    }

    const headers = ["Item Name", "Quantity", "Price (₹)", "Category"];
    const rows = inventory.map(item => [
      `"${item.name}"`,
      item.qty,
      item.price,
      `"${item.category}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "inventory_data.csv";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    alert("❌ Failed to export data. Please try again later.");
  }
}
