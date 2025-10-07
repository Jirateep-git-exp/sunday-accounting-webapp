<template>
  <div>กำลังเข้าสู่ระบบด้วย LINE...</div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()

    onMounted(async () => {
      const token = route.query.token
      const linked = route.query.linked === 'true'
      const error = route.query.error

      if (error === 'lineid_in_use') {
        await Swal.fire({
          icon: 'error',
          title: 'เชื่อมบัญชีไม่สำเร็จ',
          text: 'LINE นี้มีการใช้งานในระบบแล้ว กรุณาใช้บัญชีไลน์อื่น',
          confirmButtonText: 'ไปหน้า ตั้งค่า'
        })
        return router.replace('/settings')
      }

      if (linked) {
        // กรณีเชื่อมบัญชีสำเร็จ (ผู้ใช้ล็อกอินอยู่แล้ว) แค่รีโหลดข้อมูล
        try {
          await Promise.all([
            store.dispatch('fetchPockets'),
            store.dispatch('fetchIncome'),
            store.dispatch('fetchExpenses')
          ])
        } catch (e) {}
        return router.push('/dashboard')
      }

      if (token) {
        // ✅ บันทึก token อย่างปลอดภัยและตั้งค่า expiry (6 ชั่วโมง)
        store.commit('setToken', token)
        const expireAt = Date.now() + 6 * 60 * 60 * 1000
        localStorage.setItem('token_expire_at', String(expireAt))

        // ✅ โหลดข้อมูลหลักก่อนค่อยนำทาง (ลดจอว่างและปัญหา 401 แรกเริ่ม)
        try {
          await Promise.all([
            store.dispatch('fetchPockets'),
            store.dispatch('fetchIncome'),
            store.dispatch('fetchExpenses')
          ])
        } catch (e) {
          // หากโหลดไม่ได้ ให้ล้างสถานะและกลับไปหน้า login
          store.commit('setToken', null)
          store.commit('setUser', null)
          localStorage.removeItem('token_expire_at')
          return router.push('/login')
        }

        router.push('/dashboard')
      } else {
        console.error('❌ No token found in query parameters')
        router.push('/login')
      }
    })
  }
}
</script>
