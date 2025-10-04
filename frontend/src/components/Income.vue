<template>
  <div class="income container-fluid">
    <!-- Header Section -->
    <div class="section-header">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <h2 class="mb-0">รายการรายรับ</h2>
        <div class="d-flex align-items-center gap-3">
          <!-- เพิ่มปุ่มลบรายการที่เลือกและปุ่มโหมดเลือก -->
          <button class="btn btn-danger btn-sm" 
                  v-if="isSelectMode && selectedTransactions.length > 0"
                  @click="deleteSelectedTransactions">
            <i class="fa-solid fa-trash me-1"></i>
            ลบที่เลือก ({{ selectedTransactions.length }})
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="toggleSelectMode">
            <i class="fa-solid" :class="isSelectMode ? 'fa-xmark' : 'fa-check-square'"></i>
            {{ isSelectMode ? 'ยกเลิก' : 'เลือกหลายรายการ' }}
          </button>

          <!-- ปุ่มที่มีอยู่เดิม -->
          <div class="filter-section d-flex align-items-center gap-2">
            <label class="text-nowrap">แสดง:</label>
            <select v-model="itemsPerPage" class="form-select form-select-sm">
              <option value="10">10 รายการ</option>
              <option value="30">30 รายการ</option>
              <option value="100">100 รายการ</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Transaction Modal -->
    <div v-if="showAddForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="mb-0">{{ editingTransaction ? 'แก้ไขรายการ' : 'เพิ่มรายการ' }}</h3>
          <button type="button" class="btn-close" @click="closeForm"></button>
        </div>
        <div class="modal-body">
          <transaction-form 
            :selected-date="selectedDate"
            :editing-transaction="editingTransaction"
            @transaction-added="handleTransactionAdded"
            @cancel="closeForm"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row g-4 mt-2">
      <!-- Calendar Column -->
      <div class="col-12 col-lg-4 order-2 order-lg-1">
        <div class="calendar-wrapper">
          <Calendar 
            v-model:selectedDate="selectedDate" 
            @dateSelected="handleDateSelected"
          />
          
          <!-- Summary Card -->
          <div class="summary-card mt-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">สรุปรายรับ</h5>
                <div class="summary-item">
                  <span>วันที่เลือก</span>
                  <span class="amount">{{ selectedDateTotal }} ฿</span>
                </div>
                <div class="summary-item">
                  <span>เดือนนี้</span>
                  <span class="amount">{{ currentMonthTotal }} ฿</span>
                </div>
                <div class="summary-item">
                  <span>ทั้งหมด</span>
                  <span class="amount">{{ totalIncome }} ฿</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions Table Column -->
      <div class="col-12 col-lg-8 order-1 order-lg-2">
        <div class="card h-100">
          <div class="card-body p-0 d-flex flex-column">  <!-- เพิ่ม d-flex และ flex-column -->
            <div class="table-responsive flex-grow-1"> <!-- เพิ่ม flex-grow-1 -->
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th @click="sort('date')" style="cursor: pointer;">
                      วันที่
                      <i :class="getSortIcon('date')" class="sort-icon"></i>
                    </th>
                    <th @click="sort('description')" style="cursor: pointer;">
                      รายละเอียด
                      <i :class="getSortIcon('description')" class="sort-icon"></i>
                    </th>
                    <th @click="sort('category')" style="cursor: pointer;">
                      หมวดหมู่
                      <i :class="getSortIcon('category')" class="sort-icon"></i>
                    </th>
                    <th class="text-end" @click="sort('amount')" style="cursor: pointer;">
                      จำนวน
                      <i :class="getSortIcon('amount')" class="sort-icon"></i>
                    </th>
                    <th class="text-end">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in paginatedIncome" 
                      :key="entry._id"
                      :class="['transaction-row', { 'selected': isTransactionSelected(entry._id) }]"
                      @click="handleRowClick(entry)">
                    <!-- เพิ่ม checkbox column ถ้าอยู่ในโหมดเลือก -->
                    <td v-if="isSelectMode" class="checkbox-column" @click.stop>
                      <input type="checkbox" 
                             class="form-check-input"
                             :checked="isTransactionSelected(entry._id)"
                             @change="toggleTransactionSelection(entry._id)">
                    </td>
                    <td>{{ formatDate(entry.date) }}</td>
                    <td>{{ entry.description }}</td>
                    <td>
                      <span class="category-badge">
                        {{ getPocketName(entry.pocketId) }}
                      </span>
                    </td>
                    <td class="text-success text-end">{{ formatAmount(entry.amount) }} ฿</td>
                    <td class="text-end" v-if="!isSelectMode">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary btn-sm" @click="editTransaction(entry)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" @click="deleteTransaction(entry)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="paginatedIncome.length === 0">
                    <td colspan="5" class="text-center py-4">
                      <div class="empty-state">
                        <i class="bi bi-inbox text-muted"></i>
                        <p>ไม่พบรายการ</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- ย้าย pagination มาอยู่ใน card-body -->
            <div class="pagination-wrapper p-3 mt-auto border-top">
              <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <div class="text-muted">
                  แสดง {{ startIndex + 1 }} ถึง {{ endIndex }} จาก {{ filteredEntries.length }} รายการ
                </div>
                <nav v-if="totalPages > 1">
                  <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <button class="page-link" @click="changePage(currentPage - 1)">
                        <i class="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    <li v-for="page in displayedPages" 
                        :key="page" 
                        class="page-item"
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
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import Calendar from './shared/Calendar.vue'
import TransactionForm from './shared/TransactionForm.vue'
import Swal from 'sweetalert2'

