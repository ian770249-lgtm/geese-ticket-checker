import express from "express";
import statusRoute from "./routes/status.js";
import historyRoute from "./routes/history.js";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Ticket Checker</title>

<style>
body {
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #e5e7eb;
  margin: 0;
}

.wrap {
  max-width: 900px;
  margin: auto;
  padding: 30px;
}

h1 { margin-bottom: 20px; }

input {
  padding: 10px;
  border-radius: 8px;
  border: none;
  margin-right: 8px;
}

button {
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #1d4ed8;
}

.card {
  background: #1e293b;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: none;
  align-items: center;
  justify-content: center;
}

.modal-backdrop.show {
  display: flex;
}

.modal {
  background: #1e293b;
  padding: 20px;
  border-radius: 12px;
  width: 300px;
}
</style>
</head>

<body>

<div class="wrap">
  <h1>🎟 Ticket Checker</h1>

  <h2>Add Watch</h2>
  <input id="new-name" placeholder="Event name">
  <input id="new-url" placeholder="URL">
  <input id="new-price" placeholder="Max price">
  <input id="new-qty" value="1">
  <button onclick="addWatch()">Add</button>

  <h2>Watches</h2>
  <div id="status-list"></div>

  <h2>History</h2>
  <div id="history-list"></div>
</div>

<!-- DELETE MODAL -->
<div id="delete-modal" class="modal-backdrop">
  <div class="modal">
    <h3 id="delete-title"></h3>
    <p>Delete this watch?</p>
    <button onclick="closeDeleteModal()">Cancel</button>
    <button onclick="confirmDelete()">Delete</button>
  </div>
</div>

<script>
let deleteId = null;

function getStatusBadge(status) {
  if (status === "in_stock") {
    return '<span style="color:#22c55e;">🟢 In stock</span>';
  }
  if (status === "out_of_stock") {
    return '<span style="color:#ef4444;">🔴 Out of stock</span>';
  }
  return '<span style="color:#f59e0b;">🟡 Checking...</span>';
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString();
}

async function loadDashboard() {
  const watches = await (await fetch("/api/status")).json();

  document.getElementById("status-list").innerHTML =
    watches.map(w => \`
      <div class="card">
        <strong>\${w.name}</strong><br><br>

        \${getStatusBadge(w.last_status)}<br>
        <small>Last checked: \${formatTime(w.last_checked_at)}</small><br><br>

        <button onclick="runNow(\${w.id})">Run</button>
        <button onclick="toggleWatch(\${w.id})">Toggle</button>
        <button onclick="openDeleteModal(\${w.id}, '\${w.name}')">Delete</button>
      </div>
    \`).join("");
}

async function addWatch() {
  const name = document.getElementById("new-name").value;
  const url = document.getElementById("new-url").value;

  await fetch("/api/status", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ name, url })
  });

  loadDashboard();
}

async function runNow(id) {
  await fetch("/api/status/" + id + "/run", { method:"POST" });
  loadDashboard();
}

async function toggleWatch(id) {
  await fetch("/api/status/" + id + "/toggle", { method:"POST" });
  loadDashboard();
}

function openDeleteModal(id, name) {
  deleteId = id;
  document.getElementById("delete-title").innerText = "Delete " + name + "?";
  document.getElementById("delete-modal").classList.add("show");
}

function closeDeleteModal() {
  document.getElementById("delete-modal").classList.remove("show");
}

async function confirmDelete() {
  await fetch("/api/status/" + deleteId, { method:"DELETE" });
  closeDeleteModal();
  loadDashboard();
}

loadDashboard();
setInterval(loadDashboard, 5000);
</script>

</body>
</html>`);
});

app.use("/api/status", statusRoute);
app.use("/api/history", historyRoute);

export default app;