<template>
  <div class="multiple-transaction-form">
    <div class="form-header">
      <h2 class="text-center">เพิ่มรายการหลายรายการพร้อมกัน</h2>
      <p class="subtitle">เพิ่มรายการรายรับหรือรายจ่ายหลายรายการในครั้งเดียว</p>
    </div>

    <!-- Transaction Type Selection -->
    <div class="mb-4">
      <label class="form-label">
        <i class="fa-solid fa-tag me-2"></i>
        ประเภทของรายการ
      </label>
      <div class="transaction-type-buttons">
        <button 
          type="button" 
          class="transaction-type-btn"
          :class="{ 'active': selectedTypes.includes('income') }"
          @click="toggleTransactionType('income')"
        >
          <i class="fa-solid fa-plus-circle me-2"></i>
          รายรับ
        </button>
        <button 
          type="button" 
          class="transaction-type-btn"
          :class="{ 'active': selectedTypes.includes('expense') }"
          @click="toggleTransactionType('expense')"
        >
          <i class="fa-solid fa-minus-circle me-2"></i>
          รายจ่าย
        </button>
      </div>
      <p class="type-hint">เลือกประเภทรายการที่ต้องการเพิ่ม (สามารถเลือกได้ทั้งสองประเภท)</p>
    </div>

    <!-- Transaction Items -->
    <div v-if="selectedTypes.length > 0" class="transaction-items">
      <!-- Income Section -->
      <div v-if="selectedTypes.includes('income')" class="transaction-section">
        <div class="section-header">
          <h4>
            <i class="fa-solid fa-plus-circle me-2 text-success"></i>
            รายการรายรับ ({{ incomeTransactions.length }} รายการ)
          </h4>
          <button 
            type="button" 
            class="btn btn-outline-success btn-sm"
            @click="addTransaction('income')"
          >
            <i class="fa-solid fa-plus me-2"></i>
            เพิ่มรายรับ
          </button>
        </div>

        <div class="transactions-container">
          <div 
            v-for="(transaction, index) in incomeTransactions" 
            :key="transaction.id"
            class="transaction-item income-item"
            :class="{ 'has-error': hasError(transaction) }"
          >
            <div class="item-header">
              <span class="item-number income-number">{{ index + 1 }}</span>
              <span class="transaction-type-badge income-badge">รายรับ</span>
              <button 
                type="button" 
                class="btn btn-outline-danger btn-sm delete-btn"
                @click="removeTransaction('income', index)"
                :disabled="incomeTransactions.length === 1"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>

            <div class="row g-3">
              <!-- Date -->
              <div class="col-md-6">
                <label class="form-label">
                  <i class="fa-solid fa-calendar-days me-2"></i>
                  วันที่
                </label>
                <div class="date-picker-wrapper">
                  <div class="enhanced-date-picker" @click="toggleDatePicker(transaction.id)">
                    <div class="date-display">
                      <div class="date-icon">
                        <i class="fa-solid fa-calendar-alt"></i>
                      </div>
                      <div class="date-text">
                        <div class="selected-date">{{ formatDisplayDate(transaction.date) }}</div>
                        <div class="date-subtitle">คลิกเพื่อเปลี่ยนแปลง</div>
                      </div>
                    </div>
                    <i class="fa-solid fa-chevron-down dropdown-arrow" :class="{ 'rotated': showDatePicker === transaction.id }"></i>
                  </div>

                  <!-- Hidden native date input for fallback -->
                  <input 
                    type="date" 
                    v-model="transaction.date" 
                    class="native-date-input d-none"
                    :max="maxDate"
                    @change="onDateChange(transaction.id)"
                    required
                  />

                  <!-- Enhanced Calendar Dropdown -->
                  <transition name="calendar-slide">
                    <div v-if="showDatePicker === transaction.id" class="enhanced-calendar-dropdown" @click.self="closeDatePicker">
                      <div class="calendar-header">
                        <button type="button" class="nav-button" @click="previousMonth">
                          <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <div class="period-display">
                          <div class="month-name">{{ thaiMonths[currentMonth] }}</div>
                          <div class="year-name">{{ currentYear + 543 }}</div>
                        </div>
                        <button type="button" class="nav-button" @click="nextMonth">
                          <i class="fa-solid fa-chevron-right"></i>
                        </button>
                        <button type="button" class="close-calendar-btn d-md-none" @click="closeDatePicker">
                          <i class="fa-solid fa-times"></i>
                        </button>
                      </div>

                      <div class="calendar-body">
                        <div class="weekdays-row">
                          <div v-for="day in weekDays" :key="day" class="weekday-cell">{{ day }}</div>
                        </div>
                        <div class="days-grid">
                          <div v-for="(day, dayIndex) in calendarDays"
                            :key="`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}-${dayIndex}`"
                            class="day-cell" :class="{
                              'other-month': !day.currentMonth,
                              'selected': isSelectedDay(day.date, transaction.date),
                              'today': isToday(day.date),
                              'disabled': day.date > new Date(),
                              'weekend': isWeekend(day.date)
                            }" @click="selectDate(day.date, transaction.id)">
                            <div class="day-content">
                              <span class="day-number">{{ day.date.getDate() }}</span>
                              <div v-if="isToday(day.date)" class="today-indicator"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="calendar-footer">
                        <button type="button" class="quick-action-btn today-btn" @click="selectToday(transaction.id)">
                          <i class="fa-solid fa-calendar-day me-2"></i>
                          วันนี้
                        </button>
                        <button type="button" class="quick-action-btn yesterday-btn" @click="selectYesterday(transaction.id)">
                          <i class="fa-solid fa-calendar-minus me-2"></i>
                          เมื่อวาน
                        </button>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- Pocket -->
              <div class="col-md-6">
                <label class="form-label">
                  <i class="fa-solid fa-layer-group me-2"></i>
                  หมวดหมู่
                </label>
                <select v-model="transaction.pocketId" class="form-select" required>
                  <option value="" disabled>เลือกหมวดหมู่</option>
                  <option v-for="pocket in incomePockets" :key="pocket._id" :value="pocket._id">
                    {{ pocket.name }}
                  </option>
                </select>
              </div>

              <!-- Amount -->
              <div class="col-md-6">
                <label class="form-label">
                  <i class="fa-solid fa-coins me-2"></i>
                  จำนวนเงิน
                </label>
                <input 
                  type="number" 
                  v-model="transaction.amount" 
                  class="form-control" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <!-- Description -->
              <div class="col-md-6">
                <label class="form-label">
                  <i class="fa-solid fa-note-sticky me-2"></i>
                  บันทึกช่วยจำ
                </label>
                <input 
                  type="text" 
                  v-model="transaction.description" 
                  class="form-control" 
                  placeholder="รายละเอียดของรายการ"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expense Section -->
      <div v-if="selectedTypes.includes('expense')" class="transaction-section">
        <div class="section-header">
          <h4>
            <i class="fa-solid fa-minus-circle me-2 text-danger"></i>
            รายการรายจ่าย ({{ expenseTransactions.length }} รายการ)
          </h4>
          <button 
            type="button" 
            class="btn btn-outline-danger btn-sm"
            @click="addTransaction('expense')"
          >
            <i class="fa-solid fa-plus me-2"></i>
            เพิ่มรายจ่าย
          </button>
        </div>

        <div class="transactions-container">
          <div 
            v-for="(transaction, index) in expenseTransactions" 
            :key="transaction.id"
            class="transaction-item expense-item"
            :class="{ 'has-error': hasError(transaction) }"
          >
            <div class="item-header">
              <span class="item-number expense-number">{{ index + 1 }}</span>
              <span class="transaction-type-badge expense-badge">รายจ่าย</span>
              <button 
                type="button" 
                class="btn btn-outline-danger btn-sm delete-btn"
                @click="removeTransaction('expense', index)"
                :disabled="expenseTransactions.length === 1"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>

            <div class="row g-3">
              <!-- Date -->
              <div class="col-md-6">
                <label class="form-label">
                  <i class="fa-solid fa-calendar-days me-2"></i>
                  วันที่
                </label>
                <div class="date-picker-wrapper">
                  <div class="enhanced-date-picker" @click="toggleDatePicker(transaction.id)">
                    <div class="date-display">
                      <div class="date-icon">
                        <i class="fa-solid fa-calendar-alt"></i>
                      </div>
                      <div class="date-text">
                        <div class="selected-date">{{ formatDisplayDate(transaction.date) }}</div>
                        <div class="date-subtitle">คลิกเพื่อเปลี่ยนแปลง</div>
                      </div>
                    </div>
                    <i class="fa-solid fa-chevron-down dropdown-arrow" :class="{ 'rotated': showDatePicker === transaction.id }"></i>
                  </div>

                  <!-- Hidden native date input for fallback -->
                  <input 
                    type="date" 
                    v-model="transaction.date" 
                    class="native-date-input d-none"
                    :max="maxDate"
                    @change="onDateChange(transaction.id)"
                    required
                  />

                  <!-- Enhanced Calendar Dropdown -->
                  <transition name="calendar-slide">
                    <div v-if="showDatePicker === transaction.id" class="enhanced-calendar-dropdown" @click.self="closeDatePicker">
                      <div class="calendar-header">
                        <button type="button" class="nav-button" @click="previousMonth">
                          <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <div class="period-display">
                          <div class="month-name">{{ thaiMonths[currentMonth] }}</div>
                          <div class="year-name">{{ currentYear + 543 }}</div>
                        </div>
                        <button type="button" class="nav-button" @click="nextMonth">
                          <i class="fa-solid fa-chevron-right"></i>
                        </button>
                        <button type="button" class="close-calendar-btn d-md-none" @click="closeDatePicker">
                          <i class="fa-solid fa-times"></i>
                        </button>
                      </div>

                      <div class="calendar-body">
                        <div class="weekdays-row">
                          <div v-for="day in weekDays" :key="day" class="weekday-cell">{{ day }}</div>
                        </div>
                        <div class="days-grid">
                          <div v-for="(day, dayIndex) in calendarDays"
                            :key="`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}-${dayIndex}`"
                            class="day-cell" :class="{
                              'other-month': !day.currentMonth,
                              'selected': isSelectedDay(day.date, transaction.date),
                              'today': isToday(day.date),
                              'disabled': day.date > new Date(),
                              'weekend': isWeekend(day.date)
                            }" @click="selectDate(day.date, transaction.id)">
                            <div class="day-content">
                              <span class="day-number">{{ day.date.getDate() }}</span>
                              <div v-if="isToday(day.date)" class="today-indicator"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="calendar-footer">
                        <button type="button" class="quick-action-btn today-btn" @click="selectToday(transaction.id)">
                          <i class="fa-solid fa-calendar-day me-2"></i>
                          วันนี้
                        </button>
                        <button type="button" class="quick-action-btn yesterday-btn" @click="selectYesterday(transaction.id)">
                          <i class="fa-solid fa-calendar-minus me-2"></i>
                          เมื่อวาน
                        </button>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- Pocket -->
              <div class="col-md-6">
                <label class="form-label">
                  <i class="fa-solid fa-layer-group me-2"></i>
                  หมวดหมู่
                </label>
                <select v-model="transaction.pocketId" class="form-select" required>
                  <option value="" disabled>เลือกหมวดหมู่</option>
                  <option v-for="pocket in expensePockets" :key="pocket._id" :value="pocket._id">
                    {{ pocket.name }}
                  </option>
                </select>
              </div>

              <!-- Amount -->
              <div class="col-md-6">
                <label class="form-label">
                  <i class="fa-solid fa-coins me-2"></i>
                  จำนวนเงิน
                </label>
                <input 
                  type="number" 
                  v-model="transaction.amount" 
                  class="form-control" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <!-- Description -->
              <div class="col-md-6">
                <label class="form-label">
                  <i class="fa-solid fa-note-sticky me-2"></i>
                  บันทึกช่วยจำ
                </label>
                <input 
                  type="text" 
                  v-model="transaction.description" 
                  class="form-control" 
                  placeholder="รายละเอียดของรายการ"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="selectedTypes.length > 0 && allTransactions.length > 0" class="summary-section">
      <div class="summary-card">
        <h5>
          <i class="fa-solid fa-calculator me-2"></i>
          สรุปรายการ
        </h5>
        <div class="summary-details">
          <div v-if="selectedTypes.includes('income')" class="summary-item">
            <span class="label">รายรับ:</span>
            <span class="value text-success">
              {{ validIncomeTransactions.length }} รายการ | {{ formatCurrency(totalIncomeAmount) }} บาท
            </span>
          </div>
          <div v-if="selectedTypes.includes('expense')" class="summary-item">
            <span class="label">รายจ่าย:</span>
            <span class="value text-danger">
              {{ validExpenseTransactions.length }} รายการ | {{ formatCurrency(totalExpenseAmount) }} บาท
            </span>
          </div>
          <div class="summary-item summary-total">
            <span class="label">รวมทั้งหมด:</span>
            <span class="value total-amount">
              {{ validTransactions.length }} รายการ | {{ formatCurrency(netAmount) }} บาท
            </span>
          </div>
          <div v-if="netAmount !== 0" class="net-result">
            <span class="net-label">ผลต่าง:</span>
            <span class="net-value" :class="netAmount > 0 ? 'text-success' : 'text-danger'">
              {{ netAmount > 0 ? '+' : '' }}{{ formatCurrency(netAmount) }} บาท
              ({{ netAmount > 0 ? 'กำไร' : 'ขาดทุน' }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="selectedTypes.length > 0" class="action-buttons">
      <button 
        type="button" 
        class="btn btn-primary"
        @click="submitTransactions"
        :disabled="!canSubmit"
      >
        <i class="fa-solid fa-save me-2"></i>
        บันทึกทั้งหมด ({{ validTransactions.length }} รายการ)
      </button>
      <button type="button" class="btn btn-outline-secondary" @click="$emit('cancel')">
        <i class="fa-solid fa-times me-2"></i>
        ยกเลิก
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'

export default {
  props: {
    selectedDate: {
      type: Date,
      required: true
    }
  },
  emits: ['transactions-added', 'cancel'],
  setup(props, { emit }) {
    const store = useStore()
    
    // Reactive data
    const selectedTypes = ref([])
    const incomeTransactions = ref([])
    const expenseTransactions = ref([])
    const maxDate = new Date().toISOString().split('T')[0]

    // Date picker states
    const showDatePicker = ref(null) // Track which transaction's datepicker is open
    const currentMonth = ref(new Date().getMonth())
    const currentYear = ref(new Date().getFullYear())

    // Thai month names
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]

    const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

    // Computed properties
    const incomePockets = computed(() => store.getters.incomePockets)
    const expensePockets = computed(() => store.getters.expensePockets)

    const allTransactions = computed(() => {
      return [...incomeTransactions.value, ...expenseTransactions.value]
    })

    const validIncomeTransactions = computed(() => {
      return incomeTransactions.value.filter(t => 
        t.date && t.pocketId && t.amount && t.description && 
        parseFloat(t.amount) > 0
      )
    })

    const validExpenseTransactions = computed(() => {
      return expenseTransactions.value.filter(t => 
        t.date && t.pocketId && t.amount && t.description && 
        parseFloat(t.amount) > 0
      )
    })

    const validTransactions = computed(() => {
      return [...validIncomeTransactions.value, ...validExpenseTransactions.value]
    })

    const totalIncomeAmount = computed(() => {
      return validIncomeTransactions.value.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    })

    const totalExpenseAmount = computed(() => {
      return validExpenseTransactions.value.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    })

    const netAmount = computed(() => {
      return totalIncomeAmount.value - totalExpenseAmount.value
    })

    const canSubmit = computed(() => {
      return selectedTypes.value.length > 0 && validTransactions.value.length > 0
    })

    // Calendar computed properties
    const calendarDays = computed(() => {
      const year = currentYear.value
      const month = currentMonth.value
      const firstDay = new Date(year, month, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const days = []
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 41) // 6 weeks

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        // สร้างวันที่แบบ UTC เพื่อป้องกัน timezone offset
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
        days.push({
          date: new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()),
          currentMonth: utcDate.getUTCMonth() === month
        })
      }

      return days
    })

    // Methods
    const formatDateForInput = (date) => {
      if (!date) return new Date().toISOString().split('T')[0]
      const d = new Date(date)
      if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]
      return d.toISOString().split('T')[0]
    }

    const formatDisplayDate = (dateString) => {
      if (!dateString) return 'เลือกวันที่'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'เลือกวันที่'
      
      const day = date.getDate()
      const month = thaiMonths[date.getMonth()]
      const year = date.getFullYear() + 543
      
      return `${day} ${month} ${year}`
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    }

    const createEmptyTransaction = (type) => ({
      id: Date.now() + Math.random(),
      date: formatDateForInput(props.selectedDate),
      pocketId: '',
      amount: null,
      description: '',
      type: type
    })

    const toggleTransactionType = (type) => {
      const index = selectedTypes.value.indexOf(type)
      if (index > -1) {
        // Remove type and its transactions
        selectedTypes.value.splice(index, 1)
        if (type === 'income') {
          incomeTransactions.value = []
        } else {
          expenseTransactions.value = []
        }
      } else {
        // Add type and initialize with one transaction
        selectedTypes.value.push(type)
        if (type === 'income') {
          incomeTransactions.value = [createEmptyTransaction('income')]
        } else {
          expenseTransactions.value = [createEmptyTransaction('expense')]
        }
      }
    }

    const addTransaction = (type) => {
      if (type === 'income') {
        incomeTransactions.value.push(createEmptyTransaction('income'))
      } else {
        expenseTransactions.value.push(createEmptyTransaction('expense'))
      }
    }

    const removeTransaction = (type, index) => {
      if (type === 'income') {
        if (incomeTransactions.value.length > 1) {
          incomeTransactions.value.splice(index, 1)
        }
      } else {
        if (expenseTransactions.value.length > 1) {
          expenseTransactions.value.splice(index, 1)
        }
      }
    }

    const hasError = (transaction) => {
      return !transaction.date || !transaction.pocketId || 
             !transaction.amount || !transaction.description ||
             parseFloat(transaction.amount || 0) <= 0
    }

    // Date picker methods
    const toggleDatePicker = (transactionId) => {
      if (showDatePicker.value === transactionId) {
        closeDatePicker()
      } else {
        showDatePicker.value = transactionId
        
        // Prevent body scroll on mobile when modal is open
        if (window.innerWidth <= 768) {
          if (typeof document !== 'undefined' && document.body) {
            document.body.style.overflow = 'hidden'
          }
        } else {
          nextTick(() => {
            adjustCalendarPosition()
          })
        }
      }
    }

    const adjustCalendarPosition = () => {
      const calendarEl = document.querySelector('.enhanced-calendar-dropdown')
      const pickerEl = document.querySelector('.enhanced-date-picker')

      if (calendarEl && pickerEl) {
        const pickerRect = pickerEl.getBoundingClientRect()
        const calendarRect = calendarEl.getBoundingClientRect()
        const viewportWidth = window.innerWidth

        // รีเซ็ต positioning
        calendarEl.style.left = '0'
        calendarEl.style.right = 'auto'

        // ตรวจสอบว่าเกินขอบขวาหรือไม่
        if (pickerRect.left + calendarRect.width > viewportWidth - 20) {
          calendarEl.style.left = 'auto'
          calendarEl.style.right = '0'
        }
      }
    }

    const closeDatePicker = () => {
      showDatePicker.value = null
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = ''
      }
    }

    const selectDate = (date, transactionId) => {
      if (date > new Date()) return // Don't allow future dates
      
      const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      selected.setHours(12, 0, 0, 0)
      
      // Find transaction in both arrays
      let transaction = incomeTransactions.value.find(t => t.id === transactionId)
      if (!transaction) {
        transaction = expenseTransactions.value.find(t => t.id === transactionId)
      }
      
      if (transaction) {
        transaction.date = selected.toISOString().split('T')[0]
      }
      
      closeDatePicker()
    }

    const selectToday = (transactionId) => {
      selectDate(new Date(), transactionId)
    }

    const selectYesterday = (transactionId) => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      selectDate(yesterday, transactionId)
    }

    const isSelectedDay = (date, transactionDate) => {
      if (!transactionDate) return false
      const selected = new Date(transactionDate)
      return date.toDateString() === selected.toDateString()
    }

    const isToday = (date) => {
      return date.toDateString() === new Date().toDateString()
    }

    const isWeekend = (date) => {
      const dayOfWeek = date.getDay()
      return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
    }

    const previousMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
      } else {
        currentMonth.value--
      }
    }

    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
      } else {
        currentMonth.value++
      }
    }

    const onDateChange = (transactionId) => {
      closeDatePicker()
    }

    // Close date picker when clicking outside
    const handleClickOutside = (event) => {
      // Don't close if clicking inside the calendar dropdown
      if (event.target.closest('.enhanced-calendar-dropdown')) {
        return
      }

      // Don't close if clicking on the date picker trigger
      if (event.target.closest('.enhanced-date-picker')) {
        return
      }

      // Close the dropdown
      closeDatePicker()
    }

    // Add escape key handler
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showDatePicker.value !== null) {
        closeDatePicker()
      }
    }

    const submitTransactions = async () => {
      try {
        if (!canSubmit.value) {
          throw new Error('กรุณากรอกข้อมูลให้ครบถ้วนในทุกรายการ')
        }

        let confirmText = 'คุณต้องการบันทึกรายการต่อไปนี้ หรือไม่?\n'
        if (validIncomeTransactions.value.length > 0) {
          confirmText += `รายรับ: ${validIncomeTransactions.value.length} รายการ\n`
        }
        if (validExpenseTransactions.value.length > 0) {
          confirmText += `รายจ่าย: ${validExpenseTransactions.value.length} รายการ\n`
        }

        const result = await Swal.fire({
          title: 'ยืนยันการบันทึก',
          text: confirmText,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'บันทึก',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#6c5ce7',
          cancelButtonColor: '#74b9ff'
        })

        if (!result.isConfirmed) return

        // Submit income transactions
        if (validIncomeTransactions.value.length > 0) {
          const incomeData = validIncomeTransactions.value.map(transaction => ({
            date: new Date(transaction.date).toISOString(),
            pocketId: transaction.pocketId,
            amount: parseFloat(transaction.amount),
            description: transaction.description,
            type: 'income'
          }))
          await store.dispatch('createMultipleIncome', incomeData)
        }

        // Submit expense transactions
        if (validExpenseTransactions.value.length > 0) {
          const expenseData = validExpenseTransactions.value.map(transaction => ({
            date: new Date(transaction.date).toISOString(),
            pocketId: transaction.pocketId,
            amount: parseFloat(transaction.amount),
            description: transaction.description,
            type: 'expense'
          }))
          await store.dispatch('createMultipleExpenses', expenseData)
        }

        await Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: `เพิ่มรายการทั้งหมด ${validTransactions.value.length} รายการ เรียบร้อยแล้ว`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#6c5ce7',
          timer: 2000,
          timerProgressBar: true
        })

        // Emit success event
        emit('transactions-added', validTransactions.value)
        
        // Reset form
        resetForm()

      } catch (error) {
        console.error('Error submitting multiple transactions:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถบันทึกรายการได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#6c5ce7'
        })
      }
    }

    const resetForm = () => {
      selectedTypes.value = []
      incomeTransactions.value = []
      expenseTransactions.value = []
    }

    const loadPockets = async () => {
      try {
        await store.dispatch('fetchPockets')
      } catch (error) {
        console.error('Error loading pockets:', error)
      }
    }

    // Watchers
    watch(() => props.selectedDate, (newDate) => {
      if (newDate) {
        const formattedDate = formatDateForInput(newDate)
        incomeTransactions.value.forEach(transaction => {
          if (!transaction.date) {
            transaction.date = formattedDate
          }
        })
        expenseTransactions.value.forEach(transaction => {
          if (!transaction.date) {
            transaction.date = formattedDate
          }
        })
      }
    })

    // Lifecycle
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
      
      loadPockets()
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
      // Clean up body scroll on unmount
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = ''
      }
    })

    return {
      // Data
      selectedTypes,
      incomeTransactions,
      expenseTransactions,
      maxDate,
      
      // Date picker data
      showDatePicker,
      currentMonth,
      currentYear,
      thaiMonths,
      weekDays,
      
      // Computed
      incomePockets,
      expensePockets,
      allTransactions,
      validIncomeTransactions,
      validExpenseTransactions,
      validTransactions,
      totalIncomeAmount,
      totalExpenseAmount,
      netAmount,
      canSubmit,
      calendarDays,
      
      // Methods
      formatCurrency,
      formatDisplayDate,
      toggleTransactionType,
      addTransaction,
      removeTransaction,
      hasError,
      submitTransactions,
      resetForm,
      
      // Date picker methods
      toggleDatePicker,
      closeDatePicker,
      selectDate,
      selectToday,
      selectYesterday,
      isSelectedDay,
      isToday,
      isWeekend,
      previousMonth,
      nextMonth,
      onDateChange
    }
  }
}
</script>

