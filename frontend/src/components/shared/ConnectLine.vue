<template>
  <div>
    <button @click="linkWithLine" class="btn btn-success">เชื่อมบัญชี LINE</button>
    <div v-if="message" class="mt-2">{{ message }}</div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      message: ''
    }
  },
  methods: {
    async linkWithLine() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || (typeof process !== 'undefined' && process.env?.VITE_API_URL) || 'http://localhost:5000/api'
        const token = localStorage.getItem('token')
        if (!token) {
          this.message = 'กรุณาเข้าสู่ระบบก่อน'
          return
        }

        // 1) ขอ state สำหรับการเชื่อมบัญชีจาก backend (5 นาที)
        const { data } = await axios.post(`${API_URL}/auth/line/link-state`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const state = encodeURIComponent(data.state)
        const clientId = import.meta.env.VITE_LINE_CHANNEL_ID
        const redirectUri = encodeURIComponent(import.meta.env.VITE_LINE_REDIRECT_URI)

        // 2) เด้งไป LINE OAuth พร้อม state สำหรับเชื่อม
        const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`
        window.location.href = lineLoginUrl
      } catch (err) {
        console.error('linkWithLine error', err)
        this.message = err.response?.data?.error || 'เกิดข้อผิดพลาดในการเชื่อมบัญชี LINE'
      }
    }
  }
}
</script>