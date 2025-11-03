<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="text-center mb-4">Register</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">Username</label>
          <input
            type="text"
            v-model="username"
            class="form-control"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input
            type="email"
            v-model="email"
            class="form-control"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Password</label>
          <input
            type="password"
            v-model="password"
            class="form-control"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Confirm password</label>
          <input
            type="password"
            v-model="confirmPassword"
            class="form-control"
            required
          />
        </div>

        <div class="d-grid mb-3">
          <button type="submit" class="btn btn-primary" :disabled="isLoading || !isPasswordMatch">
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>
        </div>

        <div class="d-grid mb-3">
          <button type="button" @click="loginWithLine" class="btn btn-success">
            Register with LINE
          </button>
        </div>

        <p class="text-center">
          Already have an account? 
          <router-link to="/login">Sign in</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'

export default {
  name: 'Register',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const username = ref('')
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const isLoading = ref(false)

    const isPasswordMatch = computed(() => {
      return password.value === confirmPassword.value
    })

    const loginWithLine = () => {
      const clientId = import.meta.env.VITE_LINE_CHANNEL_ID
      const redirectUri = encodeURIComponent(import.meta.env.VITE_LINE_REDIRECT_URI)
      const state = Math.random().toString(36).substring(2) // สร้าง state แบบสุ่ม
      const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`
      window.location.href = lineLoginUrl
    }

    const handleSubmit = async () => {
      if (!isPasswordMatch.value) {
        Swal.fire({
          icon: 'error',
          title: 'Passwords do not match',
          text: 'Please check your password again.'
        })
        return
      }

      try {
        isLoading.value = true
        await store.dispatch('register', {
          username: username.value,
          email: email.value,
          password: password.value
        })
        router.push('/dashboard')
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Unable to register'
        })
      } finally {
        isLoading.value = false
      }
    }

    onMounted(async () => {
      // Optional notice (can be removed in production)
      await Swal.fire({
        title: 'Heads up',
        text: 'The demo server may sleep. If registration doesn’t proceed, please wait ~1–2 minutes and try again.',
        icon: 'warning',
        confirmButtonText: 'Got it',
        confirmButtonColor: '#6c5ce7',
        showCancelButton: true,
        cancelButtonText: "Don't show again"
      }).then((result) => {
        if (result.isDismissed) {
          localStorage.setItem('suppressCategoryReminder', 'true')
        }
      })
    })

    return {
      username,
      email,
      password,
      confirmPassword,
      isLoading,
      isPasswordMatch,
      handleSubmit,
      loginWithLine
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
  padding: 1rem;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}
</style>
