<template>
  <div class="cloud-pocket container-fluid">
    <!-- Page Header -->
    <div class="section-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <h2>Cloud Pocket</h2>
      </div>
      <div class="d-flex flex-wrap align-items-center gap-3 mt-3">
        <div class="period-selector d-flex align-items-center gap-3">
          <div class="input-group month-select">
            <span class="input-group-text"><i class="fa-solid fa-calendar"></i></span>
            <select v-model="selectedMonth" class="form-select">
              <option v-for="(month, index) in months" :key="index" :value="index">
                {{ month }}
              </option>
            </select>
          </div>
          <div class="input-group year-select">
            <span class="input-group-text"><i class="fa-solid fa-calendar-days"></i></span>
            <select v-model="selectedYear" class="form-select">
              <option v-for="year in yearRange" :key="year" :value="year">
                {{ year + 543 }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="row g-4">
      <!-- Income Categories -->
      <div class="col-12 col-lg-6">
        <div class="pocket-section">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h3>หมวดหมู่รายรับ</h3>
            <button class="btn btn-primary" @click="showAddPocketModal('income')">
              + เพิ่มหมวดหมู่
            </button>
          </div>
          <div v-if="nonStandardPockets.length" class="alert alert-warning py-2 px-3 mb-3">
            พบหมวดหมู่กำหนดเอง {{ nonStandardPockets.length }} รายการ
            <button class="btn btn-sm btn-outline-dark ms-2" @click="openFirstNonStandard('income')">ปรับให้เป็นมาตรฐาน</button>
          </div>
          <div v-if="isLoading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">กำลังโหลดข้อมูล...</p>
          </div>
          <div v-else-if="incomePockets.length > 0">
            <div v-for="pocket in incomePockets" :key="pocket._id" class="pocket-card income"
              :class="{ 'multi-selected': isPocketSelected(pocket._id) }">
              <div class="pocket-content" @click="handlePocketClick(pocket)">
                <div class="pocket-icon">
                  <i :class="pocket.icon"></i>
                </div>
                <div class="pocket-info">
                  <h4>{{ pocket.name }}</h4>
                  <p class="amount">
                    {{ formatAmount(monthlyPocketTotal(pocket._id, 'income')) }} ฿
                  </p>
                </div>
              </div>
              <div class="pocket-actions">
                <button class="btn btn-sm btn-outline-primary" @click.stop="editPocket(pocket)" title="แก้ไข">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click.stop="deletePocket(pocket)" title="ลบ">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <p>ไม่พบหมวดหมู่รายรับ</p>
          </div>
        </div>
      </div>

      <!-- Expense Categories -->
      <div class="col-12 col-lg-6">
        <div class="pocket-section">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h3>หมวดหมู่รายจ่าย</h3>
            <button class="btn btn-primary" @click="showAddPocketModal('expense')">
              + เพิ่มหมวดหมู่
            </button>
          </div>
          <div v-if="nonStandardPockets.length" class="alert alert-warning py-2 px-3 mb-3">
            พบหมวดหมู่กำหนดเอง {{ nonStandardPockets.length }} รายการ
            <button class="btn btn-sm btn-outline-dark ms-2" @click="openFirstNonStandard('expense')">ปรับให้เป็นมาตรฐาน</button>
          </div>
          <div v-if="isLoading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">กำลังโหลดข้อมูล...</p>
          </div>
          <div v-else-if="expensePockets.length > 0">
            <div v-for="pocket in expensePockets" :key="pocket._id" class="pocket-card expense"
              :class="{ 'multi-selected': isPocketSelected(pocket._id) }">
              <div class="pocket-content" @click="handlePocketClick(pocket)">
                <div class="pocket-icon">
                  <i :class="pocket.icon"></i>
                </div>
                <div class="pocket-info">
                  <h4>{{ pocket.name }}</h4>
                  <p class="amount">
                    {{ formatAmount(monthlyPocketTotal(pocket._id, 'expense')) }} ฿
                  </p>
                </div>
              </div>
              <div class="pocket-actions">
                <button class="btn btn-sm btn-outline-primary" @click.stop="editPocket(pocket)" title="แก้ไข">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click.stop="deletePocket(pocket)" title="ลบ">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <p>ไม่พบหมวดหมู่รายจ่าย</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions Section -->
    <div ref="transactionsSection" class="row mt-4" v-if="selectedPocket">
      <div class="col-12">
        <div class="transaction-section">
          <!-- Transactions List -->
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th @click="sort('date')" style="cursor: pointer;">
                    วันที่
                    <i :class="getSortIcon('date')" class="ms-1"></i>
                  </th>
                  <th @click="sort('description')" style="cursor: pointer;">
                    รายละเอียด
                    <i :class="getSortIcon('description')" class="ms-1"></i>
                  </th>
                  <th class="text-end" @click="sort('amount')" style="cursor: pointer;">
                    จำนวนเงิน
                    <i :class="getSortIcon('amount')" class="ms-1"></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="transaction in paginatedData" :key="transaction._id">
                  <td>{{ formatDate(transaction.date) }}</td>
                  <td>{{ transaction.description }}</td>
                  <td :class="[
                    'text-end',
                    transaction.type === 'income' ? 'text-success' : 'text-danger'
                  ]">
                    {{ transaction.type === 'income' ? '+' : '-' }}
                    {{ Number(transaction.amount).toLocaleString() }} ฿
                  </td>
                </tr>
                <tr v-if="pocketTransactions.length === 0">
                  <td colspan="3" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox display-6 d-block mb-2"></i>
                    ไม่พบรายการ
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="pocketTransactions.length > 0">
                <tr>
                  <td colspan="2" class="text-end fw-bold">ยอดรวม:</td>
                  <td :class="['text-end fw-bold', pocketTotal >= 0 ? 'text-success' : 'text-danger']">
                    {{ Number(pocketTotal).toLocaleString() }} ฿
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
              <nav>
                <ul class="pagination pagination-sm">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="changePage(currentPage - 1)">
                      <i class="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  <li v-for="page in displayedPages" :key="page" class="page-item"
                    :class="{ active: currentPage === page }">
                    <button class="page-link" @click="changePage(page)">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="changePage(currentPage + 1)">
                      <i class="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
            
          </div>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="mb-0">
            เพิ่มหมวดหมู่{{ newPocketType === 'income' ? 'รายรับ' : 'รายจ่าย' }}
          </h3>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <form @submit.prevent="addNewPocket">
          <div class="modal-body">
            <div class="form-group mb-3">
              <label class="form-label">เลือกหมวดหมู่ (จากรายการมาตรฐาน)</label>
              <select v-model="newPocket.catalogId" class="form-select" required>
                <option disabled value="">-- เลือกหมวดหมู่ --</option>
                <option v-for="item in addOptions" :key="item.id" :value="item.id">
                  {{ item.nameTh }} ({{ item.nameEn }})
                </option>
              </select>
              <small v-if="addOptions.length === 0" class="text-muted">
                ไม่มีหมวดหมู่ให้เลือก โปรดรีเฟรชหน้า หากยังไม่แสดงระบบจะใช้รายการมาตรฐานในตัวคอมโพเนนต์
              </small>
            </div>
            <div class="form-group">
              <label class="form-label">ไอคอน</label>
              <div class="d-flex align-items-center gap-2">
                <div class="icon-preview"><i :class="selectedCatalogIcon"></i></div>
                <small class="text-muted">ระบบจะเลือกไอคอนตามหมวดหมู่มาตรฐานอัตโนมัติ</small>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeModal">
              ยกเลิก
            </button>
            <button type="submit" class="btn" :class="newPocketType === 'income' ? 'btn-success' : 'btn-danger'">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Category Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="mb-0">แก้ไขหมวดหมู่</h3>
          <button type="button" class="btn-close" @click="closeEditModal"></button>
        </div>
        <form @submit.prevent="updatePocket">
          <div class="modal-body">
            <div class="form-group mb-3">
              <label class="form-label">เลือกหมวดหมู่มาตรฐาน</label>
              <select v-model="editingCatalogId" class="form-select" required>
                <option disabled value="">-- เลือกหมวดหมู่ --</option>
                <option v-for="item in pocketCatalogByType(editingPocket?.type || 'expense')" :key="item.id" :value="item.id">
                  {{ item.nameTh }} ({{ item.nameEn }})
                </option>
              </select>
              <small class="text-muted">จะเปลี่ยนชื่อและไอคอนให้ตรงกับมาตรฐาน</small>
            </div>
            <div class="form-group">
              <label class="form-label">ไอคอน</label>
              <div class="d-flex align-items-center gap-2">
                <div class="icon-preview"><i :class="editingSelectedIcon"></i></div>
                <small class="text-muted">เลือกตามหมวดหมู่มาตรฐาน</small>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeEditModal">
              ยกเลิก
            </button>
            <button type="submit" class="btn btn-primary">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