<style scoped>
.multiple-transaction-form {
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
  max-height: 80vh;
  overflow-y: auto;
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-header h2 {
  color: var(--text-color);
  font-weight: 700;
  font-size: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b7cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-light);
  font-size: 0.95rem;
  margin: 0;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.form-label i {
  color: var(--primary-color);
}

.form-select,
.form-control {
  border-radius: 12px;
  border: 2px solid #e1e5e9;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-select:focus,
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  background: white;
  transform: translateY(-1px);
}

.transaction-items {
  margin-bottom: 2rem;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.items-header h4 {
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
  display: flex;
  align-items: center;
}

.items-header h4 i {
  color: var(--primary-color);
}

.transactions-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.transaction-item {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.transaction-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.1);
}

.transaction-item.has-error {
  border-color: #ff6b6b;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.item-number {
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b7cf8 100%);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.delete-btn {
  border-radius: 8px;
  padding: 0.5rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.summary-section {
  margin-bottom: 2rem;
}

.summary-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #bae6fd;
  border-radius: 12px;
  padding: 1.5rem;
}

.summary-card h5 {
  color: var(--text-color);
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.summary-card h5 i {
  color: #0ea5e9;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item .label {
  font-weight: 500;
  color: var(--text-color);
}

.summary-item .value {
  font-weight: 600;
  color: var(--text-color);
}

.total-amount {
  font-size: 1.1rem;
  color: var(--primary-color) !important;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary {
  padding: 1rem 2rem;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b7cf8 100%);
  border: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4);
}

.btn-primary:disabled {
  background: #cbd5e1;
  box-shadow: none;
  transform: none;
}

.btn-outline-secondary {
  border-radius: 12px;
  padding: 1rem 2rem;
  border: 2px solid #e1e5e9;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-primary {
  border-radius: 8px;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  background: var(--primary-color);
  color: white;
}

.btn-outline-danger {
  border: 2px solid #ff6b6b;
  color: #ff6b6b;
  transition: all 0.3s ease;
}

.btn-outline-danger:hover {
  background: #ff6b6b;
  color: white;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .multiple-transaction-form {
    padding: 1rem;
    border-radius: 12px;
  }

  .items-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .items-header h4 {
    font-size: 1rem;
  }

  .transaction-item {
    padding: 1rem;
  }

  .summary-details {
    gap: 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-outline-secondary {
    padding: 0.875rem 1.5rem;
  }
}

/* CSS Variables */
:root {
  --primary-color: #6366f1;
  --text-color: #1a202c;
  --text-light: #718096;
  --success-color: #10b981;
  --danger-color: #ef4444;
}

/* Transaction Type Selection */
.transaction-type-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.transaction-type-btn {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: var(--text-color);
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.transaction-type-btn:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.15);
}

.transaction-type-btn.active {
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b7cf8 100%);
  border-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.3);
}