export default {
  components: {
    Calendar,
    TransactionForm
  },
  setup() {
    const store = useStore()
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const selectedDate = ref(new Date())
    const showAddForm = ref(false)
    const editingTransaction = ref(null)

    const sortConfig = ref({
      key: 'date', // default sort by date
      direction: 'desc' // default newest first
    })

    const sortedIncomeEntries = computed(() => {
      return [...store.state.income].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      )
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredEntries.value.length / itemsPerPage.value)
    })

    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value
    })

    const endIndex = computed(() => {
      return Math.min(startIndex.value + itemsPerPage.value, filteredEntries.value.length)
    })

    const paginatedIncome = computed(() => {
      return sortedData.value.slice(startIndex.value, endIndex.value)
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

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const handleDateSelected = (date) => {
      // ปรับเวลาให้เป็น 00:00:00
      const newDate = new Date(date)
      newDate.setHours(0, 0, 0, 0)
      selectedDate.value = newDate
    }

    // แก้ไข filteredEntries computed
    const filteredEntries = computed(() => {
      if (!selectedDate.value) return store.state.income
      
      return store.state.income.filter(entry => {
        const entryDate = new Date(entry.date)
        const selected = new Date(selectedDate.value)
        // เปรียบเทียบเฉพาะวันที่
        return entryDate.getDate() === selected.getDate() && 
               entryDate.getMonth() === selected.getMonth() && 
               entryDate.getFullYear() === selected.getFullYear()
      })
    })

    const filteredAndPaginatedEntries = computed(() => {
      return store.state.income // เปลี่ยนจาก store.state[activeTab.value]
        .filter(entry => {
          if (!selectedDate.value) return true
          const entryDate = new Date(entry.date)
          return entryDate.toDateString() === selectedDate.value.toDateString()
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(startIndex.value, endIndex.value)
    })

    // เพิ่มการคำนวณยอดรวมตามวันที่ที่เลือก
    const filteredTotalIncome = computed(() => {
      return filteredEntries.value.reduce((total, entry) => total + Number(entry.amount), 0)
    })

    // Watch for itemsPerPage changes
    watch(itemsPerPage, () => {
      currentPage.value = 1
    })

    // Watch for selectedDate changes to reset pagination
    watch(selectedDate, () => {
      currentPage.value = 1
    })

    // New computed properties
    const selectedDateTotal = computed(() => {
      return filteredEntries.value
        .reduce((total, entry) => total + Number(entry.amount), 0)
    })

    const currentMonthTotal = computed(() => {
      const now = new Date()
      return store.state.income
        .filter(entry => {
          const entryDate = new Date(entry.date)
          return entryDate.getMonth() === now.getMonth() &&
                 entryDate.getFullYear() === now.getFullYear()
        })
        .reduce((total, entry) => total + Number(entry.amount), 0)
    })

    const getPocketName = (pocketId) => {
      const pocket = store.state.pockets.find(p => p._id === pocketId)
      return pocket?.name || 'ไม่ระบุหมวดหมู่'
    }

    const formatAmount = (amount) => {
      return Number(amount).toLocaleString('th-TH')
    }

    const handleTransactionAdded = () => {
      showAddForm.value = false
      editingTransaction.value = null
      store.dispatch('fetchIncome') // Refresh the list after edit/create
    }

    const closeForm = () => {
      showAddForm.value = false
      editingTransaction.value = null
    }

    const editTransaction = (transaction) => {
      editingTransaction.value = { ...transaction }
      showAddForm.value = true
    }

    const deleteTransaction = async (transaction) => {
      const result = await Swal.fire({
        title: 'ยืนยันการลบรายการ',
        text: 'คุณแน่ใจหรือไม่ที่จะลบรายการนี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'ลบรายการ',
        cancelButtonText: 'ยกเลิก'
      })

      if (result.isConfirmed) {
        try {
          await store.dispatch('deleteIncome', transaction._id)
          Swal.fire('สำเร็จ', 'ลบรายการเรียบร้อยแล้ว', 'success')
        } catch (error) {
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบรายการได้', 'error')
        }
      }
    }

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
      const data = [...filteredEntries.value]
      
      return data.sort((a, b) => {
        let compareResult = 0
        
        switch(sortConfig.value.key) {
          case 'date':
            compareResult = new Date(a.date) - new Date(b.date)
            break
          case 'amount':
            compareResult = Number(a.amount) - Number(b.amount)
            break
          case 'description':
            compareResult = a.description.localeCompare(b.description)
            break
          case 'category':
            compareResult = getPocketName(a.pocketId).localeCompare(getPocketName(b.pocketId))
            break
          default:
            compareResult = 0
        }
        
        return sortConfig.value.direction === 'asc' ? compareResult : -compareResult
      })
    })

    // เพิ่ม imports และ state สำหรับการเลือกหลายรายการ
    const isSelectMode = ref(false)
    const selectedTransactions = ref([])

    // เพิ่มฟังก์ชันสำหรับจัดการการเลือกรายการ
    const toggleSelectMode = () => {
      isSelectMode.value = !isSelectMode.value
      if (!isSelectMode.value) {
        selectedTransactions.value = []
      }
    }

    const isTransactionSelected = (id) => {
      return selectedTransactions.value.includes(id)
    }

    const toggleTransactionSelection = (id) => {
      const index = selectedTransactions.value.indexOf(id)
      if (index === -1) {
        selectedTransactions.value.push(id)
      } else {
        selectedTransactions.value.splice(index, 1)
      }
    }

    const handleRowClick = (entry) => {
      if (isSelectMode.value) {
        toggleTransactionSelection(entry._id)
      }
    }

    // เพิ่มฟังก์ชันสำหรับลบรายการที่เลือก
    const deleteSelectedTransactions = async () => {
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: `ต้องการลบรายการที่เลือกทั้งหมด ${selectedTransactions.value.length} รายการหรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      })

      if (result.isConfirmed) {
        for (const id of selectedTransactions.value) {
          await store.dispatch('deleteIncome', id)
        }
        selectedTransactions.value = []
        isSelectMode.value = false
      }
    }

    return {
      currentPage,
      itemsPerPage,
      totalPages,
      startIndex,
      endIndex,
      paginatedIncome,
      displayedPages,
      changePage,
      formatDate,
      sortedIncomeEntries,
      totalIncome: filteredTotalIncome, // เปลี่ยนจาก store.getters.totalIncome
      selectedDate,
      filteredEntries,
      filteredAndPaginatedEntries,
      showAddForm,
      selectedDateTotal,
      currentMonthTotal,
      getPocketName,
      formatAmount,
      handleTransactionAdded,
      editTransaction,
      closeForm,
      editingTransaction,
      deleteTransaction,
      handleDateSelected,
      sort,
      getSortIcon,
      sortedData,
      isSelectMode,
      selectedTransactions,
      toggleSelectMode,
      isTransactionSelected,
      toggleTransactionSelection,
      handleRowClick,
      deleteSelectedTransactions
    }
  }
}
</script>

<style scoped>
.section-header {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.calendar-wrapper {
  position: sticky;
  top: 1rem;
}

.summary-card .card-title {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .amount {
  font-weight: 600;
  color: var(--success-color);
}

.transaction-row {
  transition: background-color 0.2s ease;
}

.transaction-row:hover {
  background-color: var(--primary-light);
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  background: var(--primary-light);
  color: var(--primary-color);
  font-size: 0.875rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-state i {
  font-size: 2rem;
}

.empty-state p {
  margin: 0;
  color: var(--text-light);
}

.page-link {
  border: none;
  margin: 0 0.25rem;
  border-radius: 0.5rem;
  color: var(--text-color);
}

.page-item.active .page-link {
  background: var(--primary-color);
}

.btn-group-sm .btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* เพิ่ม CSS สำหรับ Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1rem;
}

/* ปรับแต่ง TransactionForm ภายใน Modal */
:deep(.transaction-form) {
  max-width: 100%;
  padding: 0;
  background: transparent;
}

.card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-body {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-responsive {
  flex: 1;
  min-height: 0;
}

.pagination-wrapper {
  background-color: #fff;
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
}

/* ปรับขนาดของ pagination ให้กะทัดรัดขึ้น */
.pagination-sm .page-link {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* ให้ pagination อยู่ด้านล่างของ card เสมอ */
.pagination-wrapper {
  margin-top: auto;
}

/* ปรับความสูงของ table-responsive เพื่อให้มี scroll ได้ */
@media (max-width: 991.98px) {
  .table-responsive {
    max-height: calc(100vh - 400px);
    overflow-y: auto;
  }
}

@media (min-width: 992px) {
  .table-responsive {
    max-height: calc(100vh - 300px);
    overflow-y: auto;
  }
}

@media (max-width: 768px) {
  .section-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .summary-card {
    margin-top: 1rem;
  }

  .table th,
  .table td {
    padding: 1rem;
  }

  .category-badge {
    padding: 0.25rem 0.5rem;
  }
}

/* เพิ่ม styles สำหรับการเลือกรายการ */
.transaction-row {
  cursor: pointer;
}

.transaction-row.selected {
  background-color: #e3f2fd;
}

.checkbox-column {
  width: 40px;
  text-align: center;
}

.form-check-input {
  cursor: pointer;
}

/* ปรับแต่ง transition */
.transaction-row {
  transition: background-color 0.2s ease;
}

.transaction-row:hover {
  background-color: #f8f9fa;
}

.transaction-row.selected:hover {
  background-color: #d0e7f7;
}
</style>