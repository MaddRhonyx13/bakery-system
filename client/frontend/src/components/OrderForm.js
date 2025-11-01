import React, { useState } from 'react';
import { orderAPI } from '../services/api';

const OrderForm = ({ onOrderAdded }) => {
  const [customerName, setCustomerName] = useState('');
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerName.trim() || !item.trim() || !quantity.trim()) {
      alert('Please fill in Customer Name, Item, and Quantity');
      return;
    }

    setSubmitting(true);
    
    try {
      await orderAPI.createOrder({
        customer_name: customerName,
        item: item,
        quantity: quantity,
        contact_number: contactNumber,
        status: 'Pending'
      });
      
      setCustomerName('');
      setItem('');
      setQuantity('');
      setContactNumber('');
      
      if (onOrderAdded) {
        onOrderAdded();
      }
      
      alert('Order added successfully!');
    } catch (error) {
      console.error('Error adding order:', error);
      alert('Failed to add order. Please check if the backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="order-form">
      <h2>Add New Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customerName">Customer Name:</label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            disabled={submitting}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactNumber">Contact Number:</label>
          <input
            id="contactNumber"
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="Enter contact number"
            disabled={submitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="item">Item:</label>
          <input
            id="item"
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="Enter item name"
            disabled={submitting}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="quantity">Quantity:</label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            disabled={submitting}
            required
          />
        </div>
        
        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding Order...' : 'Add Order'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;