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
      const isFirst = route.query.first === 'true'
      const addFriendUrl = typeof route.query.addfriend === 'string' && route.query.addfriend
        ? decodeURIComponent(route.query.addfriend)
        : null

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

        // ✅ กรณีล็อกอินด้วย LINE ครั้งแรกและมีลิงก์เพิ่มเพื่อน ให้แจ้งผู้ใช้ก่อนนำทาง
        if (isFirst && addFriendUrl) {
          try {
            const result = await Swal.fire({
              icon: 'info',
              title: 'ยินดีต้อนรับ!',
              html: 'เพื่อรับการแจ้งเตือนและใช้งานผ่าน LINE ได้เต็มที่ กรุณาเพิ่มเพื่อน LINE Official ของเรา',
              confirmButtonText: 'เพิ่มเพื่อน LINE OA',
              cancelButtonText: 'ข้ามตอนนี้',
              showCancelButton: true,
            })
            if (result.isConfirmed) {
              // เปิดในแท็บใหม่เพื่อไม่ขัดจังหวะโฟลว์ของแอป
              window.open(addFriendUrl, '_blank', 'noopener')
            }
          } catch (e) {
            // เฉยๆ หาก Swal มีปัญหา ไม่ให้บล็อคการเข้าใช้งาน
          }
        }

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