.type-hint {
  font-size: 0.85rem;
  color: var(--text-light);
  margin: 0;
  text-align: center;
}

/* Transaction Sections */
.transaction-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 2px solid #e1e5e9;
}

.section-header h4 {
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
  display: flex;
  align-items: center;
}

/* Transaction Item Styles */
.income-item {
  border-color: var(--success-color);
  background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
}

.income-item:hover {
  border-color: var(--success-color);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15);
}

.expense-item {
  border-color: var(--danger-color);
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
}

.expense-item:hover {
  border-color: var(--danger-color);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15);
}

/* Transaction Type Badges */
.transaction-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.income-badge {
  background: var(--success-color);
  color: white;
}

.expense-badge {
  background: var(--danger-color);
  color: white;
}

/* Item Numbers */
.income-number {
  background: linear-gradient(135deg, var(--success-color) 0%, #059669 100%);
}

.expense-number {
  background: linear-gradient(135deg, var(--danger-color) 0%, #dc2626 100%);
}

/* Summary Enhancements */
.summary-total {
  border-top: 2px solid #e1e5e9;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  font-weight: 600;
}

.net-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.net-label {
  font-weight: 600;
  color: var(--text-color);
}

.net-value {
  font-weight: 700;
  font-size: 1.05rem;
}

/* Mobile responsiveness for new elements */
@media (max-width: 600px) {
  .transaction-type-buttons {
    flex-direction: column;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .section-header h4 {
    font-size: 1rem;
  }

  .net-result {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

/* Date Picker Styles */
.date-picker-wrapper {
  position: relative;
  width: 100%;
}

.enhanced-date-picker {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

.enhanced-date-picker:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.1);
  transform: translateY(-1px);
}

.enhanced-date-picker:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  background: white;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.date-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b7cf8 100%);
  border-radius: 10px;
  color: white;
  font-size: 1.1rem;
}

.date-text {
  flex: 1;
}

.selected-date {
  font-weight: 600;
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.2;
}

.date-subtitle {
  color: var(--text-light);
  font-size: 0.8rem;
  margin-top: 2px;
}

.dropdown-arrow {
  color: var(--text-light);
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.native-date-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}

.enhanced-calendar-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 320px;
  overflow: hidden;
  transform-origin: top center;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b7cf8 100%);
  color: white;
  position: relative;
}

