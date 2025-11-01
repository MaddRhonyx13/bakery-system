const express = require("express");
const cors = require("cors");
const Database = require('better-sqlite3');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/bakery.db' 
  : path.join(__dirname, 'bakery.db');

const db = new Database(dbPath);
console.log('✅ Connected to SQLite database');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      contact_number TEXT,
      item TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      order_date TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ Orders table ready');
  
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  if (rowCount.count === 0) {
    const insert = db.prepare(`
      INSERT INTO orders (order_id, customer_name, contact_number, item, quantity, order_date, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const sampleData = [
      ['ORD001', 'John Smith', '123-456-7890', 'Cake', 2, '2024-01-15', 'Completed'],
      ['ORD002', 'Emma Johnson', '123-456-7891', 'Bread', 5, '2024-01-16', 'Pending'],
      ['ORD003', 'Michael Brown', '123-456-7892', 'Muffin', 12, '2024-01-16', 'Pending']
    ];
    
    sampleData.forEach(data => {
      insert.run(data);
    });
    
    console.log('✅ Sample data inserted');
  }
}

initializeDatabase();

app.get("/api/orders", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM orders ORDER BY order_date DESC, created_at DESC");
    const orders = stmt.all();
    res.json(orders);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/orders", (req, res) => {
  const { order_id, customer_name, contact_number, item, quantity, order_date, status } = req.body;
  
  if (!order_id || !customer_name || !item || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const checkStmt = db.prepare("SELECT id FROM orders WHERE order_id = ?");
    const existing = checkStmt.get(order_id);
    
    if (existing) {
      return res.status(409).json({ error: "Order ID already exists" });
    }

    const insertStmt = db.prepare(`
      INSERT INTO orders (order_id, customer_name, contact_number, item, quantity, order_date, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertStmt.run(
      order_id,
      customer_name,
      contact_number || '',
      item,
      quantity,
      order_date || new Date().toISOString().split('T')[0],
      status || 'Pending'
    );

    const getStmt = db.prepare("SELECT * FROM orders WHERE id = ?");
    const newOrder = getStmt.get(result.lastInsertRowid);
    
    res.json({ 
      message: "Order created successfully", 
      order: newOrder
    });
    
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.put("/api/orders/:id", (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status || !['Pending', 'Completed'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const stmt = db.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    const result = stmt.run(status, orderId);
    
    if (result.changes === 0) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.json({ message: "Order status updated successfully" });
    }
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

app.delete("/api/orders/:id", (req, res) => {
  const orderId = req.params.id;
  
  try {
    const getStmt = db.prepare("SELECT * FROM orders WHERE id = ?");
    const order = getStmt.get(orderId);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    const deleteStmt = db.prepare("DELETE FROM orders WHERE id = ?");
    deleteStmt.run(orderId);
    
    res.json({ 
      message: "Order deleted successfully",
      deletedOrder: order
    });
    
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});