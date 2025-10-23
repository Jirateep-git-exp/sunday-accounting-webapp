<template>
  <div class="edit-transaction">
    <h2 v-if="!modal" class="page-title">
      {{ isIncome ? 'Edit Income' : 'Edit Expense' }}
    </h2>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="!form" class="error">Transaction not found</div>
    <form v-else @submit.prevent="onSubmit" class="form">
      <div class="form-group">
        <label>Date</label>
        <input type="date" v-model="form.date" required />
      </div>
      <div class="form-group">
        <label>Category</label>
        <select v-model="form.pocketId" required>
          <option value="" disabled>Select category</option>
          <option v-for="p in pockets" :key="p._id" :value="p._id">
            {{ p.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Amount</label>
        <input type="number" v-model.number="form.amount" min="0" step="0.01" required />
      </div>
      <div class="form-group">
        <label>Notes</label>
        <input type="text" v-model="form.description" required />
      </div>

      <div class="actions">
        <button type="submit" class="btn btn-primary">Save Changes</button>
        <button type="button" class="btn btn-danger" @click="onDelete">Delete</button>
        <button type="button" class="btn" @click="goBack">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'

export default {
  props: {
    // เปิดโหมด modal (ไม่เปลี่ยน route หลังบันทึก/ลบ และสื่อสารผ่าน event)
    modal: { type: Boolean, default: false },
    // ใช้แทน route.params.type เมื่อ embed เป็น modal
    type: { type: String, default: null }, // 'income' | 'expense'
    // ใช้แทน route.params.id เมื่อ embed เป็น modal
    id: { type: String, default: null }
  },
  emits: ['saved', 'deleted', 'close'],
  setup(props, { emit }) {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const type = computed(() => {
      const t = props.type ?? route.params.type
      return t === 'income' ? 'income' : 'expense'
    })
    const isIncome = computed(() => type.value === 'income')
    const id = computed(() => props.id ?? route.params.id)

    const pockets = computed(() => isIncome.value ? store.getters.incomePockets : store.getters.expensePockets)

    const loading = ref(true)
    const form = ref(null)

    const API_URL = import.meta.env.VITE_API_URL || process.env.VITE_API_URL || 'http://localhost:5000/api'

    const load = async () => {
      loading.value = true
      try {
        // Try from store list first
        const fromStore = (isIncome.value ? store.state.income : store.state.expenses).find(t => t._id === id.value)
        if (fromStore) {
          form.value = toForm(fromStore)
        } else {
          const url = `${API_URL}/${isIncome.value ? 'income' : 'expenses'}/${id.value}`
          const { data } = await axios.get(url)
          form.value = toForm(data)
        }
      } catch (e) {
        console.error('Failed to load transaction', e)
        form.value = null
      } finally {
        loading.value = false
      }
    }

    const toForm = (tx) => ({
      date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      pocketId: tx.pocketId?._id || tx.pocketId || '',
      amount: Number(tx.amount || 0),
      description: tx.description || ''
    })

    const onSubmit = async () => {
      if (!form.value) return
      const payload = {
        date: new Date(form.value.date).toISOString(),
        pocketId: form.value.pocketId,
        amount: form.value.amount,
        description: form.value.description
      }
      try {
        if (isIncome.value) {
          await store.dispatch('updateIncome', { id: id.value, income: payload })
          await store.dispatch('fetchIncome')
          if (props.modal) emit('saved')
          else router.replace('/income')
        } else {
          await store.dispatch('updateExpense', { id: id.value, expense: payload })
          await store.dispatch('fetchExpenses')
          if (props.modal) emit('saved')
          else router.replace('/expenses')
        }
      } catch (e) {
        console.error('Update failed', e)
        alert('Failed to save. Please try again.')
      }
    }

    const onDelete = async () => {
      if (!confirm('Are you sure you want to delete this transaction?')) return
      try {
        if (isIncome.value) {
          await store.dispatch('deleteIncome', id.value)
          if (props.modal) emit('deleted')
          else router.replace('/income')
        } else {
          await store.dispatch('deleteExpense', id.value)
          if (props.modal) emit('deleted')
          else router.replace('/expenses')
        }
      } catch (e) {
        console.error('Delete failed', e)
        alert('Failed to delete. Please try again.')
      }
    }

    const goBack = () => {
      if (props.modal) {
        emit('close')
      } else {
        const target = isIncome.value ? '/income' : '/expenses'
        router.replace(target)
      }
    }

    onMounted(async () => {
      // Ensure pockets loaded for selector
      if (!store.state.pockets || store.state.pockets.length === 0) {
        try { await store.dispatch('fetchPockets') } catch {}
      }
      await load()
    })

    return { isIncome, pockets, loading, form, onSubmit, onDelete, goBack }
  }
}
</script>

<style scoped>
.edit-transaction { max-width: 520px; margin: 0 auto; background: #fff; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb }
.page-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem }
.form-group input, .form-group select { padding: 0.625rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px }
.actions { display: flex; gap: 0.5rem; margin-top: 0.5rem }
.btn { padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb; background: #f9fafb; cursor: pointer }
.btn-primary { background: #6c63ff; color: white; border-color: #6c63ff }
.btn-danger { background: #ef4444; color: white; border-color: #ef4444 }
.loading, .error { text-align: center; padding: 1rem }
</style>
