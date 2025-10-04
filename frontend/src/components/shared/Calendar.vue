<template>
  <div class="modern-calendar">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <button class="nav-btn" @click="previousMonth" :disabled="isMinDate">
        <i class="bi bi-chevron-left"></i>
      </button>
      
      <div class="date-selector" @click="toggleDropdown">
        <div class="current-period">
          <h5 class="month-title">{{ months[selectedMonth] }}</h5>
          <span class="year-title">{{ selectedYear + 543 }}</span>
        </div>
        <i class="bi bi-chevron-down dropdown-icon" :class="{ 'rotated': showDropdown }"></i>
      </div>
      
      <button class="nav-btn" @click="nextMonth" :disabled="isMaxDate">
        <i class="bi bi-chevron-right"></i>
      </button>

      <!-- Enhanced Dropdown -->
      <transition name="dropdown">
        <div v-if="showDropdown" class="period-dropdown" @click.stop>
          <div class="dropdown-header">
            <h6>เลือกเดือนและปี</h6>
            <button class="close-btn" @click="showDropdown = false">
              <i class="bi bi-x"></i>
            </button>
          </div>
          
          <div class="period-selectors">
            <div class="month-selector">
              <h6 class="selector-title">เดือน</h6>
              <div class="month-grid">
                <button v-for="(month, index) in months"
                        :key="index"
                        :class="['month-btn', { active: selectedMonth === index }]"
                        @click.stop="selectMonth(index)">
                  {{ month }}
                </button>
              </div>
            </div>
            
            <div class="year-selector">
              <h6 class="selector-title">ปี</h6>
              <div class="year-grid">
                <button v-for="year in yearRange"
                        :key="year"
                        :class="['year-btn', { active: selectedYear === year }]"
                        @click.stop="selectYear(year)">
                  {{ year + 543 }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Weekday Headers -->
      <div class="weekdays-header">
        <div v-for="day in weekDays" :key="day" class="weekday-cell">
          {{ day }}
        </div>
      </div>
      
      <!-- Calendar Days -->
      <transition-group name="calendar-day" tag="div" class="days-grid">
        <div v-for="day in calendar"
             :key="`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`"
             class="day-cell"
             :class="{
               'selected': isSelectedDate(day.date),
               'has-transactions': hasTransactions(day.date),
               'outside-month': !day.currentMonth,
               'today': isToday(day.date),
               'weekend': isWeekend(day.date)
             }"
             @click="selectDate(day.date)">
          
          <div class="day-content">
            <span class="date-number">{{ day.date.getDate() }}</span>
            
            <!-- Transaction Indicators -->
            <div v-if="hasTransactions(day.date)" class="transaction-dots">
              <div v-if="getIncomeForDate(day.date)" class="dot income-dot"
                   :title="`รายรับ: ${getIncomeAmount(day.date)} บาท`"></div>
              <div v-if="getExpensesForDate(day.date)" class="dot expense-dot"
                   :title="`รายจ่าย: ${getExpenseAmount(day.date)} บาท`"></div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Today Button -->
    <div class="calendar-footer">
      <button class="today-btn" @click="goToToday" v-if="!isCurrentMonth">
        <i class="bi bi-calendar-day"></i>
        กลับสู่วันนี้
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Calendar',
  props: {
    selectedDate: {
      type: Date,
      required: true,
      default: () => new Date()
    }
  },
  emits: ['update:selectedDate', 'dateSelected'],
  
  setup(props, { emit }) {
    const store = useStore()
    const currentDate = ref(new Date(props.selectedDate))
    const showDropdown = ref(false)
    
    // เพิ่มรายชื่อเดือนภาษาไทย
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    
    const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    
    // สร้างช่วงปีย้อนหลัง 5 ปี และล่วงหน้า 5 ปี
    const currentYear = new Date().getFullYear()
    const yearRange = Array.from(
      { length: 11 }, 
      (_, i) => currentYear - 5 + i
    )

    // เพิ่ม ref สำหรับเดือนและปีที่เลือก
    const selectedMonth = ref(currentDate.value.getMonth())
    const selectedYear = ref(currentDate.value.getFullYear())

    // อัพเดทวันที่เมื่อมีการเปลี่ยนเดือนหรือปี
    watch([selectedMonth, selectedYear], ([month, year]) => {
      currentDate.value = new Date(year, month, 1)
    })
    
    const currentMonthYear = computed(() => {
      return `${months[selectedMonth.value]} ${selectedYear.value + 543}`
    })
    
    const calendar = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const weeks = []
      let currentWeek = []
      // Fill in leading empty days
      for (let i = 0; i < firstDay.getDay(); i++) {
        const prevMonth = new Date(year, month, 0)
        const prevMonthDay = prevMonth.getDate() - firstDay.getDay() + i + 1
        // สร้างวันที่แบบ UTC
        const utcDate = new Date(Date.UTC(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonthDay))
        currentWeek.push({
          date: new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()),
          currentMonth: false
        })
      }
      // Fill in days of current month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const utcDate = new Date(Date.UTC(year, month, day))
        currentWeek.push({
          date: new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()),
          currentMonth: true
        })
        if (currentWeek.length === 7) {
          weeks.push([...currentWeek])
          currentWeek = []
        }
      }
      // Fill in trailing empty days
      if (currentWeek.length > 0) {
        const nextMonth = new Date(year, month + 1, 1)
        for (let i = 1; currentWeek.length < 7; i++) {
          const utcDate = new Date(Date.UTC(nextMonth.getFullYear(), nextMonth.getMonth(), i))
          currentWeek.push({
            date: new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()),
            currentMonth: false
          })
        }
        weeks.push([...currentWeek])
      }
      return weeks.flat()
    })

    // New computed properties for enhanced functionality
    const isCurrentMonth = computed(() => {
      const today = new Date()
      return selectedMonth.value === today.getMonth() &&
             selectedYear.value === today.getFullYear()
    })

    const isMinDate = computed(() => {
      const minYear = currentYear - 5
      return selectedYear.value === minYear && selectedMonth.value === 0
    })

    const isMaxDate = computed(() => {
      const maxYear = currentYear + 5
      return selectedYear.value === maxYear && selectedMonth.value === 11
    })

    const selectDate = (date) => {
      if (!date) return
      // สร้างวันที่ใหม่และเซ็ตเวลาเป็น 12:00:00 เพื่อป้องกัน timezone ลบวัน
      const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      selectedDate.setHours(12, 0, 0, 0)
      emit('update:selectedDate', selectedDate)
      emit('dateSelected', selectedDate)
    }

    // ปรับปรุงฟังก์ชัน isSelectedDate
    const isSelectedDate = (date) => {
      if (!date || !props.selectedDate) return false
      const d1 = new Date(date)
      const d2 = new Date(props.selectedDate)
      // เปรียบเทียบเฉพาะวันที่
      return d1.getDate() === d2.getDate() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getFullYear() === d2.getFullYear()
    }

    const getIncomeForDate = (date) => {
      if (!date) return false
      return store.state.income.some(income => {
        const incomeDate = new Date(income.date)
        return incomeDate.toDateString() === date.toDateString()
      })
    }
    
    const getExpensesForDate = (date) => {
      if (!date) return false
      return store.state.expenses.some(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.toDateString() === date.toDateString()
      })
    }

    const hasTransactions = (date) => {
      if (!date) return false
      return getIncomeForDate(date) || getExpensesForDate(date)
    }

    // Enhanced methods
    const isWeekend = (date) => {
      const day = date.getDay()
      return day === 0 || day === 6 // Sunday or Saturday
    }

    const getIncomeAmount = (date) => {
      if (!date) return 0
      return store.state.income
        .filter(income => {
          const incomeDate = new Date(income.date)
          return incomeDate.toDateString() === date.toDateString()
        })
        .reduce((sum, income) => sum + Number(income.amount), 0)
    }

    const getExpenseAmount = (date) => {
      if (!date) return 0
      return store.state.expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate.toDateString() === date.toDateString()
        })
        .reduce((sum, expense) => sum + Number(expense.amount), 0)
    }

    const goToToday = () => {
      const today = new Date()
      selectedMonth.value = today.getMonth()
      selectedYear.value = today.getFullYear()
      selectDate(today)
    }

    // เพิ่ม watcher สำหรับ props.selectedDate
    watch(() => props.selectedDate, (newDate) => {
      if (newDate) {
        currentDate.value = newDate
        selectedMonth.value = newDate.getMonth()
        selectedYear.value = newDate.getFullYear()
      }
    })

    const isToday = (date) => {
      if (!date) return false
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }

    const previousMonth = () => {
      if (selectedMonth.value === 0) {
        selectedMonth.value = 11
        selectedYear.value--
      } else {
        selectedMonth.value--
      }
    }
    
    const nextMonth = () => {
      if (selectedMonth.value === 11) {
        selectedMonth.value = 0
        selectedYear.value++
      } else {
        selectedMonth.value++
      }
    }
    
    // เพิ่มฟังก์ชันใหม่
    const toggleDropdown = (event) => {
      event.stopPropagation()
      showDropdown.value = !showDropdown.value
    }
    
    const selectMonth = (month) => {
      selectedMonth.value = month
      showDropdown.value = false
    }
    
    const selectYear = (year) => {
      selectedYear.value = year
      showDropdown.value = false
    }
    
    // ปิด dropdown เมื่อคลิกที่อื่น
    const handleClickOutside = (event) => {
      const dateSelector = event.target.closest('.date-selector')
      const dropdown = event.target.closest('.period-dropdown')
      
      if (!dateSelector && !dropdown && showDropdown.value) {
        showDropdown.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside, true)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside, true)
    })

    return {
      // Calendar data
      calendar,
      weekDays,
      months,
      yearRange,
      selectedMonth,
      selectedYear,
      currentMonthYear,
      
      // State
      showDropdown,
      
      // Computed
      isCurrentMonth,
      isMinDate,
      isMaxDate,
      
      // Date methods
      selectDate,
      isSelectedDate,
      isToday,
      isWeekend,
      
      // Transaction methods
      hasTransactions,
      getIncomeForDate,
      getExpensesForDate,
      getIncomeAmount,
      getExpenseAmount,
      
      // Navigation methods
      previousMonth,
      nextMonth,
      goToToday,
      
      // Dropdown methods
      toggleDropdown,
      selectMonth,
      selectYear
    }
  }
}
</script>

