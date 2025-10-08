<template>
  <div class="intro">
    <h2>ยินดีต้อนรับสู่ Cloud Pocket</h2>
    <ol>
      <li>จดรายการใน LINE ได้เลย เช่น "มาม่า100" หรือ "เงินเดือน25000"</li>
      <li>ระบบจะจัดหมวดหมู่ให้จากคำที่พิมพ์อัตโนมัติ (ปรับคำดักได้ภายหลัง)</li>
      <li>ก่อนเริ่ม ใช้เวลา 1 นาที เลือกหมวด (Pocket) ที่ต้องการใช้งาน</li>
    </ol>
    <button class="primary" @click="go()">เริ่มเลือกหมวด (รายรับ)</button>
  </div>
</template>

<script>
export default {
  methods: {
    go() { this.$router.push({ name: 'Onboarding', query: { step: 'income' } }) }
  }
}
</script>

<style scoped>
.intro { padding: 16px }
ol { margin: 12px 0 20px 18px }
.primary { background: #4F46E5; color: white; border: none; padding: 10px 16px; border-radius: 6px }
</style>