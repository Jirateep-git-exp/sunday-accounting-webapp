<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="text-center mb-4">เข้าสู่ระบบ</h2>
      <form @submit.prevent="handleSubmit">
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

        <div class="d-grid mb-3">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </div>

        <p class="text-center">
          ยังไม่มีบัญชี? 
          <router-link to="/register">สมัครสมาชิก</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const email = ref('')
    const password = ref('')
    const isLoading = ref(false)

    const handleSubmit = async () => {
      try {
        isLoading.value = true
        await store.dispatch('login', {
          email: email.value,
          password: password.value
        })
        router.push('/dashboard')
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถเข้าสู่ระบบได้'
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
        if (result.dismiss === Swal.DismissReason.cancel) {
            localStorage.setItem('suppressCategoryReminder', 'true')
        }
      })
    })

    return {
      email,
      password,
      isLoading,
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
