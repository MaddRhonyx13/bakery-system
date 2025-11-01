import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderAPI = {
  getAllOrders: async () => {
    try {
      const response = await api.get('/orders');
      console.log('GET Orders Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      return [];
    }
  },

  createOrder: async (orderData) => {
    try {
      console.log('Creating order with data:', orderData);
      
      const payload = {
        customer_name: orderData.customer_name,
        item: orderData.item,
        quantity: parseInt(orderData.quantity), 
        contact_number: orderData.contact_number || '',
        status: 'Pending'
      };

      console.log('Sending payload:', payload);

      const response = await api.post('/orders', payload);
      console.log('Create Order Success:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  updateOrder: async (orderId, orderData) => {
    try {
      console.log(`Updating order ${orderId} with data:`, orderData);
      
      const payload = {
        customer_name: orderData.customer_name,
        item: orderData.item,
        quantity: parseInt(orderData.quantity),
        contact_number: orderData.contact_number || '',
        status: orderData.status
      };

      const response = await api.put(`/orders/${orderId}`, payload);
      console.log('Update Order Success:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Error updating order:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteOrder: async (orderId) => {
    try {
      console.log(`Deleting order ${orderId}`);
      const response = await api.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error.response?.data || error.message);
      throw error;
    }
  }
};