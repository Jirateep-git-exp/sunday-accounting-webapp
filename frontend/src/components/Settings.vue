<template>
  <div class="container py-4">
    <h2 class="mb-4">Settings</h2>
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">Profile</h5>
        <div class="row g-2">
          <div class="col-md-6">
            <label class="form-label">Username</label>
            <input class="form-control" v-model="username" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Avatar URL</label>
            <input class="form-control" v-model="avatar" />
          </div>
        </div>
        <button class="btn btn-primary mt-3" @click="saveProfile" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save profile' }}
        </button>
      </div>
    </div>

    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">Link LINE account</h5>
        <p v-if="lineLinked">
          Linked with LINE
          <button class="btn btn-outline-danger ms-2" @click="unlinkLine" :disabled="saving">Unlink</button>
        </p>
        <div v-else>
          <button class="btn btn-success" @click="linkWithLine" :disabled="saving">Link LINE account</button>
        </div>
      </div>
    </div>

    <div class="card" v-if="!isLineOnly">
      <div class="card-body">
        <h5 class="card-title">Change password</h5>
        <div class="row g-2">
          <div class="col-md-6">
            <label class="form-label">Current password</label>
            <input class="form-control" v-model="currentPassword" type="password" />
          </div>
          <div class="col-md-6">
            <label class="form-label">New password</label>
            <input class="form-control" v-model="newPassword" type="password" />
          </div>
        </div>
        <button class="btn btn-warning mt-3" @click="changePassword" :disabled="saving">Update password</button>
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
        title: 'Unlink LINE account?',
        text: 'After unlinking, the LINE OA will not be able to log to this account until linked again.',
        showCancelButton: true,
        confirmButtonText: 'Unlink',
        cancelButtonText: 'Back',
        confirmButtonColor: '#d33'
      })
      if (!result.isConfirmed) return

      try {
        saving.value = true
        const token = localStorage.getItem('token')
        await axios.post(`${API_URL}/profile/me/unlink-line`, {}, { headers: { Authorization: `Bearer ${token}` } })
        await fetchMe()
        await Swal.fire({ icon: 'success', title: 'Unlinked successfully', timer: 1200, showConfirmButton: false })
      } catch (e) {
        await Swal.fire({ icon: 'error', title: 'Unable to unlink', text: e.response?.data?.error || 'Something went wrong' })
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
        alert('Password updated')
      } catch (e) {
        alert(e.response?.data?.error || 'Failed to change password')
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
