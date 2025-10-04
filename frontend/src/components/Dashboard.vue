<template>
  <div class="dashboard container-fluid">
    <!-- Greeting Section -->
    <div class="greeting-section mb-4">
      <h2>{{ greeting }}, {{ currentDay }}!</h2>
    </div>

    <!-- Overview Cards -->
    <div class="row g-4">
      <div class="col-12 col-md-6 col-lg-4">
        <div class="overview-card h-100">
          <div class="card-content">
            <div class="card-icon income">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
            <div class="card-info">
              <h3>รายรับทั้งหมด</h3>
              <h2>{{ filteredTotalIncome }} ฿</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <div class="overview-card h-100">
          <div class="card-content">
            <div class="card-icon expenses">
              <i class="bi bi-graph-down-arrow"></i>
            </div>
            <div class="card-info">
              <h3>รายจ่ายทั้งหมด</h3>
              <h2>{{ filteredTotalExpenses }} ฿</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <div class="overview-card h-100">
          <div class="card-content">
            <div class="card-icon balance">
              <i class="bi bi-wallet2"></i>
            </div>
            <div class="card-info">
              <h3>เงินคงเหลือ</h3>
              <h2>{{ filteredBalance }} ฿</h2>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="row g-4 mt-4">
      <!-- Calendar Column -->
        <div class="col-12 col-lg-4 order-2 order-lg-1">
          <div class="card-body calendar-wrapper">
            <Calendar v-model:selectedDate="selectedDate" />
          </div>
      </div>

      <!-- Transaction Form Column -->
      <div class="col-12 col-md-6 col-lg-4 order-1 order-md-2">
        <div class="h-100">
          <div class="mt-3 px-3 pb-3">
              <button class="btn button-outline w-100" @click="showMultipleModal = true">
                <i class="fa-solid fa-layer-group me-2"></i>
                เพิ่มหลายรายการ
              </button>
          </div>

          <div class="">
            <transaction-form 
              :selected-date="selectedDate"
              @transaction-added="handleTransaction" 
            />
          </div>
        </div>
      </div>

      <!-- Recent Transactions Column -->
      <div class="col-12 col-lg-4 order-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="transactions-header">
              <h3>รายการล่าสุด</h3>
              <div class="tabs">
                <button 
                  :class="['tab-btn', { active: activeTab === 'income' }]"
                  @click="activeTab = 'income'"
                >
                  รายรับ
                </button>
                <button 
                  :class="['tab-btn', { active: activeTab === 'expenses' }]"
                  @click="activeTab = 'expenses'"
                >
                  รายจ่าย
                </button>
              </div>
            </div>
            
            <div class="transactions-list" v-if="activeTab === 'income'">
              <template v-for="(entry, idx) in recentIncome" :key="entry.id">
                <div class="transaction-item">
                  <div class="transaction-info">
                    <span class="description">{{ entry.description }}</span>
                    <span class="date">{{ formatDate(entry.date) }}</span>
                  </div>
                  <span class="amount income">+{{ entry.amount }} ฿</span>
                </div>
                <hr v-if="idx < recentIncome.length - 1" class="transaction-divider" />
              </template>
            </div>

            <div class="transactions-list" v-else>
              <template v-for="(entry, idx) in recentExpenses" :key="entry.id">
                <div class="transaction-item">
                  <div class="transaction-info">
                    <span class="description">{{ entry.description }}</span>
                    <span class="date">{{ formatDate(entry.date) }}</span>
                  </div>
                  <span class="amount expenses">-{{ entry.amount }} ฿</span>
                </div>
                <hr v-if="idx < recentExpenses.length - 1" class="transaction-divider" />
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Multiple Transactions Modal -->
    <div v-if="showMultipleModal" class="sa-modal-overlay" @click.self="showMultipleModal = false">
      <div class="sa-modal-container">
        <div class="sa-modal-header">
          <h3>เพิ่มรายการหลายรายการ</h3>
          <button class="btn btn-outline btn-sm btn-danger" @click="showMultipleModal = false" aria-label="Close">X</button>
        </div>
        <div class="sa-modal-body">
          <multiple-transaction-form
            :selected-date="selectedDate"
            @transactions-added="onMultipleTransactionsAdded"
            @cancel="showMultipleModal = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import Calendar from './shared/Calendar.vue'
import TransactionForm from './shared/TransactionForm.vue'
import MultipleTransactionForm from './shared/MultipleTransactionForm.vue'
import Swal from 'sweetalert2'

