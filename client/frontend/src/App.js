import React, { useState, useEffect } from 'react';
import OrderForm from './components/OrderForm';
import OrderTable from './components/OrderTable';
import { orderAPI } from './services/api';
import './styles/App.css';

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderAPI.getAllOrders();
      setOrders(ordersData);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderAdded = () => {
    fetchOrders();
  };

  const handleOrderUpdated = () => {
    fetchOrders();
  };

  const handleOrderDeleted = () => {
    fetchOrders();
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Sweet Crust Bakery Order Management</h1>
        <p>Manage your bakery orders efficiently</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <OrderForm onOrderAdded={handleOrderAdded} />
        
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : (
          <OrderTable 
            orders={orders}
            onOrderUpdated={handleOrderUpdated}
            onOrderDeleted={handleOrderDeleted}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Sweet Crust Bakery - Bakery System</p>
      </footer>
    </div>
  );
}

export default App;