.nav-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.period-display {
  text-align: center;
  flex: 1;
}

.month-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 2px;
}

.year-name {
  font-size: 0.9rem;
  opacity: 0.9;
}

.close-calendar-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.calendar-body {
  padding: 1.5rem;
}

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 1rem;
}

.weekday-cell {
  text-align: center;
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.85rem;
  padding: 0.5rem 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  font-size: 0.9rem;
}

.day-cell:hover:not(.disabled) {
  background: rgba(108, 92, 231, 0.1);
  transform: scale(1.05);
}

.day-cell.other-month {
  color: #cbd5e1;
}

.day-cell.other-month:hover:not(.disabled) {
  background: rgba(203, 213, 225, 0.1);
}

.day-cell.selected {
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b7cf8 100%);
  color: white;
  font-weight: 600;
}

.day-cell.today:not(.selected) {
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  font-weight: 600;
}

.day-cell.disabled {
  color: #e2e8f0;
  cursor: not-allowed;
}

.day-cell.weekend:not(.selected):not(.today) {
  color: #dc2626;
}

.day-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.today-indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #059669;
  border-radius: 50%;
}

.calendar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 0.75rem;
  background: #f8fafc;
}

.quick-action-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-color);
  font-weight: 500;
  display: flex;
  align-items: center;
}