export default {
  name: 'CloudPocket',
  components: {
    
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const selectedPocket = ref(null)
    const showModal = ref(false)
    const newPocketType = ref('income')
    const newPocket = ref({
      catalogId: '',
      icon: ''
    })
    const showEditModal = ref(false)
    const editingPocket = ref(null)
  const editingCatalogId = ref('')
    const isSelectMode = ref(false)
    const selectedPockets = ref([])
    const selectedDate = ref(new Date())
    const isLoading = ref(false)

    // Local fallback catalog in case the store doesn't provide one
    const defaultCatalog = ref([
      // Income
      { id: 'salary', type: 'income', nameTh: 'เงินเดือน', nameEn: 'Salary', icon: 'fa-solid fa-sack-dollar' },
      { id: 'bonus', type: 'income', nameTh: 'โบนัส', nameEn: 'Bonus', icon: 'fa-solid fa-hand-holding-dollar' },
      { id: 'side-income', type: 'income', nameTh: 'รายได้พิเศษ', nameEn: 'Side income', icon: 'fa-solid fa-piggy-bank' },
      { id: 'interest', type: 'income', nameTh: 'ดอกเบี้ย', nameEn: 'Interest', icon: 'fa-solid fa-building-columns' },
      { id: 'investment', type: 'income', nameTh: 'การลงทุน', nameEn: 'Investment', icon: 'fa-solid fa-chart-line' },
      { id: 'gift-income', type: 'income', nameTh: 'ของขวัญ/ให้มา', nameEn: 'Gift', icon: 'fa-solid fa-gift' },
      // Expense
      { id: 'food', type: 'expense', nameTh: 'อาหาร/เครื่องดื่ม', nameEn: 'Food & Drinks', icon: 'fa-solid fa-utensils' },
      { id: 'groceries', type: 'expense', nameTh: 'ของใช้เข้าบ้าน', nameEn: 'Groceries', icon: 'fa-solid fa-cart-shopping' },
      { id: 'transport', type: 'expense', nameTh: 'เดินทาง', nameEn: 'Transport', icon: 'fa-solid fa-car' },
      { id: 'housing', type: 'expense', nameTh: 'บ้าน/เช่า', nameEn: 'Housing/Rent', icon: 'fa-solid fa-house' },
      { id: 'utilities', type: 'expense', nameTh: 'ค่าน้ำ/ค่าไฟ', nameEn: 'Utilities', icon: 'fa-solid fa-plug' },
      { id: 'phone-internet', type: 'expense', nameTh: 'มือถือ/อินเทอร์เน็ต', nameEn: 'Phone/Internet', icon: 'fa-solid fa-wifi' },
      { id: 'health', type: 'expense', nameTh: 'สุขภาพ', nameEn: 'Health', icon: 'fa-solid fa-heart-pulse' },
      { id: 'entertainment', type: 'expense', nameTh: 'บันเทิง', nameEn: 'Entertainment', icon: 'fa-solid fa-film' },
      { id: 'shopping', type: 'expense', nameTh: 'ช้อปปิ้ง', nameEn: 'Shopping', icon: 'fa-solid fa-bag-shopping' },
      { id: 'education', type: 'expense', nameTh: 'การศึกษา', nameEn: 'Education', icon: 'fa-solid fa-graduation-cap' },
      { id: 'travel', type: 'expense', nameTh: 'ท่องเที่ยว', nameEn: 'Travel', icon: 'fa-solid fa-plane' },
      { id: 'pets', type: 'expense', nameTh: 'สัตว์เลี้ยง', nameEn: 'Pets', icon: 'fa-solid fa-paw' },
      { id: 'fees', type: 'expense', nameTh: 'ค่าธรรมเนียม/ภาษี', nameEn: 'Fees/Tax', icon: 'fa-solid fa-receipt' },
      { id: 'charity', type: 'expense', nameTh: 'ทำบุญ/บริจาค', nameEn: 'Charity', icon: 'fa-solid fa-hand-holding-heart' },
      { id: 'debt', type: 'expense', nameTh: 'หนี้สิน/ผ่อน', nameEn: 'Debt/Installment', icon: 'fa-solid fa-money-check-dollar' },
      { id: 'savings', type: 'expense', nameTh: 'ออมเงิน', nameEn: 'Savings', icon: 'fa-solid fa-piggy-bank' },
      { id: 'others', type: 'expense', nameTh: 'อื่นๆ', nameEn: 'Others', icon: 'fa-solid fa-ellipsis' }
    ])

    const incomePockets = computed(() => store.getters.incomePockets)
    const expensePockets = computed(() => store.getters.expensePockets)

    const itemsPerPage = ref(10)
    const currentPage = ref(1)
    const transactionsSection = ref(null)

    // Pagination logic
    const totalPages = computed(() => {
      return Math.ceil(pocketTransactions.value.length / itemsPerPage.value)
    })

    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value
    })

    const endIndex = computed(() => {
      return Math.min(startIndex.value + itemsPerPage.value, pocketTransactions.value.length)
    })

    const paginatedTransactions = computed(() => {
      return pocketTransactions.value.slice(startIndex.value, endIndex.value)
    })

    const displayedPages = computed(() => {
      const pages = []
      let start = Math.max(1, currentPage.value - 2)
      let end = Math.min(totalPages.value, start + 4)

      if (end - start < 4) {
        start = Math.max(1, end - 4)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const scrollToTransactions = () => {
      // รอให้ DOM อัพเดทก่อนทำการ scroll
      nextTick(() => {
        if (transactionsSection.value) {
          transactionsSection.value.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      })
    }

    const selectPocket = (pocket) => {
      if (isSelectMode.value) {
        togglePocketSelection(pocket._id, pocket.type || 'income')
      } else {
        selectedPocket.value = pocket
        currentPage.value = 1 // รีเซ็ตหน้าเป็นหน้าแรก
        scrollToTransactions() // เรียกใช้ฟังก์ชัน scroll
      }
    }

    const closeModal = () => {
      showModal.value = false
      newPocket.value = { catalogId: '', icon: '' }
    }

    

    // Computed properties สำหรับจำนวนรายการของแต่ละ pocket
    const getIncomeCount = (pocketId) => {
      return store.state.income.filter(t => t.pocketId === pocketId).length
    }

    const getExpenseCount = (pocketId) => {
      return store.state.expenses.filter(t => t.pocketId === pocketId).length
    }

    // เพิ่ม reactive computed สำหรับข้อมูลที่อัพเดท
    const reactivePocketData = computed(() => {
      // Force reactivity by accessing store state
      const currentIncome = store.state.income
      const currentExpenses = store.state.expenses
      const currentPockets = store.state.pockets

      return {
        income: currentIncome,
        expenses: currentExpenses,
        pockets: currentPockets,
        timestamp: Date.now() // Force re-computation
      }
    })

    const calculatePocketTotal = (pocketId, type) => {
      // ใช้ reactive data เพื่อให้ re-compute เมื่อข้อมูลเปลี่ยน
      reactivePocketData.value // ทำให้ reactive

      const transactions = type === 'income'
        ? store.state.income.filter(t => t.pocketId === pocketId)
        : store.state.expenses.filter(t => t.pocketId === pocketId);
      return transactions.reduce((total, t) => total + Number(t.amount), 0);
    }

    // Income pockets with totals
    const incomePocketsWithTotals = computed(() => {
      return incomePockets.value.map(pocket => ({
        ...pocket,
        total: calculatePocketTotal(pocket._id, 'income')
      }));
    });

    // Expense pockets with totals
    const expensePocketsWithTotals = computed(() => {
      return expensePockets.value.map(pocket => ({
        ...pocket,
        total: calculatePocketTotal(pocket._id, 'expense')
      }));
    });

    // Format amount to Thai Baht
    const formatAmount = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }

    // กรอง pocketTransactions ตามเดือน/ปีที่เลือก
    const pocketTransactions = computed(() => {
      if (!selectedPocket.value) return []

      const incomeTransactions = store.state.income
        .filter(t => t.pocketId === selectedPocket.value._id)
        .filter(t => {
          const date = new Date(t.date)
          return date.getMonth() === selectedMonth.value && date.getFullYear() === selectedYear.value
        })
        .map(t => ({ ...t, type: 'income' }))

      const expenseTransactions = store.state.expenses
        .filter(t => t.pocketId === selectedPocket.value._id)
        .filter(t => {
          const date = new Date(t.date)
          return date.getMonth() === selectedMonth.value && date.getFullYear() === selectedYear.value
        })
        .map(t => ({ ...t, type: 'expense' }))

      return [...incomeTransactions, ...expenseTransactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    const pocketTotal = computed(() => {
      return pocketTransactions.value.reduce((total, t) => {
        return total + (t.type === 'income' ? 1 : -1) * Number(t.amount)
      }, 0)
    })

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('th-TH')
    }

    // เพิ่มรายการไอคอนที่มีให้เลือก
  const availableIcons = [
      // Income related icons
      { value: 'fa-solid fa-sack-dollar' }, // ถุงเงิน
      { value: 'fa-solid fa-money-bill-trend-up' }, // แนวโน้มเงินขึ้น
      { value: 'fa-solid fa-coins' }, // เหรียญ
      { value: 'fa-solid fa-hand-holding-dollar' }, // มือถือเงิน
      { value: 'fa-solid fa-money-bill-wave' }, // ธนบัตร
      { value: 'fa-solid fa-piggy-bank' }, // กระปุกออมสิน
      { value: 'fa-solid fa-credit-card' }, // บัตรเครดิต
      { value: 'fa-solid fa-building-columns' }, // ธนาคาร

      // Expense related icons
      { value: 'fa-solid fa-cart-shopping' }, // รถเข็นช้อปปิ้ง
      { value: 'fa-solid fa-burger' }, // อาหาร
      { value: 'fa-solid fa-house' }, // บ้าน
      { value: 'fa-solid fa-car' }, // รถยนต์
      { value: 'fa-solid fa-graduation-cap' }, // การศึกษา
      { value: 'fa-solid fa-heart-pulse' }, // สุขภาพ
      { value: 'fa-solid fa-plane' }, // ท่องเที่ยว
      { value: 'fa-solid fa-shirt' }, // เสื้อผ้า
      { value: 'fa-solid fa-dumbbell' }, // ออกกำลังกาย
      { value: 'fa-solid fa-laptop' }, // อุปกรณ์อิเล็กทรอนิกส์
      { value: 'fa-solid fa-gamepad' }, // เกม
      { value: 'fa-solid fa-mobile-screen' }, // มือถือ
      { value: 'fa-solid fa-wifi' }, // อินเตอร์เน็ต
      { value: 'fa-solid fa-utensils' }, // ร้านอาหาร
      { value: 'fa-solid fa-gift' }, // ของขวัญ
      { value: 'fa-solid fa-palette' }, // งานอดิเรก
    ]

    const toggleSelectMode = () => {
      isSelectMode.value = !isSelectMode.value
      if (!isSelectMode.value) {
        selectedPockets.value = []
      }
    }

    const togglePocketSelection = (pocketId, type = 'income') => {
      const index = selectedPockets.value.findIndex(p => p.id === pocketId)
      if (index === -1) {
        selectedPockets.value.push({ id: pocketId, type })
      } else {
        selectedPockets.value.splice(index, 1)
      }
    }

    const isPocketSelected = (pocketId) => {
      return selectedPockets.value.some(p => p.id === pocketId)
    }

  const deleteSelectedPockets = async () => {
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: `ต้องการลบหมวดหมู่ที่เลือกทั้งหมด ${selectedPockets.value.length} รายการหรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      })

      if (result.isConfirmed) {
        try {
          for (const pocket of selectedPockets.value) {
            await store.dispatch('deletePocket', pocket.id)
          }
          selectedPockets.value = []
          isSelectMode.value = false

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Selected pockets deleted successfully!'
          })
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to delete selected pockets'
          })
        }
      }
    }

    const deletePocket = async (pocket) => {
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: `ต้องการลบหมวดหมู่ "${pocket.name}" หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      })

      if (result.isConfirmed) {
        try {
          await store.dispatch('deletePocket', pocket._id)
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Pocket deleted successfully!'
          })
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to delete pocket'
          })
        }
      }
    }

    // แก้ไขฟังก์ชัน editPocket
    const editPocket = (pocket) => {
      editingPocket.value = { ...pocket }
      // Preselect catalog by matching current pocket name
      const match = pocketCatalog.value.find(c => c.type === pocket.type && c.nameTh === pocket.name)
      editingCatalogId.value = match?.id || ''
      showEditModal.value = true
    }

    // แก้ไขฟังก์ชัน closeEditModal
    const closeEditModal = () => {
      showEditModal.value = false
      editingPocket.value = null
    }

    // แก้ไขฟังก์ชัน updatePocket
    const updatePocket = async () => {
      if (!editingPocket.value) return
      try {
        const item = pocketCatalog.value.find(c => c.id === editingCatalogId.value && c.type === editingPocket.value.type)
        if (!item) throw new Error('กรุณาเลือกหมวดหมู่มาตรฐาน')
        // Prevent duplicate (same type & name) except itself
        const exists = store.state.pockets.some(p => p._id !== editingPocket.value._id && p.type === editingPocket.value.type && p.name === item.nameTh)
        if (exists) {
          await Swal.fire({ icon: 'warning', title: 'มีหมวดหมู่นี้อยู่แล้ว', text: 'ไม่สามารถเปลี่ยนซ้ำซ้อนในประเภทเดียวกันได้' })
          return
        }
        await store.dispatch('updatePocket', {
          id: editingPocket.value._id,
          data: { name: item.nameTh, icon: item.icon }
        })
        Swal.fire({ icon: 'success', title: 'Success', text: 'Pocket updated successfully!' })
        closeEditModal()
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to update pocket' })
      }
    }

    const handlePocketClick = (pocket) => {
      if (isSelectMode.value) {
        togglePocketSelection(pocket._id, pocket.type || 'income')
      } else {
        selectPocket(pocket)
      }
    }

    // เพิ่มฟังก์ชัน showAddPocketModal
    const showAddPocketModal = (type) => {
      newPocketType.value = type
      showModal.value = true
      newPocket.value = { catalogId: '', icon: '' }
    }

    // Add sort functionality
    const sortConfig = ref({
      key: 'date', // default sort by date
      direction: 'desc' // default newest first
    })

    // Sort function
    const sort = (key) => {
      if (sortConfig.value.key === key) {
        // Toggle direction if clicking same column
        sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
      } else {
        // New column, set default to descending
        sortConfig.value.key = key
        sortConfig.value.direction = 'desc'
      }
    }

    // Sort icon component helper
    const getSortIcon = (key) => {
      if (sortConfig.value.key === key) {
        return sortConfig.value.direction === 'asc'
          ? 'fa-solid fa-sort-up'
          : 'fa-solid fa-sort-down'
      }
      return 'fa-solid fa-sort'
    }

    // Sorted data computed property
    const sortedData = computed(() => {
      const data = [...pocketTransactions.value]

      return data.sort((a, b) => {
        let compareResult = 0

        switch (sortConfig.value.key) {
          case 'date':
            compareResult = new Date(a.date) - new Date(b.date)
            break
          case 'amount':
            compareResult = Number(a.amount) - Number(b.amount)
            break
          case 'description':
            compareResult = a.description.localeCompare(b.description)
            break
          default:
            compareResult = 0
        }

        return sortConfig.value.direction === 'asc' ? compareResult : -compareResult
      })
    })

    // ปรับปรุง paginatedData
    const paginatedData = computed(() => {
      return sortedData.value.slice(startIndex.value, endIndex.value)
    })

    // เพิ่มฟังก์ชัน loadPockets และ loadTransactions
    const loadPockets = async () => {
      try {
        isLoading.value = true
        await store.dispatch('fetchPockets')
      } catch (error) {
        console.error('Error loading pockets:', error)
        if (error.message.includes('กรุณาเข้าสู่ระบบ')) {
          // Redirect to login if not authenticated
          router.push('/login')
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้'
          })
        }
      } finally {
        isLoading.value = false
      }
    }

    const loadTransactions = async () => {
      try {
        await Promise.all([
          store.dispatch('fetchIncome'),
          store.dispatch('fetchExpenses')
        ])
      } catch (error) {
        console.error('Error loading transactions:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลรายการได้'
        })
      }
    }

    const loadCatalog = async () => {
      try {
        await store.dispatch('fetchPocketCatalog')
      } catch (error) {
        console.error('Error loading pocket catalog:', error)
      }
    }

    // เรียกใช้ loadPockets และ loadTransactions เมื่อ component ถูกสร้าง
    onMounted(async () => {
      try {
        await Promise.all([
          loadCatalog(),
          loadPockets(),
          loadTransactions()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    })

    // ตัวเลือกเดือน/ปี
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    const currentYear = new Date().getFullYear()
    const yearRange = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
    const selectedMonth = ref(new Date().getMonth())
    const selectedYear = ref(currentYear)

    // ฟังก์ชันคำนวณยอดรวมแต่ละ pocket ตามเดือน/ปีที่เลือก
    const monthlyPocketTotal = (pocketId, type) => {
      const transactions = (type === 'income'
        ? store.state.income.filter(t => t.pocketId === pocketId)
        : store.state.expenses.filter(t => t.pocketId === pocketId)
      ).filter(t => {
        const date = new Date(t.date)
        return date.getMonth() === selectedMonth.value && date.getFullYear() === selectedYear.value
      })
      return transactions.reduce((total, t) => total + Number(t.amount), 0)
    }

  const pocketCatalog = computed(() => {
      const fromStore = store.getters && store.getters.pocketCatalog
      return Array.isArray(fromStore) && fromStore.length ? fromStore : defaultCatalog.value
    })
    const incomeCatalog = computed(() => pocketCatalog.value.filter(c => c.type === 'income'))
    const expenseCatalog = computed(() => pocketCatalog.value.filter(c => c.type === 'expense'))
  const addOptions = computed(() => newPocketType.value === 'income' ? incomeCatalog.value : expenseCatalog.value)
    const pocketCatalogByType = (type) => pocketCatalog.value.filter(c => c.type === type)

    const selectedCatalogItem = computed(() => {
      return pocketCatalog.value.find(c => c.id === newPocket.value.catalogId)
    })

    const selectedCatalogIcon = computed(() => selectedCatalogItem.value?.icon || 'fa-solid fa-wallet')
    const editingSelectedItem = computed(() => pocketCatalog.value.find(c => c.id === editingCatalogId.value))
    const editingSelectedIcon = computed(() => editingSelectedItem.value?.icon || editingPocket.value?.icon || 'fa-solid fa-wallet')

    // Non-standard pockets detection (name not in catalog for the type)
    const nonStandardPockets = computed(() => {
      const set = new Set(pocketCatalog.value.filter(c => c.type === 'income').map(c => `income:${c.nameTh}`))
      pocketCatalog.value.filter(c => c.type === 'expense').forEach(c => set.add(`expense:${c.nameTh}`))
      return store.state.pockets.filter(p => !set.has(`${p.type}:${p.name}`))
    })

    const openFirstNonStandard = (type) => {
      const target = nonStandardPockets.value.find(p => p.type === type) || nonStandardPockets.value[0]
      if (target) editPocket(target)
    }

    const addNewPocket = async () => {
      try {
        const item = selectedCatalogItem.value
        if (!item) throw new Error('กรุณาเลือกหมวดหมู่')
        // Prevent duplicate creation for the same type and catalog name
        const exists = store.state.pockets.some(p => p.type === newPocketType.value && p.name === item.nameTh)
        if (exists) {
          await Swal.fire({
            icon: 'warning',
            title: 'มีหมวดหมู่นี้อยู่แล้ว',
            text: 'คุณได้สร้างหมวดหมู่นี้ไว้แล้วสำหรับประเภทนี้'
          })
          return
        }
        const pocket = {
          name: item.nameTh,
          icon: item.icon,
          type: newPocketType.value
        }

        await store.dispatch('createPocket', pocket)

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Pocket created successfully!'
        })

        closeModal()
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to create pocket'
        })
      }
    }

    return {
      incomePockets,
      expensePockets,
      selectedPocket,
      showModal,
  newPocketType,
      newPocket,
      selectPocket,
      showAddPocketModal,
      closeModal,
      addNewPocket,
  addOptions,
      calculatePocketTotal,
      incomePocketsWithTotals,
      expensePocketsWithTotals,
      formatAmount,
      pocketTransactions,
      pocketTotal,
      formatDate,
      availableIcons,
      isSelectMode,
      selectedPockets,
      toggleSelectMode,
      isPocketSelected,
      togglePocketSelection,
      handlePocketClick,
      showEditModal,
      editingPocket,
      editPocket,
      closeEditModal,
      updatePocket,
      deletePocket,
      deleteSelectedPockets,
      selectedDate, // เพิ่ม selectedDate ใน return
      itemsPerPage,
      currentPage,
      totalPages,
      paginatedData,
      displayedPages,
      changePage,
      transactionsSection,
      // Sort functionality
      sort,
      getSortIcon,
      sortedData,
      loadPockets,
      loadTransactions,
      // เพิ่มฟังก์ชันที่จำเป็น
      isLoading,
      getIncomeCount,
      getExpenseCount,
      reactivePocketData,
      // Period selector
      selectedMonth,
      selectedYear,
      months,
      yearRange,
      monthlyPocketTotal,
      pocketCatalogByType,
      selectedCatalogIcon,
  incomeCatalog,
  expenseCatalog,
      // edit modal catalog binding
      editingCatalogId,
      editingSelectedIcon,
      // migration helper
      nonStandardPockets,
      openFirstNonStandard
    }
  }
}
</script>

