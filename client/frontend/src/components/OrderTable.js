import React, { useState } from 'react';
import { orderAPI } from '../services/api';

const OrderTable = ({ orders, onOrderUpdated, onOrderDeleted }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  if (!orders || !Array.isArray(orders)) {
    return <div>No orders data available</div>;
  }

  const handleEditClick = (order) => {
    setEditingId(order.id);
    setEditForm({
      customer_name: order.customer_name || '',
      item: order.item || '',
      quantity: order.quantity || '',
      contact_number: order.contact_number || '',
      status: order.status || 'Pending'
    });
  };

  const handleEditSave = async (orderId) => {
    try {
      await orderAPI.updateOrder(orderId, editForm);
      setEditingId(null);
      setEditForm({});
      
      if (onOrderUpdated) {
        onOrderUpdated();
      }
      
      alert('Order updated successfully!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order.');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderAPI.deleteOrder(orderId);
        
        if (onOrderDeleted) {
          onOrderDeleted();
        }
        
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order.');
      }
    }
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="order-table">
      <h2>Current Orders ({orders.length})</h2>
      
      {orders.length === 0 ? (
        <p className="no-orders">No orders found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Contact Number</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const orderId = order.id;
              const isEditing = editingId === orderId;
              
              return (
                <tr key={orderId}>
                  <td>{order.order_id || orderId}</td>
                  
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.customer_name}
                        onChange={(e) => handleEditChange('customer_name', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      order.customer_name
                    )}
                  </td>
                  
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.contact_number}
                        onChange={(e) => handleEditChange('contact_number', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      order.contact_number || 'N/A'
                    )}
                  </td>
                  
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.item}
                        onChange={(e) => handleEditChange('item', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      order.item
                    )}
                  </td>
                  
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => handleEditChange('quantity', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      order.quantity
                    )}
                  </td>
                  
                  <td>
                    {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                  </td>
                  
                  <td>
                    {isEditing ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => handleEditChange('status', e.target.value)}
                        className="edit-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <span className={`status ${order.status?.toLowerCase() || 'pending'}`}>
                        {order.status || 'Pending'}
                      </span>
                    )}
                  </td>
                  
                  <td className="actions">
                    {isEditing ? (
                      <>
                        <button 
                          onClick={() => handleEditSave(orderId)}
                          className="btn-save"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleEditCancel}
                          className="btn-cancel"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEditClick(order)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(orderId)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderTable;