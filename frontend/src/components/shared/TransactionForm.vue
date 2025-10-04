<template>
  <div class="transaction-form">
    <!-- Single Transaction Form -->
    <div class="single-transaction-form">
      <h2 class="text-center">{{ isEditing ? 'แก้ไขรายการ' : 'เพิ่มรายการเดียว' }}</h2>
      <form @submit.prevent="submitTransaction">
        <!-- Enhanced Date Picker -->
        <div class="mb-3">
          <label class="form-label">
            <i class="fa-solid fa-calendar-days me-2"></i>
            วันที่ทำรายการ
          </label>
          <div class="date-picker-wrapper">
            <div class="enhanced-date-picker" @click="toggleDatePicker">
              <div class="date-display">
                <div class="date-icon">
                  <i class="fa-solid fa-calendar-alt"></i>
                </div>
                <div class="date-text">
                  <div class="selected-date">{{ formatDisplayDate(transactionDate) }}</div>
                  <div class="date-subtitle">คลิกเพื่อเปลี่ยนแปลง</div>
                </div>
              </div>
              <i class="fa-solid fa-chevron-down dropdown-arrow" :class="{ 'rotated': showDatePicker }"></i>
            </div>

            <!-- Hidden native date input for fallback -->
            <input type="date" v-model="transactionDate" class="native-date-input d-none" :max="maxDate"
              @change="onDateChange" ref="nativeDateInput" />

            <!-- Enhanced Calendar Dropdown -->
            <transition name="calendar-slide">
              <div v-if="showDatePicker" class="enhanced-calendar-dropdown" @click.self="closeDatePicker">
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
                    <div v-for="(day, index) in calendarDays"
                      :key="`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}-${index}`"
                      class="day-cell" :class="{
                        'other-month': !day.currentMonth,
                        'selected': isSelectedDay(day.date),
                        'today': isToday(day.date),
                        'disabled': day.date > new Date(),
                        'weekend': isWeekend(day.date)
                      }" @click="selectDate(day.date)">
                      <div class="day-content">
                        <span class="day-number">{{ day.date.getDate() }}</span>
                        <div v-if="isToday(day.date)" class="today-indicator"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="calendar-footer">
                  <button type="button" class="quick-action-btn today-btn" @click="selectToday">
                    <i class="fa-solid fa-calendar-day me-2"></i>
                    วันนี้
                  </button>
                  <button type="button" class="quick-action-btn yesterday-btn" @click="selectYesterday">
                    <i class="fa-solid fa-calendar-minus me-2"></i>
                    เมื่อวาน
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">
            <i class="fa-solid fa-tag me-2"></i>
            ประเภทของรายการ
          </label>
          <select v-model="transactionType" class="form-select" required>
            <option value="" disabled>เลือกประเภท</option>
            <option value="income">รายรับ</option>
            <option value="expense">รายจ่าย</option>
          </select>
        </div>

        <!-- เพิ่มส่วนเลือกหมวดหมู่ -->
        <div v-if="transactionType" class="mb-3">
          <label class="form-label">
            <i class="fa-solid fa-layer-group me-2"></i>
            หมวดหมู่
          </label>
          <select v-model="selectedPocketId" class="form-select" required>
            <option value="" disabled>เลือกหมวดหมู่</option>
            <template v-if="transactionType === 'income'">
              <option v-for="pocket in incomePockets" :key="pocket._id" :value="pocket._id">
                {{ pocket.name }}
              </option>
            </template>
            <template v-else>
              <option v-for="pocket in expensePockets" :key="pocket._id" :value="pocket._id">
                {{ pocket.name }}
              </option>
            </template>
          </select>
        </div>

        <div class="mb-3">
          <label for="amount" class="form-label">
            <i class="fa-solid fa-coins me-2"></i>
            จำนวนเงิน
          </label>
          <input type="number" v-model="amount" class="form-control" required placeholder="0.00" />
        </div>

        <div class="mb-3">
          <label for="description" class="form-label">
            <i class="fa-solid fa-note-sticky me-2"></i>
            บันทึกช่วยจำ
          </label>
          <input type="text" v-model="description" class="form-control" required placeholder="รายละเอียดของรายการ" />
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary flex-grow-1" :disabled="!isFormValid">
            {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการเดียว' }}
          </button>
          <button type="button" class="btn btn-outline-secondary" @click="$emit('cancel')">
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Swal from 'sweetalert2'
import { useStore } from 'vuex'

export default {
  props: {
    selectedDate: {
      type: Date,
      required: true
    },
    editingTransaction: {
      type: Object,
      default: null
    }
  },
  emits: ['transaction-added', 'cancel'],
  setup(props, { emit }) {
    const store = useStore()
    const nativeDateInput = ref(null)

    // Date picker states
    const showDatePicker = ref(false)
    const currentMonth = ref(new Date().getMonth())
    const currentYear = ref(new Date().getFullYear())

    // Thai month names
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]

    const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

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

    // Date picker methods
    const toggleDatePicker = () => {
      showDatePicker.value = !showDatePicker.value

      // Prevent body scroll on mobile when modal is open
      if (showDatePicker.value && window.innerWidth <= 768) {
        if (typeof document !== 'undefined' && document.body) {
          document.body.style.overflow = 'hidden'
        }
      } else {
        if (typeof document !== 'undefined' && document.body) {
          document.body.style.overflow = ''
        }
      }

      // ปรับตำแหน่งของ calendar dropdown
      if (showDatePicker.value && window.innerWidth > 768) {
        nextTick(() => {
          adjustCalendarPosition()
        })
      }
    }

    // ฟังก์ชันปรับตำแหน่ง calendar
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
      showDatePicker.value = false
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = ''
      }
    }

    const selectDate = (date) => {
      if (date > new Date()) return // Don't allow future dates
      // สร้างวันที่ใหม่และเซ็ตเวลาเป็น 12:00:00 เพื่อป้องกัน timezone ลบวัน
      const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      selected.setHours(12, 0, 0, 0)
      transactionDate.value = selected.toISOString().split('T')[0]
      closeDatePicker()
    }

    const selectToday = () => {
      selectDate(new Date())
    }

    const selectYesterday = () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      selectDate(yesterday)
    }

    const isSelectedDay = (date) => {
      const selected = new Date(transactionDate.value)
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

    const onDateChange = () => {
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
      if (event.key === 'Escape' && showDatePicker.value) {
        closeDatePicker()
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)

      // Set current month/year based on selected date
      const selectedDate = new Date(transactionDate.value)
      currentMonth.value = selectedDate.getMonth()
      currentYear.value = selectedDate.getFullYear()
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
      // Restore body scroll when component is destroyed
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = ''
      }
    })

    // เพิ่มฟังก์ชันโหลด pockets
    const loadPockets = async () => {
      try {
        await store.dispatch('fetchPockets')
      } catch (error) {
        console.error('Error loading pockets:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดหมวดหมู่ได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#6c5ce7'
        })
      }
    }

    onMounted(() => {
      loadPockets()
    })

    const formatDateForInput = (date) => {
      if (!date) return new Date().toISOString().split('T')[0]
      const d = new Date(date)
      if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]
      return d.toISOString().split('T')[0]
    }

    // ฟังก์ชันสำหรับแสดงผลวันที่แบบไทย
    const formatDisplayDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const transactionType = ref(props.editingTransaction?.type || '')
    const selectedPocketId = ref(props.editingTransaction?.pocketId || '')
    const amount = ref(props.editingTransaction?.amount || null)
    const description = ref(props.editingTransaction?.description || '')
    const transactionDate = ref(formatDateForInput(props.selectedDate))

    const isEditing = computed(() => !!props.editingTransaction)
    const maxDate = new Date().toISOString().split('T')[0]

    // อัพเดท transactionDate เมื่อ selectedDate เปลี่ยน
    watch(() => props.selectedDate, (newDate) => {
      if (newDate) {
        transactionDate.value = formatDateForInput(newDate)
      }
    }, { immediate: true })

    // อัพเดทฟอร์มเมื่อ editingTransaction เปลี่ยน
    watch(() => props.editingTransaction, (newTransaction) => {
      if (newTransaction) {
        transactionType.value = newTransaction.type || ''
        selectedPocketId.value = newTransaction.pocketId || ''
        amount.value = newTransaction.amount || null
        description.value = newTransaction.description || ''
        transactionDate.value = formatDateForInput(newTransaction.date)
      }
    }, { immediate: true })

    const isFormValid = computed(() => {
      return transactionType.value &&
        selectedPocketId.value &&
        amount.value &&
        description.value
    })

    const getSelectedPocket = computed(() => {
      if (!selectedPocketId.value) return null

      const pockets = transactionType.value === 'income'
        ? incomePockets.value
        : expensePockets.value

      return pockets.find(p => p.id === selectedPocketId.value)
    })

    const resetForm = () => {
      if (!props.editingTransaction) {
        transactionType.value = ''
        selectedPocketId.value = ''
        amount.value = null
        description.value = ''
        transactionDate.value = formatDateForInput(props.selectedDate)
      }
    }

    const submitTransaction = async () => {
      try {
        // Validate form
        if (!isFormValid.value) {
          throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
        }

        const transaction = {
          date: new Date(transactionDate.value).toISOString(),
          pocketId: selectedPocketId.value,
          amount: parseFloat(amount.value),
          description: description.value,
          type: transactionType.value
        }

        if (isEditing.value) {
          // Add the ID for update
          transaction.id = props.editingTransaction._id
          if (transactionType.value === 'income') {
            await store.dispatch('updateIncome', { id: transaction.id, income: transaction })
          } else {
            await store.dispatch('updateExpense', { id: transaction.id, expense: transaction })
          }
        } else {
          if (transactionType.value === 'income') {
            await store.dispatch('createIncome', transaction)
          } else {
            await store.dispatch('createExpense', transaction)
          }
        }

        await Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: `${isEditing.value ? 'แก้ไข' : 'เพิ่ม'}${transactionType.value === 'income' ? 'รายรับ' : 'รายจ่าย'}เรียบร้อยแล้ว`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#6c5ce7',
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false
        })

        // Emit transaction to parent component
        emit('transaction-added', transaction)

        resetForm()
      } catch (error) {
        console.error('Error submitting transaction:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถบันทึกรายการได้ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#6c5ce7'
        })
      }
    }

    return {
      // Form data
      transactionType,
      selectedPocketId,
      amount,
      description,
      transactionDate,
      incomePockets: computed(() => store.getters.incomePockets),
      expensePockets: computed(() => store.getters.expensePockets),
      isFormValid,
      isEditing,
      maxDate,

      // Date picker
      showDatePicker,
      currentMonth,
      currentYear,
      thaiMonths,
      weekDays,
      calendarDays,
      nativeDateInput,

      // Methods
      submitTransaction,
      formatDisplayDate,
      toggleDatePicker,
      closeDatePicker,
      adjustCalendarPosition,
      selectDate,
      selectToday,
      selectYesterday,
      isSelectedDay,
      isToday,
      isWeekend,
      previousMonth,
      nextMonth,
      onDateChange,
      handleEscapeKey
    }
  }
}
</script>

<style scoped>
.transaction-form {
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
}

.transaction-form h2 {
  color: var(--text-color);
  font-weight: 700;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b7cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

.form-control::placeholder {
  color: var(--text-light);
  opacity: 0.7;
}

.btn-primary {
  width: 100%;
  padding: 1rem;
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
  padding: 1rem;
  border: 2px solid #e1e5e9;
  font-weight: 600;
  transition: all 0.3s ease;
}

/* Enhanced Date Picker Styles */
.date-picker-wrapper {
  position: relative;
  width: 100%;
}

.enhanced-date-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.enhanced-date-picker:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.15);
  transform: translateY(-1px);
}

.enhanced-date-picker:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
}

.date-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b7cf8 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
}

.date-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.selected-date {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.2;
}

.date-subtitle {
  font-size: 0.75rem;
  color: var(--text-light);
  font-weight: 400;
}

.dropdown-arrow {
  color: var(--text-light);
  transition: transform 0.3s ease;
  font-size: 0.875rem;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
  color: var(--primary-color);
}

.native-date-input {
  position: absolute;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
}

/* Enhanced Calendar Dropdown */
.calendar-slide-enter-active,
.calendar-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-slide-enter-from,
.calendar-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.enhanced-calendar-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 0.5rem;
  overflow: hidden;
  max-width: 320px;
  width: 100%;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  color: #1a202c;
  position: relative;
}

.nav-button {
  width: 36px;
  height: 36px;
  border: none;
  background: #f7fafc;
  color: #4a5568;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.nav-button:hover {
  background: #edf2f7;
  border-color: #6366f1;
  color: #6366f1;
}

.close-calendar-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  z-index: 10;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.close-calendar-btn:hover {
  background: #dc2626;
  color: white;
}

@media (max-width: 600px) {
  .close-calendar-btn {
    display: flex !important;
  }
}

.period-display {
  text-align: center;
  flex: 1;
}

.month-name {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
  color: #1a202c;
}

.year-name {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 500;
}

.calendar-body {
  padding: 1.5rem;
}

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.weekday-cell {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #718096;
  padding: 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  min-height: 40px;
  position: relative;
  background: #fafafa;
  border: 1px solid transparent;
}

.day-cell:hover:not(.disabled):not(.other-month) {
  background: #edf2f7;
  border-color: #6366f1;
}

.day-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
}

.day-number {
  font-weight: 500;
  color: #2d3748;
  font-size: 0.875rem;
  line-height: 1;
}

.day-cell.other-month {
  background: transparent;
  opacity: 0.4;
}

.day-cell.other-month .day-number {
  color: #a0aec0;
  font-size: 0.75rem;
}

.day-cell.selected {
  background: #6366f1 !important;
  color: white !important;
  font-weight: 600;
  border-color: #6366f1 !important;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.day-cell.selected .day-number {
  color: white;
}

