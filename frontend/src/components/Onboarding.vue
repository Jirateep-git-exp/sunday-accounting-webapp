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
        // redirect to dashboard after success
        this.$router.push({ name: 'Dashboard' })
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
.onboard { padding: 16px }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px }
.card { border: 1px solid #ccc; padding: 12px; border-radius: 8px; cursor: pointer }
.card.selected { border-color: #4F46E5; box-shadow: 0 0 0 2px rgba(79,70,229,0.2) }
.name { font-weight: 600 }
.type { font-size: 12px; color: #666; margin-bottom: 8px }
.rename { width: 100%; padding: 6px }
.actions { margin-top: 12px }
.primary { background: #4F46E5; color: white; border: none; padding: 10px 16px; border-radius: 6px; }
/* Custom modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000 }
.modal { background: #fff; padding: 16px; border-radius: 8px; width: 90%; max-width: 420px }
.modal h3 { margin-top: 0 }
.modal .row { display: flex; gap: 8px; margin-top: 8px }
.modal input { flex: 1; padding: 8px }
.modal .btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px }
.card.add { display: flex; align-items: center; gap: 8px; justify-content: center; color: #4F46E5; border-style: dashed }
.card .icon { font-size: 20px; margin-bottom: 6px }
</style>
