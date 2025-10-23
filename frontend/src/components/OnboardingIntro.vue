<template>
  <div class="intro">
    <div class="hero">
      <h1>เริ่มใช้งาน Cloud Pocket ได้ในไม่กี่นาที</h1>
      <p class="sub">จดรายรับ-รายจ่ายผ่าน LINE แล้วให้ระบบจัดหมวดให้อัตโนมัติ</p>
    </div>

    <div class="steps">
      <div class="step">
        <span class="badge">1</span>
        <div>
          <h3>จดใน LINE</h3>
          <p>พิมพ์เช่น “มาม่า100” หรือ “เงินเดือน25000”</p>
        </div>
      </div>
      <div class="step">
        <span class="badge">2</span>
        <div>
          <h3>จัดหมวดอัตโนมัติ</h3>
          <p>ระบบจะเดาหมวดจากคำที่พิมพ์อัตโนมัติ</p>
        </div>
      </div>
      <div class="step">
        <span class="badge">3</span>
        <div>
          <h3>ตั้งค่าหมวดครั้งแรก</h3>
          <p>ใช้เวลาไม่เกิน 5 นาที เลือก Pocket ที่ต้องการ</p>
        </div>
      </div>
    </div>

    <div class="cta">
      <button class="primary" @click="go()">เริ่มเลือกหมวด (รายรับ)</button>
    </div>
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
.intro { padding: 28px; max-width: 980px; margin: 0 auto }
.hero h1 { font-size: 32px; margin: 0 0 6px; font-weight: 900 }
.sub { color: #6b7280; margin: 0 0 18px }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-top: 10px }
.step { display: flex; gap: 12px; align-items: flex-start; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px }
.badge { width: 28px; height: 28px; border-radius: 50%; background: #EEF2FF; color: #4F46E5; display: inline-flex; align-items: center; justify-content: center; font-weight: 800 }
.cta { display: flex; gap: 10px; margin-top: 18px }
.primary { background: linear-gradient(135deg,#4F46E5,#6366F1); color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600 }
.ghost { background: transparent; border: 1px solid #e5e7eb; padding: 10px 16px; border-radius: 8px }
</style>