.day-cell.today {
  background: #10b981;
  color: white;
  font-weight: 600;
  border-color: #10b981;
}

.day-cell.today .day-number {
  color: white;
}

.today-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 1px white;
}

.day-cell.today.selected {
  background: #6366f1 !important;
}

.day-cell.weekend:not(.selected):not(.today) {
  background: #fef7f0;
  border-color: transparent;
}

.day-cell.weekend:not(.selected):not(.today) .day-number {
  color: #f56500;
}

.day-cell.disabled {
  background: #f7fafc;
  color: #a0aec0;
  opacity: 0.5;
  cursor: not-allowed;
}

.day-cell.disabled:hover {
  background: #f7fafc !important;
  border-color: transparent !important;
}

.calendar-footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.quick-action-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.813rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.quick-action-btn:hover {
  border-color: #6366f1;
  background: #edf2f7;
  color: #6366f1;
}

.today-btn:hover {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.yesterday-btn:hover {
  border-color: #f56500;
  background: rgba(245, 101, 0, 0.1);
  color: #f56500;
}

/* Desktop and Tablet Styles */
@media (min-width: 769px) {
  .enhanced-calendar-dropdown {
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    right: auto !important;
    transform: none !important;
    width: 320px !important;
    max-width: none !important;
    max-height: 400px !important;
    margin-top: 0.5rem !important;
    z-index: 1000 !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    contain: layout style !important;
  }

  /* ปรับตำแหน่งถ้าเกินขอบขวา */
  .date-picker-wrapper {
    position: relative;
  }

  .date-picker-wrapper .enhanced-calendar-dropdown {
    left: auto;
    right: 0;
  }

  .enhanced-calendar-dropdown::before {
    display: none;
  }

  .close-calendar-btn {
    display: none !important;
  }

  .calendar-header {
    padding: 1rem 1.25rem !important;
  }

  .calendar-body {
    padding: 1.25rem !important;
  }

  .weekday-cell {
    font-size: 0.688rem !important;
    padding: 0.375rem 0 !important;
  }

  .days-grid {
    gap: 0.375rem !important;
  }

  .day-cell {
    min-height: 36px !important;
    font-size: 0.813rem !important;
    border-radius: 6px !important;
  }

  .day-number {
    font-size: 0.813rem !important;
  }

  .nav-button {
    width: 32px !important;
    height: 32px !important;
    font-size: 0.875rem !important;
  }

  .month-name {
    font-size: 0.95rem !important;
  }

  .year-name {
    font-size: 0.688rem !important;
  }

  .quick-action-btn {
    padding: 0.5rem 0.75rem !important;
    font-size: 0.75rem !important;
    min-height: auto !important;
  }

  .calendar-footer {
    padding: 0.875rem 1.25rem !important;
    gap: 0.75rem !important;
  }
}

/* Mobile Styles */
@media (max-width: 600px) {
  .transaction-form {
    padding: 0.75rem;
    border-radius: 12px;
  }

  .enhanced-calendar-dropdown {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: calc(100vw - 2rem) !important;
    max-width: 300px !important;
    height: auto !important;
    max-height: 70vh !important;
    margin: 0 !important;
    border-radius: 12px !important;
    overflow-y: auto !important;
    z-index: 99999 !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  }

  /* Backdrop overlay */
  .enhanced-calendar-dropdown::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: -1;
    opacity: 1;
    backdrop-filter: blur(2px);
    pointer-events: auto;
  }

  .enhanced-date-picker {
    padding: 0.75rem 1rem;
    border-radius: 10px;
    min-height: 56px;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .date-icon {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
    border-radius: 8px;
  }

  .selected-date {
    font-size: 0.9rem;
  }

  .date-subtitle {
    font-size: 0.688rem;
  }

  .calendar-header {
    padding: 1rem 2.5rem 1rem 1rem;
    border-radius: 12px 12px 0 0;
  }

  .close-calendar-btn {
    display: flex !important;
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 28px;
    height: 28px;
    z-index: 10;
    font-size: 0.75rem;
  }

  .nav-button {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }

  .month-name {
    font-size: 0.95rem;
  }

  .year-name {
    font-size: 0.75rem;
  }

  .calendar-body {
    padding: 1rem;
  }

  .weekday-cell {
    font-size: 0.688rem;
    padding: 0.375rem 0;
  }

  .days-grid {
    gap: 0.375rem;
  }

  .day-cell {
    min-height: 36px;
    font-size: 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    user-select: none;
  }

  .day-number {
    font-size: 0.75rem !important;
  }

  .quick-action-btn {
    flex: 1;
    justify-content: center;
    padding: 0.625rem 0.25rem;
    font-size: 0.75rem;
    min-height: 36px;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .calendar-footer {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    border-radius: 0 0 12px 12px;
  }
}

/* Accessibility improvements */
.day-cell:focus {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.enhanced-date-picker:focus {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* Enhanced focus states for accessibility */
.enhanced-date-picker:focus-visible,
.form-select:focus-visible,
.form-control:focus-visible,
.quick-action-btn:focus-visible,
.nav-button:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* CSS Variables */
:root {
  --primary-color: #6366f1;
  --text-color: #1a202c;
  --text-light: #718096;
}
</style>