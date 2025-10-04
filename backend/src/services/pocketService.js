import axios from 'axios';

const API_URL = 'http://localhost:5000/api/pockets';

class PocketService {
  static getAuthHeader() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('กรุณาเข้าสู่ระบบก่อนใช้งาน');
    }
    // Set default header for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return { Authorization: `Bearer ${token}` };
  }

  static async getAllPockets() {
    try {
      const headers = this.getAuthHeader();
      const response = await axios.get(API_URL, { headers });
      
      if (!response.data) {
        throw new Error('ไม่พบข้อมูลหมวดหมู่');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in getAllPockets:', error);
      if (error.response?.status === 401) {
        // Token might be expired or invalid
        localStorage.removeItem('token');
        throw new Error('กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
      }
      throw error;
    }
  }

  static async createPocket(pocketData) {
    try {
      const response = await axios.post(API_URL, pocketData, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create pocket');
    }
  }

  static async updatePocket(id, pocketData) {
    try {
      const response = await axios.put(`${API_URL}/${id}`, pocketData, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update pocket');
    }
  }

  static async deletePocket(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete pocket');
    }
  }

  static async getPocketsByEmail(email) {
    try {
      const response = await axios.get(`${API_URL}?email=${email}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch pockets by email');
    }
  }
}

export default PocketService;