<style scoped>
.modern-calendar {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  color: #1a202c;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  position: relative;
}

.nav-btn {
  width: 40px;
  height: 40px;
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

.nav-btn:hover:not(:disabled) {
  background: #edf2f7;
  color: #2d3748;
  border-color: #cbd5e0;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f7fafc;
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 200px;
  margin: 0 1rem;
}

.date-selector:hover {
  background: #edf2f7;
  border-color: #6366f1;
}

.current-period {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.month-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
  color: #1a202c;
}

.year-title {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 500;
}

.dropdown-icon {
  transition: transform 0.2s ease;
  color: #a0aec0;
  font-size: 0.875rem;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
  color: #6366f1;
}

/* Dropdown Styles */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.period-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 0.5rem;
  padding: 1.5rem;
  min-width: 280px;
  border: 1px solid #e2e8f0;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  color: #1a202c;
}

.dropdown-header h6 {
  margin: 0;
  font-weight: 600;
  font-size: 0.95rem;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #fed7d7;
  color: #e53e3e;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e53e3e;
  color: white;
}

.period-selectors {
  display: grid;
  gap: 1.5rem;
}

.selector-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  max-height: 150px;
  overflow-y: auto;
}

.month-btn, .year-btn {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.month-btn:hover, .year-btn:hover {
  background: #edf2f7;
  border-color: #6366f1;
  color: #6366f1;
}

.month-btn.active, .year-btn.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

/* Calendar Grid */
.calendar-grid {
  margin-bottom: 1rem;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
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
  cursor: pointer;
  border-radius: 8px;
  position: relative;
  transition: all 0.2s ease;
  background: #fafafa;
  border: 1px solid transparent;
  min-height: 40px;
}

.day-cell:hover:not(.outside-month):not(.disabled) {
  background: #edf2f7;
  border-color: #6366f1;
}

.day-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  height: 100%;
  justify-content: center;
}

.date-number {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  color: #2d3748;
}

.outside-month {
  opacity: 0.3;
  background: transparent;
}

.outside-month .date-number {
  color: #a0aec0;
}

.selected {
  background: #6366f1 !important;
  color: white !important;
  font-weight: 600;
  border-color: #6366f1 !important;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.selected .date-number {
  color: white;
}

.today {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.today .date-number {
  color: white;
  font-weight: 600;
}

.today.selected {
  background: #6366f1 !important;
}

.weekend:not(.selected):not(.today) {
  background: #fef7f0;
  border-color: transparent;
}

.weekend:not(.selected):not(.today) .date-number {
  color: #f56500;
}

.has-transactions {
  border-color: #d69e2e;
}

.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: #f7fafc;
}

.disabled:hover {
  background: #f7fafc !important;
  border-color: transparent !important;
}

/* Transaction Dots */
.transaction-dots {
  display: flex;
  gap: 0.25rem;
  position: absolute;
  bottom: 0.25rem;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.income-dot {
  background: #10b981;
}

.expense-dot {
  background: #ef4444;
}

/* Footer */
.calendar-footer {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  margin-top: 1rem;
}

.today-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.today-btn:hover {
  background: #edf2f7;
  border-color: #6366f1;
  color: #6366f1;
}

/* Calendar Day Transitions */
.calendar-day-enter-active, .calendar-day-leave-active {
  transition: all 0.3s ease;
}

.calendar-day-enter-from, .calendar-day-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.calendar-day-move {
  transition: transform 0.3s ease;
}

/* Mobile Styles */
@media (max-width: 600px) {
  .modern-calendar {
    padding: 1rem;
    margin: 0;
    border-radius: 12px;
  }

  .calendar-header {
    margin-bottom: 1rem;
    flex-wrap: nowrap;
    gap: 0.5rem;
  }

  .nav-btn {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .date-selector {
    padding: 0.5rem 0.75rem;
    margin: 0 0.5rem;
    min-width: 0;
    flex: 1;
    max-width: none;
  }

  .month-title {
    font-size: 0.875rem;
  }

  .year-title {
    font-size: 0.688rem;
  }

  .period-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 300px;
    margin: 0;
    padding: 1rem;
    min-width: 0;
  }

  .dropdown-header h6 {
    font-size: 0.875rem;
  }

  .month-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.375rem;
  }

  .year-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.375rem;
    max-height: 120px;
  }

  .month-btn, .year-btn {
    padding: 0.375rem 0.25rem;
    font-size: 0.75rem;
  }

  .weekday-cell {
    font-size: 0.688rem;
    padding: 0.375rem 0;
  }

  .day-cell {
    min-height: 36px;
  }

  .date-number {
    font-size: 0.813rem;
  }

  .dot {
    width: 3px;
    height: 3px;
  }

  .today-btn {
    padding: 0.5rem 1rem;
    font-size: 0.813rem;
  }
}

/* Small Screen Optimization */
@media (max-width: 375px) {
  .modern-calendar {
    padding: 0.75rem;
  }

  .calendar-header {
    gap: 0.25rem;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
  }

  .date-selector {
    padding: 0.375rem 0.5rem;
    margin: 0 0.25rem;
  }

  .month-title {
    font-size: 0.75rem;
  }

  .year-title {
    font-size: 0.625rem;
  }

  .period-dropdown {
    width: 95vw;
    max-width: 280px;
    padding: 0.75rem;
  }

  .weekday-cell {
    font-size: 0.625rem;
    padding: 0.25rem 0;
  }

  .day-cell {
    min-height: 32px;
  }

  .date-number {
    font-size: 0.75rem;
  }

  .month-btn, .year-btn {
    padding: 0.25rem;
    font-size: 0.688rem;
  }

  .today-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
}

/* Extra Small Screens */
@media (max-width: 320px) {
  .modern-calendar {
    padding: 0.5rem;
  }

  .nav-btn {
    width: 28px;
    height: 28px;
  }

  .date-selector {
    padding: 0.25rem 0.375rem;
  }

  .month-title {
    font-size: 0.688rem;
  }

  .year-title {
    font-size: 0.563rem;
  }

  .day-cell {
    min-height: 28px;
  }

  .date-number {
    font-size: 0.688rem;
  }

  .weekday-cell {
    font-size: 0.563rem;
  }
}

/* Backdrop overlay for mobile dropdown */
.period-dropdown::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.2s ease;
}

@media (max-width: 600px) {
  .period-dropdown::before {
    opacity: 1;
  }
  
  /* Improve grid spacing on mobile */
  .days-grid {
    gap: 0.25rem;
  }
  
  /* Better touch targets */
  .day-cell {
    min-height: 38px;
    border-radius: 6px;
  }
}
</style>