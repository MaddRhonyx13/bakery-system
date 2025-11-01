import React, { useState } from "react";
import { orderAPI } from "../services/api";

const OrderRow = ({ order, onOrderUpdated, onOrderDeleted }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await orderAPI.updateOrder(order.id, { status: newStatus });
      onOrderUpdated();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete order ${order.order_id}?`)) {
      try {
        await orderAPI.deleteOrder(order.id);
        onOrderDeleted();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const getStatusBadge = (status) => {
    return status === 'Completed' ? 'status-completed' : 'status-pending';
  };

  return (
    <tr className="order-row">
      <td>{order.order_id}</td>
      <td>{order.customer_name}</td>
      <td>{order.contact_number || 'N/A'}</td>
      <td>{order.item}</td>
      <td>{order.quantity}</td>
      <td>{new Date(order.order_date).toLocaleDateString()}</td>
      <td>
        <span className={`status-badge ${getStatusBadge(order.status)}`}>
          {order.status}
        </span>
      </td>
      <td className="actions">
        <select 
          value={order.status} 
          onChange={(e) => handleStatusUpdate(e.target.value)}
          disabled={isUpdating}
          className="status-select"
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
        <button 
          onClick={handleDelete}
          className="delete-btn"
          title="Delete order"
          disabled={isUpdating}
        >
          🗑️
        </button>
      </td>
    </tr>
  );
};

export default OrderRow;