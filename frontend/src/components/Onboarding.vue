<template>
  <div class="onboard">
    <h2>ตั้งค่า Pocket เริ่มต้น</h2>
    <p class="hint">ขั้นตอน {{ step === 'income' ? '1/2 เลือกหมวดรายรับ' : '2/2 เลือกหมวดรายจ่าย' }}</p>
    <div class="grid">
        <div v-for="p in filteredPresets" :key="p.name + p.type" class="card" :class="{ selected: selectedIds.has(keyOf(p)) }" @click="toggle(p)">
          <div class="icon" v-if="p.icon"><i :class="p.icon"></i></div>
          <div class="name">{{ p.name }}</div>
          <div class="type">{{ p.type === 'income' ? 'รายรับ' : 'รายจ่าย' }}</div>
        </div>
        <!-- Custom add card -->
        <div class="card add" @click="openCustomModal">
          <div class="icon"><i class="fa-solid fa-plus"></i></div>
          <div class="name">เพิ่มหมวดหมู่เอง</div>
          <div class="type">กำหนดชื่อเองตามต้องการ</div>
        </div>
    </div>
    <div class="actions">
      <button v-if="step === 'income'" class="primary" @click="next" :disabled="loading">ดำเนินการต่อ (รายจ่าย)</button>
      <button v-else class="primary" @click="createAll" :disabled="loading">สร้าง Pocket ทั้งหมด</button>
    </div>
    <p v-if="msg">{{ msg }}</p>

    <!-- Custom modal -->
    <div v-if="showCustom" class="modal-overlay" @click.self="closeCustomModal">
      <div class="modal">
        <h3>เพิ่มหมวดหมู่เอง ({{ step === 'income' ? 'รายรับ' : 'รายจ่าย' }})</h3>
        <div class="row">
          <input v-model="customName" placeholder="เช่น อาหาร/ค่าเช่า/เงินเดือน" />
        </div>
        <div class="btns">
          <button @click="closeCustomModal">ยกเลิก</button>
          <button class="primary" @click="addCustom">เพิ่ม</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return { presets: [], selectedIds: new Set(), loading: false, msg: '', step: 'income', showCustom: false, customName: '' }
  },
  computed: {
    api() { return import.meta.env.VITE_API_URL || (typeof process !== 'undefined' && process.env?.VITE_API_URL) || 'http://localhost:5000/api' },
    filteredPresets() { return this.presets.filter(p => p.type === this.step) }
  },
  methods: {
    keyOf(p) { return `${p.type}:${p.name}` },
    openCustomModal() { this.customName = ''; this.showCustom = true },
    closeCustomModal() { this.showCustom = false },
    async addCustom() {
      const name = (this.customName || '').trim()
      if (!name) { this.msg = 'กรุณากรอกชื่อหมวด'; return }
      // Add a temporary local preset to the selection with current step type
      const type = this.step
      const temp = { name, type, icon: type === 'income' ? 'fa-solid fa-sack-dollar' : 'fa-solid fa-cart-shopping' }
      this.presets.push(temp)
      this.selectedIds.add(this.keyOf(temp))
      this.selectedIds = new Set(this.selectedIds)
      this.showCustom = false
    },
    toggle(p) {
      const k = this.keyOf(p)
      if (this.selectedIds.has(k)) this.selectedIds.delete(k)
      else this.selectedIds.add(k)
      this.selectedIds = new Set(this.selectedIds)
    },
    async fetchPresets() {
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get(`${this.api}/pockets/presets/default`, { headers: { Authorization: `Bearer ${token}` } })
        this.presets = data
      } catch (e) { this.msg = 'โหลด presets ไม่สำเร็จ' }
    },
    next() {
      // require at least one income
      const chosen = this.presets.filter(p => p.type === 'income' && this.selectedIds.has(this.keyOf(p)))
      if (!chosen.length) { this.msg = 'กรุณาเลือกหมวดรายรับอย่างน้อย 1 หมวด'; return }
      this.step = 'expense'
      this.msg = ''
    },
    async createAll() {
      try {
        this.loading = true; this.msg = ''
        const token = localStorage.getItem('token')
        const chosen = this.presets.filter(p => this.selectedIds.has(this.keyOf(p)))
        if (!chosen.length) { this.msg = 'กรุณาเลือกหมวดอย่างน้อย 1 หมวด'; this.loading = false; return }
  const payload = chosen.map(p => ({ type: p.type, name: p.name }))
        const { data } = await axios.post(`${this.api}/pockets/bulk`, { pockets: payload }, { headers: { Authorization: `Bearer ${token}` } })
        this.msg = `สร้าง ${data.length} หมวดสำเร็จ`
        // redirect to dashboard after success (skip redirect in debug mode)
        if (this.$route.query.debug !== '1') {
          this.$router.push({ name: 'Dashboard' })
        }
      } catch (e) { this.msg = e.response?.data?.error || 'สร้างไม่สำเร็จ' }
      finally { this.loading = false }
    }
  },
  mounted() {
    this.fetchPresets()
    const stepQ = this.$route.query.step
    if (stepQ === 'income' || stepQ === 'expense') this.step = stepQ
  }
}
</script>

<style scoped>
.onboard { padding: 24px; max-width: 980px; margin: 0 auto }
.onboard h2 { font-size: 28px; margin: 0 0 6px; font-weight: 800; letter-spacing: .2px }
.hint { color: #6b7280; margin-bottom: 16px }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px }
.card { border: 1px solid #e5e7eb; padding: 14px; border-radius: 12px; cursor: pointer; background: #fff; transition: box-shadow .15s ease, transform .08s ease }
.card:hover { box-shadow: 0 6px 18px rgba(0,0,0,.06); transform: translateY(-1px) }
.card.selected { border-color: #4F46E5; box-shadow: 0 0 0 2px rgba(79,70,229,0.25), 0 10px 24px rgba(79,70,229,0.12) }
.name { font-weight: 700; margin-bottom: 2px }
.type { font-size: 12px; color: #6b7280; margin-bottom: 8px }
.rename { width: 100%; padding: 8px }
.actions { margin-top: 16px }
.actions .count { color: #6b7280; margin-bottom: 8px }
.primary { background: linear-gradient(135deg,#4F46E5,#6366F1); color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600 }
/* Custom modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000 }
.modal { background: #fff; padding: 18px; border-radius: 12px; width: 92%; max-width: 460px; box-shadow: 0 12px 32px rgba(0,0,0,0.15) }
.modal h3 { margin-top: 0 }
.modal .row { display: flex; gap: 10px; margin-top: 10px }
.modal input { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px }
.modal .btns { display: flex; gap: 10px; justify-content: flex-end; margin-top: 14px }
.card.add { display: flex; align-items: center; gap: 8px; justify-content: center; color: #4F46E5; border-style: dashed; background: #f8fafc }
.card .icon { font-size: 22px; margin-bottom: 6px }
.tag { display: inline-block; margin-left: 6px; font-size: 10px; background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; border-radius: 999px; padding: 1px 6px; vertical-align: middle }
</style>
