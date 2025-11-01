const express = require("express");
const cors = require("cors");
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// SQLite database (file-based, no server needed)
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/bakery.db' 
  : path.join(__dirname, 'bakery.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS orders (
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
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('✅ Orders table ready');
      // Insert sample data if empty
      insertSampleData();
    }
  });
}

function insertSampleData() {
  const checkSql = "SELECT COUNT(*) as count FROM orders";
  db.get(checkSql, [], (err, row) => {
    if (err) {
      console.error('Error checking data:', err);
      return;
    }
    
    if (row.count === 0) {
      const sampleData = [
        ['ORD001', 'John Smith', '123-456-7890', 'Cake', 2, '2024-01-15', 'Completed'],
        ['ORD002', 'Emma Johnson', '123-456-7891', 'Bread', 5, '2024-01-16', 'Pending'],
        ['ORD003', 'Michael Brown', '123-456-7892', 'Muffin', 12, '2024-01-16', 'Pending']
      ];
      
      const insertSql = `INSERT INTO orders (order_id, customer_name, contact_number, item, quantity, order_date, status) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      sampleData.forEach(data => {
        db.run(insertSql, data, (err) => {
          if (err) {
            console.error('Error inserting sample data:', err);
          }
        });
      });
      console.log('✅ Sample data inserted');
    }
  });
}

// GET all orders
app.get("/api/orders", (req, res) => {
  const query = "SELECT * FROM orders ORDER BY order_date DESC, created_at DESC";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(rows);
    }
  });
});

// POST new order
app.post("/api/orders", (req, res) => {
  const { order_id, customer_name, contact_number, item, quantity, order_date, status } = req.body;
  
  if (!order_id || !customer_name || !item || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `INSERT INTO orders (order_id, customer_name, contact_number, item, quantity, order_date, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  const values = [order_id, customer_name, contact_number || '', item, quantity, order_date || new Date().toISOString().split('T')[0], status || 'Pending'];

  db.run(query, values, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: "Order ID already exists" });
      }
      console.error("Insert error:", err);
      res.status(500).json({ error: "Failed to create order" });
    } else {
      // Return the created order
      db.get("SELECT * FROM orders WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          res.json({ message: "Order created successfully", orderId: this.lastID });
        } else {
          res.json({ message: "Order created successfully", order: row });
        }
      });
    }
  });
});

// UPDATE order status
app.put("/api/orders/:id", (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status || !['Pending', 'Completed'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const query = "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
  
  db.run(query, [status, orderId], function(err) {
    if (err) {
      console.error("Update error:", err);
      res.status(500).json({ error: "Failed to update order" });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.json({ message: "Order status updated successfully" });
    }
  });
});

// DELETE order
app.delete("/api/orders/:id", (req, res) => {
  const orderId = req.params.id;
  
  // First get the order
  db.get("SELECT * FROM orders WHERE id = ?", [orderId], (err, row) => {
    if (err) {
      console.error("Select error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (!row) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Then delete it
    db.run("DELETE FROM orders WHERE id = ?", [orderId], function(err) {
      if (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: "Failed to delete order" });
      } else {
        res.json({ 
          message: "Order deleted successfully",
          deletedOrder: row
        });
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});