export default {
  name: 'Dashboard',
  components: {
    Calendar,
    TransactionForm,
    MultipleTransactionForm
  },
  setup() {
    const store = useStore()
    const selectedDate = ref(new Date())
    const activeTab = ref('income')
    const selectedPocket = ref(null)
    const showMultipleModal = ref(false)
    
    const isInSelectedMonth = (date) => {
      const transactionDate = new Date(date)
      return (
        transactionDate.getMonth() === selectedDate.value.getMonth() &&
        transactionDate.getFullYear() === selectedDate.value.getFullYear()
      )
    }
    
    const filteredIncome = computed(() => {
      return store.state.income.filter(income => isInSelectedMonth(income.date))
    })
    
    const filteredExpenses = computed(() => {
      return store.state.expenses.filter(expense => isInSelectedMonth(expense.date))
    })
    
    // แก้ไขการคำนวณยอดรวมให้ใช้ข้อมูลที่กรองตามเดือน
    const filteredTotalIncome = computed(() => {
      return filteredIncome.value.reduce((total, entry) => total + Number(entry.amount), 0)
    })
    
    const filteredTotalExpenses = computed(() => {
      return filteredExpenses.value.reduce((total, entry) => total + Number(entry.amount), 0)
    })
    
    const filteredBalance = computed(() => {
      return filteredTotalIncome.value - filteredTotalExpenses.value
    })

    const recentIncome = computed(() => {
      return [...store.state.income]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    })

    const recentExpenses = computed(() => {
      return [...store.state.expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    })

    const handleTransaction = async (transaction) => {
      try {

        const newTransaction = {
          amount: Number(transaction.amount),
          description: transaction.description,
          date: transaction.date || new Date().toISOString(),
          pocketId: selectedPocket.value?._id // Using MongoDB _id (safe optional chaining)
        }

        // Using store actions that connect to MongoDB
        if (transaction.type === 'income') {
          await store.dispatch('addIncome', newTransaction)
        } else {
          await store.dispatch('addExpense', newTransaction)
        }

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Transaction added successfully'
        })
      } catch (error) {
        console.error('Error adding transaction:', error)
      }
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('th-TH')
    }

    // Random Greetings Array
    const greetings = [
      "Good day",
      "Welcome back",
      "Hello",
      "Hi there",
      "Greetings",
      "Nice to see you"
    ]

    // Random Greeting
    const greeting = computed(() => {
      const randomIndex = Math.floor(Math.random() * greetings.length)
      return greetings[randomIndex]
    })

    // Current Day
    const currentDay = computed(() => {
      const days = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
        'Thursday', 'Friday', 'Saturday'
      ]
      const today = new Date()
      return days[today.getDay()]
    })

    const onMultipleTransactionsAdded = () => {
      showMultipleModal.value = false
    }

    onMounted(async () => {
      // First notification for category reminder
      if (!localStorage.getItem('suppressCategoryReminder')) {
        await Swal.fire({
          title: 'เริ่มต้นใช้งาน',
          text: 'อย่าลืมสร้างหมวดหมู่รายรับ-รายจ่ายก่อนเริ่มใช้งานนะคะ',
          icon: 'info',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#6c5ce7',
          showCancelButton: true,
          cancelButtonText: 'ไม่ต้องเตือนอีก',
          footer: '<a href="/cloudpocket">ไปที่หน้าหมวดหมู่</a>'
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
            localStorage.setItem('suppressCategoryReminder', 'true')
          }
        })
      }
    })

    return {
      selectedDate,
      filteredTotalIncome,
      filteredTotalExpenses,
      filteredBalance,
      totalIncome: computed(() => store.getters.totalIncome),
      totalExpenses: computed(() => store.getters.totalExpenses),
      balance: computed(() => store.getters.balance),
      recentIncome,
      recentExpenses,
      handleTransaction,
      activeTab,
      formatDate,
      greeting,
      currentDay,
      selectedPocket,
      showMultipleModal,
      onMultipleTransactionsAdded
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.greeting-section {
  border-radius: var(--border-radius);
  padding: 1rem 0;
  margin-bottom: 2rem;
  text-align: start;
}

.greeting-section h2 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--text-color);
  font-weight: 600;
}

.overview-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  height: 100%;
  transition: transform 0.2s ease;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.card-icon.income {
  background: #e1f8e9;
  color: #00c853;
}

.card-icon.expenses {
  background: #fbe9e7;
  color: #ff3d00;
}

.card-icon.balance {
  background: #e3f2fd;
  color: #2196f3;
}

.card-info {
  flex-grow: 1;
}

.card-info h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-light);
}

.card-info h2 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: var(--background-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: var(--primary-color);
  color: white;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.transaction-info {
  display: flex;
  flex-direction: column;
}

.description {
  font-weight: 500;
}

.date {
  font-size: 0.875rem;
  color: var(--text-light);
}

.amount {
  font-weight: 600;
}

.amount.income {
  color: #00c853;
}

.amount.expenses {
  color: #ff3d00;
}

.transaction-divider {
  border: none;
  border-top: 2px solid #bdbdbd;
  margin: 0.5rem 0 0 0;
  width: 100%;
  align-self: center;
  opacity: 0.8;
}

.calendar-wrapper {
  position: sticky;
  top: 1rem;
  z-index: 2;
}

/* Simple modal styles */
.sa-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1050;
}

.sa-modal-container {
  width: min(900px, 100%);
  max-height: 90vh;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.sa-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #eaeaea;
}

.sa-modal-body {
  padding: 1rem 1.25rem 1.25rem 1.25rem;
}

/* .sa-close-btn {
  background: red;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-light);
} */

.button-outline {
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  background: transparent;
  transition: all 0.2s ease;
}

.button-outline:hover {
  background: var(--primary-color);
  color: white;
}

@media (max-width: 768px) {
  .overview-card {
    padding: 1rem;
  }

  .card-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }

  .card-info h2 {
    font-size: 1.25rem;
  }

  .transactions-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .tabs {
    width: 100%;
  }

  .tab-btn {
    flex: 1;
    text-align: center;
  }

  .calendar-wrapper {
    position: static;
  }

  .greeting-section h2 {
    font-size: 1.5rem;
  }
}
</style>