.quick-action-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.today-btn i {
  color: #059669;
}

.today-btn:hover i {
  color: white;
}

.yesterday-btn i {
  color: #f59e0b;
}

.yesterday-btn:hover i {
  color: white;
}

/* Calendar animation */
.calendar-slide-enter-active,
.calendar-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.calendar-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Mobile specific styles */
@media (max-width: 768px) {
  .enhanced-calendar-dropdown {
    position: fixed;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: calc(100vw - 2rem);
    max-width: 350px;
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    z-index: 9999;
  }

  .date-picker-wrapper .enhanced-calendar-dropdown {
    position: fixed !important;
  }

  .enhanced-calendar-dropdown::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }

  .calendar-header {
    padding: 1rem 1.25rem;
  }

  .calendar-body {
    padding: 1.25rem;
  }

  .calendar-footer {
    padding: 0.875rem 1.25rem;
    flex-direction: column;
  }

  .quick-action-btn {
    width: 100%;
    justify-content: center;
  }

  .period-display {
    margin: 0 2rem;
  }

  .close-calendar-btn {
    display: block;
  }

  .nav-button {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 600px) {
  .enhanced-calendar-dropdown {
    width: calc(100vw - 1rem);
    border-radius: 12px;
  }

  .calendar-header {
    padding: 0.875rem 1rem;
  }

  .calendar-body {
    padding: 1rem;
  }

  .calendar-footer {
    padding: 0.75rem 1rem;
  }

  .enhanced-date-picker {
    padding: 0.75rem 1rem;
  }

  .date-icon {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .selected-date {
    font-size: 0.9rem;
  }

  .date-subtitle {
    font-size: 0.75rem;
  }
}

/* Focus and accessibility */
.enhanced-date-picker:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.enhanced-date-picker:focus-visible,
.nav-button:focus-visible,
.quick-action-btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>
