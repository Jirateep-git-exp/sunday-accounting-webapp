<template>
  <div>กำลังเข้าสู่ระบบด้วย LINE...</div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()

    onMounted(async () => {
      const token = route.query.token

      if (token) {
        // ✅ เก็บลง localStorage
        localStorage.setItem('token', token)
        // ✅ commit เข้าสตอร์
        store.commit('setToken', token)

        // ✅ ไปหน้า dashboard
        router.push('/dashboard')
      } else {
        console.error('❌ No token found in query parameters')
        router.push('/login')
      }
    })
  }
}
</script>