<style scoped>
.cloud-pocket {
  padding: 2rem;
}

.section-header {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-header {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pocket-section {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  height: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pocket-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.pocket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.pocket-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  cursor: pointer;
}

.pocket-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 1.2rem;
}

.pocket-card.income .pocket-icon {
  background: #e8f5e9;
  color: #2e7d32;
}

.pocket-card.expense .pocket-icon {
  background: #ffebee;
  color: #c62828;
}

.pocket-info h4 {
  margin: 0;
  font-size: 1rem;
}

.pocket-info .amount {
  margin: 0;
  font-size: 0.9rem;
}

.pocket-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.pocket-card:hover .pocket-actions {
  opacity: 1;
}

.pocket-actions .btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.875rem;
}

.pocket-checkbox {
  padding: 0 0.5rem;
}

.form-check-input {
  cursor: pointer;
}

.pocket-card.multi-selected {
  background-color: #f8f9fa;
  border: 2px solid var(--primary-color);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.75rem;
}

.icon-option {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: var(--primary-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option:hover {
  transform: scale(1.05);
}

.icon-option.selected {
  background: var(--primary-color);
  color: white;
}

@media (max-width: 768px) {
  .cloud-pocket {
    padding: 1rem;
  }

  .section-header,
  .pocket-section {
    padding: 1rem;
  }

  .pocket-card {
    padding: 0.75rem;
  }

  .pocket-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 0.5rem;
  }

  /* Mobile styles for pocket cards */
  .pocket-card {
    position: relative;
  }

  .pocket-actions {
    position: absolute;
    top: 50%;
    right: 1rem;
    transform: translateY(-50%);
    display: flex;
    gap: 0.5rem;
    opacity: 1;
  }

  .pocket-card:hover .pocket-actions {
    opacity: 1;
  }

  .pocket-actions .btn {
    width: 28px;
    height: 28px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: var(--white);
    border: 1px solid var(--border-color);
    font-size: 0.75rem;
  }
}

/* Pagination styles */
.pagination {
  margin-bottom: 0;
}

.page-link {
  padding: 0.375rem 0.75rem;
  color: var(--primary-color);
  background-color: var(--white);
  border: 1px solid var(--border-color);
}

.page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.page-item.disabled .page-link {
  color: var(--text-light);
  pointer-events: none;
  background-color: var(--white);
  border-color: var(--border-color);
}

/* Animation */
.modal-overlay {
  animation: fadeIn 0.2s ease;
}

.modal-content {
  animation: slideIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.transaction-section {
  scroll-margin-top: 20px;
  /* เพิ่ม margin ด้านบนเวลา scroll */
}

.period-selector {
  background: white;
  border-radius: var(--border-radius);
  padding: 1rem;
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); */
}

.input-group {
  flex: auto;
}

.input-group-text {
  background: var(--primary-color);
  color: white;
  border: none;
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.icon-preview {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-light);
  color: var(--primary-color);
  font-size: 1.2rem;
}

/* .form-select {
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: auto;
  appearance: none;
  background: white url('data:image/svg+xml;charset=utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="none" stroke="%23333" stroke-width="2" d="M6 9l6 6 6-6"/%3E%3C/svg%3E') no-repeat right 0.75rem center;
} */

.form-select {
  border-color: var(--border-color);
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.fa-calendar,
.fa-calendar-days {
  font-size: 1rem;
}
</style>