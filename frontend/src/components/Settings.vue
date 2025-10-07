<template>
  <div class="container py-4">
    <h2 class="mb-4">การตั้งค่า</h2>
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">โปรไฟล์</h5>
        <div class="row g-2">
          <div class="col-md-6">
            <label class="form-label">ชื่อผู้ใช้</label>
            <input class="form-control" v-model="username" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Avatar URL</label>
            <input class="form-control" v-model="avatar" />
          </div>
        </div>
        <button class="btn btn-primary mt-3" @click="saveProfile" :disabled="saving">
          {{ saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์' }}
        </button>
      </div>
    </div>

    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">เชื่อมบัญชี LINE</h5>
        <p v-if="lineLinked">
          เชื่อมกับ LINE แล้ว
          <button class="btn btn-outline-danger ms-2" @click="unlinkLine" :disabled="saving">ยกเลิกการเชื่อม</button>
        </p>
        <div v-else>
          <button class="btn btn-success" @click="linkWithLine" :disabled="saving">เชื่อมบัญชี LINE</button>
        </div>
      </div>
    </div>

    <div class="card" v-if="!isLineOnly">
      <div class="card-body">
        <h5 class="card-title">เปลี่ยนรหัสผ่าน</h5>
        <div class="row g-2">
          <div class="col-md-6">
            <label class="form-label">รหัสเดิม</label>
            <input class="form-control" v-model="currentPassword" type="password" />
          </div>
          <div class="col-md-6">
            <label class="form-label">รหัสใหม่</label>
            <input class="form-control" v-model="newPassword" type="password" />
          </div>
        </div>
        <button class="btn btn-warning mt-3" @click="changePassword" :disabled="saving">เปลี่ยนรหัสผ่าน</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import { onMounted, ref, computed } from 'vue'

export default {
  name: 'Settings',
  setup() {
    const API_URL = import.meta.env.VITE_API_URL || (typeof process !== 'undefined' && process.env?.VITE_API_URL) || 'http://localhost:5000/api'
  const profile = ref(null)
    const username = ref('')
    const avatar = ref('')
    const saving = ref(false)
    const currentPassword = ref('')
    const newPassword = ref('')
    const lineLinked = computed(() => !!profile.value?.lineUserId)
    const isLineOnly = computed(() => {
      const email = profile.value?.email || ''
      return /@line\.local$/i.test(email)
    })

    const fetchMe = async () => {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API_URL}/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      profile.value = data
      username.value = data.username || ''
      avatar.value = data.avatar || ''
    }

    const saveProfile = async () => {
      try {
        saving.value = true
        const token = localStorage.getItem('token')
        const { data } = await axios.put(`${API_URL}/profile/me`, { username: username.value, avatar: avatar.value }, { headers: { Authorization: `Bearer ${token}` } })
        profile.value = data
      } finally {
        saving.value = false
      }
    }

    const linkWithLine = async () => {
      const token = localStorage.getItem('token')
      const { data } = await axios.post(`${API_URL}/auth/line/link-state`, {}, { headers: { Authorization: `Bearer ${token}` } })
      const state = encodeURIComponent(data.state)
      const clientId = import.meta.env.VITE_LINE_CHANNEL_ID
      const redirectUri = encodeURIComponent(import.meta.env.VITE_LINE_REDIRECT_URI)
      const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`
      window.location.href = lineLoginUrl
    }

    const unlinkLine = async () => {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'ยืนยันการยกเลิกการเชื่อม LINE?',
        text: 'หลังจากยกเลิกแล้ว ระบบ LINE OA จะไม่สามารถบันทึกข้อมูลเข้าบัญชีนี้ได้จนกว่าจะเชื่อมใหม่',
        showCancelButton: true,
        confirmButtonText: 'ยกเลิกการเชื่อม',
        cancelButtonText: 'กลับ',
        confirmButtonColor: '#d33'
      })
      if (!result.isConfirmed) return

      try {
        saving.value = true
        const token = localStorage.getItem('token')
        await axios.post(`${API_URL}/profile/me/unlink-line`, {}, { headers: { Authorization: `Bearer ${token}` } })
        await fetchMe()
        await Swal.fire({ icon: 'success', title: 'ยกเลิกการเชื่อมสำเร็จ', timer: 1200, showConfirmButton: false })
      } catch (e) {
        await Swal.fire({ icon: 'error', title: 'ไม่สามารถยกเลิกการเชื่อมได้', text: e.response?.data?.error || 'เกิดข้อผิดพลาด' })
      } finally {
        saving.value = false
      }
    }

    const changePassword = async () => {
      try {
        saving.value = true
        const token = localStorage.getItem('token')
        await axios.put(`${API_URL}/profile/me/password`, { currentPassword: currentPassword.value, newPassword: newPassword.value }, { headers: { Authorization: `Bearer ${token}` } })
        currentPassword.value = ''
        newPassword.value = ''
        alert('เปลี่ยนรหัสผ่านสำเร็จ')
      } catch (e) {
        alert(e.response?.data?.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
      } finally {
        saving.value = false
      }
    }

    onMounted(fetchMe)

    return { username, avatar, saving, currentPassword, newPassword, lineLinked, isLineOnly, saveProfile, linkWithLine, unlinkLine, changePassword }
  }
}
</script>

<style scoped>
.container { max-width: 900px; }
</style>
