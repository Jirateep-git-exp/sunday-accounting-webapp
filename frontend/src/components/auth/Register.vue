<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="text-center mb-4">สมัครสมาชิก</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">ชื่อผู้ใช้</label>
          <input
            type="text"
            v-model="username"
            class="form-control"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">อีเมล</label>
          <input
            type="email"
            v-model="email"
            class="form-control"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">รหัสผ่าน</label>
          <input
            type="password"
            v-model="password"
            class="form-control"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">ยืนยันรหัสผ่าน</label>
          <input
            type="password"
            v-model="confirmPassword"
            class="form-control"
            required
          />
        </div>

        <div class="d-grid mb-3">
          <button type="submit" class="btn btn-primary" :disabled="isLoading || !isPasswordMatch">
            {{ isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก' }}
          </button>
        </div>

        <p class="text-center">
          มีบัญชีอยู่แล้ว? 
          <router-link to="/login">เข้าสู่ระบบ</router-link>
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

    const handleSubmit = async () => {
      if (!isPasswordMatch.value) {
        Swal.fire({
          icon: 'error',
          title: 'รหัสผ่านไม่ตรงกัน',
          text: 'กรุณาตรวจสอบรหัสผ่านอีกครั้ง'
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
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถสมัครสมาชิกได้'
        })
      } finally {
        isLoading.value = false
      }
    }

    onMounted(async () => {
      // First notification for category reminder
      await Swal.fire({
        title: 'ขออภัย',
        text: 'เนื่องจาก Server ของเราอยู่ในช่วงทดลองใช้งาน หากท่านพบเจอปัญหาในการกดปุ่มเข้าสู่ระบบหรือปุ่มสมัครสมาชิกแล้วหน้าเว็บไม่ดำเนินการต่อให้ กรุณารอสักครู่ประมาณ 1-2 นาที เนื่องจาก Server ได้ทำการ Sleep ไว้เพื่อประหยัดทรัพยากร ขอออภัยในความไม่สะดวก',
        icon: 'warning',
        confirmButtonText: 'ทราบแล้ว',
        confirmButtonColor: '#6c5ce7',
        showCancelButton: true,
        cancelButtonText: 'ไม่ต้องเตือนอีก'
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
      handleSubmit
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
