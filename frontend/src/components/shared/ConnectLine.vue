<template>
  <div>
    <input class="form-control" v-model="lineUserId" placeholder="กรอก LINE userId" />
    <button @click="connectLine" class="btn btn-primary">เชื่อมบัญชี LINE</button>
    <div v-if="message">{{ message }}</div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      lineUserId: '',
      message: ''
    }
  },
  methods: {
    async connectLine() {
      try {
        const res = await axios.post('/api/lineuser/connect', { lineUserId: this.lineUserId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.message = 'เชื่อมบัญชี LINE สำเร็จ!'
      } catch (err) {
        this.message = err.response?.data?.error || 'เกิดข้อผิดพลาด'
      }
    }
  }
}
</script>