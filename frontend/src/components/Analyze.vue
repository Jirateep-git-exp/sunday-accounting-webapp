<template>
  <div class="analyze container-fluid">
    <!-- ส่วนหัว (Period Selector และ Export/Import) -->
    <div class="section-header mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <!-- Period Selector -->
        <div class="d-flex flex-wrap align-items-center gap-3">
          <div class="period-selector d-flex align-items-center gap-3">
            <div class="input-group month-select">
              <span class="input-group-text"><i class="fa-solid fa-calendar"></i></span>
              <select v-model="selectedMonth" class="form-select">
                <option v-for="(month, index) in months" :key="index" :value="index">
                  {{ month }}
                </option>
              </select>
            </div>
            <!-- Modal เปรียบเทียบรายจ่ายระหว่างเดือน -->
            <div v-if="showCompareModal" class="compare-modal-overlay" @click.self="showCompareModal = false">
              <div class="compare-modal-content">
                <div class="modal-header d-flex justify-content-between align-items-center">
                  <h4 class="mb-0">เปรียบเทียบรายจ่ายระหว่างเดือน</h4>
                  <button type="button" class="btn btn-danger" @click="showCompareModal = false">x</button>
                </div>
                <div class="modal-body">
                  <div class="row g-3 mb-3">
                    <div class="col-12 col-md-6">
                      <label>เดือนที่ 1</label>
                      <select v-model="compareMonth1" class="form-select">
                        <option v-for="(month, idx) in months" :key="idx" :value="idx">{{ month }}</option>
                      </select>
                    </div>
                    <div class="col-12 col-md-6">
                      <label>ปีที่ 1</label>
                      <select v-model="compareYear1" class="form-select">
                        <option v-for="year in yearRange" :key="year" :value="year">{{ year + 543 }}</option>
                      </select>
                    </div>
                    <div class="col-12 col-md-6">
                      <label>เดือนที่ 2</label>
                      <select v-model="compareMonth2" class="form-select">
                        <option v-for="(month, idx) in months" :key="idx" :value="idx">{{ month }}</option>
                      </select>
                    </div>
                    <div class="col-12 col-md-6">
                      <label>ปีที่ 2</label>
                      <select v-model="compareYear2" class="form-select">
                        <option v-for="year in yearRange" :key="year" :value="year">{{ year + 543 }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="compare-result mt-3">
                    <h5>ผลเปรียบเทียบ</h5>
                    <div class="row g-3">
                      <div class="col-12 col-md-6">
                        <div class="card p-3">
                          <h6 class="mb-2">{{ months[compareMonth1] }} {{ compareYear1 + 543 }}</h6>
                          <div class="fs-4 text-danger">{{ formatAmount(expenseTotalMonth(compareMonth1, compareYear1))
                          }} ฿</div>
                        </div>
                      </div>
                      <div class="col-12 col-md-6">
                        <div class="card p-3">
                          <h6 class="mb-2">{{ months[compareMonth2] }} {{ compareYear2 + 543 }}</h6>
                          <div class="fs-4 text-danger">{{ formatAmount(expenseTotalMonth(compareMonth2, compareYear2))
                          }} ฿</div>
                        </div>
                      </div>
                    </div>
                    <div class="mt-3">
                      <span
                        v-if="expenseTotalMonth(compareMonth1, compareYear1) > expenseTotalMonth(compareMonth2, compareYear2)"
                        class="text-success">
                        เดือนที่ 1 มีรายจ่ายมากกว่าเดือนที่ 2 {{ formatAmount(expenseTotalMonth(compareMonth1,
                          compareYear1) - expenseTotalMonth(compareMonth2, compareYear2)) }} ฿
                      </span>
                      <span
                        v-else-if="expenseTotalMonth(compareMonth1, compareYear1) < expenseTotalMonth(compareMonth2, compareYear2)"
                        class="text-danger">
                        เดือนที่ 2 มีรายจ่ายมากกว่าเดือนที่ 1 {{ formatAmount(expenseTotalMonth(compareMonth2,
                          compareYear2) - expenseTotalMonth(compareMonth1, compareYear1)) }} ฿
                      </span>
                      <span v-else class="text-muted">รายจ่ายเท่ากันทั้งสองเดือน</span>
                    </div>
                  </div>
                </div>
              </div>
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

        <!-- Buttons -->
        <div class="action-buttons d-flex gap-2">
          <button class="btn btn-outline-secondary" type="button" @click="showCompareModal = true">
            <i class="fa-solid fa-chart-column me-2"></i>
            เปรียบเทียบรายจ่าย
          </button>
          <div class="dropdown">
            <button class="btn btn-primary" type="button" data-bs-toggle="dropdown">
              <i class="fa-solid fa-download me-2"></i>
              ดาวน์โหลด
            </button>
            <ul class="dropdown-menu">
              <li class="dropdown-header">เลือกประเภทรายการ</li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li>
                <div class="px-3 py-2">
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" v-model="exportType" value="all" id="exportAll">
                    <label class="form-check-label" for="exportAll">
                      ทั้งรายรับและรายจ่าย
                    </label>
                  </div>
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" v-model="exportType" value="income" id="exportIncome">
                    <label class="form-check-label" for="exportIncome">
                      รายรับ
                    </label>
                  </div>
                  <div class="form-check mb-3">
                    <input class="form-check-input" type="radio" v-model="exportType" value="expense"
                      id="exportExpense">
                    <label class="form-check-label" for="exportExpense">
                      รายจ่าย
                    </label>
                  </div>
                  <div class="d-grid gap-2">
                    <button class="btn btn-sm btn-outline-success" @click="exportToViewExcel">
                      <i class="bi bi-file-earmark-spreadsheet me-1"></i>
                      ดาวน์โหลดรายงาน Excel
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row g-4">
      <div class="col-12 col-md-4">
        <div class="summary-card income" @click="showTransactionDetails('income')" ref="incomeCard">
          <div class="card-body">
            <div class="d-flex align-items-center gap-3">
              <div class="icon-wrapper">
                <i class="fa-solid fa-arrow-trend-up"></i>
              </div>
              <div>
                <h6 class="mb-1">รายรับทั้งหมด</h6>
                <h3 class="mb-0 text-success">{{ formatAmount(totalIncome) }} ฿</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="summary-card expense" @click="showTransactionDetails('expense')" ref="expenseCard">
          <div class="card-body">
            <div class="d-flex align-items-center gap-3">
              <div class="icon-wrapper">
                <i class="fa-solid fa-arrow-trend-down"></i>
              </div>
              <div>
                <h6 class="mb-1">รายจ่ายทั้งหมด</h6>
                <h3 class="mb-0 text-danger">{{ formatAmount(totalExpenses) }} ฿</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="summary-card balance" @click="showTransactionDetails('all')" ref="balanceCard">
          <div class="card-body">
            <div class="d-flex align-items-center gap-3">
              <div class="icon-wrapper">
                <i class="fa-solid fa-wallet"></i>
              </div>
              <div>
                <h6 class="mb-1">คงเหลือ</h6>
                <h3 class="mb-0 text-primary">{{ formatAmount(balance) }} ฿</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row g-4 mt-4" ref="chartsSection">
      <!-- Income Chart -->
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title mb-4">สัดส่วนรายรับตามหมวดหมู่</h5>
            <div v-if="incomeChartData.labels.length > 0" class="chart-container">
              <canvas ref="incomeChart"></canvas>
            </div>
            <div v-else class="empty-state">
              <i class="bi bi-pie-chart"></i>
              <p>ไม่พบข้อมูลรายรับในช่วงเวลาที่เลือก</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Expenses Chart -->
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title mb-4">สัดส่วนรายจ่ายตามหมวดหมู่</h5>
            <div v-if="expenseChartData.labels.length > 0" class="chart-container">
              <canvas ref="expenseChart"></canvas>
            </div>
            <div v-else class="empty-state">
              <i class="bi bi-pie-chart"></i>
              <p>ไม่พบข้อมูลรายจ่ายในช่วงเวลาที่เลือก</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Details -->
    <div v-if="showDetails" class="row mt-4" ref="transactionDetails">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="card-title mb-0">
                {{
                  selectedType === 'income' ? 'รายการรายรับ' :
                    selectedType === 'expense' ? 'รายการรายจ่าย' :
                      'รายการทั้งหมด'
                }}
                ประจำเดือน {{ months[selectedMonth] }} {{ selectedYear + 543 }}
              </h5>
              <button class="btn-close" @click="showDetails = false"></button>
            </div>

            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th @click="sort('date')" :class="{ 'sortable': true }">
                      วันที่
                      <i v-if="getSortIcon('date')" :class="getSortIcon('date')"></i>
                    </th>
                    <th @click="sort('type')" :class="{ 'sortable': true }">
                      ประเภท
                      <i v-if="getSortIcon('type')" :class="getSortIcon('type')"></i>
                    </th>
                    <th @click="sort('category')" :class="{ 'sortable': true }">
                      หมวดหมู่
                      <i v-if="getSortIcon('category')" :class="getSortIcon('category')"></i>
                    </th>
                    <th @click="sort('description')" :class="{ 'sortable': true }">
                      รายละเอียด
                      <i v-if="getSortIcon('description')" :class="getSortIcon('description')"></i>
                    </th>
                    <th @click="sort('amount')" class="text-end sortable">
                      จำนวนเงิน
                      <i v-if="getSortIcon('amount')" :class="getSortIcon('amount')"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in paginatedData" :key="item.id"
                    :class="item.type === 'income' ? 'table-success' : 'table-danger'">
                    <td>{{ formatDate(item.date) }}</td>
                    <td>{{ item.type === 'income' ? 'รายรับ' : 'รายจ่าย' }}</td>
                    <td>{{ getPocketName(item.pocketId, item.type) }}</td>
                    <td>{{ item.description }}</td>
                    <td class="text-end">{{ formatAmount(item.amount) }} ฿</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="table-light fw-bold">
                    <td colspan="4" class="text-end">รวม</td>
                    <td class="text-end">{{ formatAmount(totalAmount) }} ฿</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Pagination Controls -->
            <div class="pagination-controls mt-3">
              <button class="btn btn-outline-primary" @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1">
                <i class="fa-solid fa-chevron-left"></i>
                ก่อนหน้า
              </button>
              <span class="current-page">
                หน้า {{ currentPage }} / {{ Math.ceil(sortedData.length / itemsPerPage) }}
              </span>
              <button class="btn btn-outline-primary"
                @click="currentPage = Math.min(Math.ceil(sortedData.length / itemsPerPage), currentPage + 1)"
                :disabled="currentPage === Math.ceil(sortedData.length / itemsPerPage)">
                ถัดไป
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import Chart from 'chart.js/auto'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import addThaiFonts from '../utils/fonts'
import * as XLSX from 'xlsx'
import Swal from 'sweetalert2'

export default {
  name: 'Analyze',
  setup() {
    const store = useStore()
    // Add refs
    const incomeChart = ref(null)
    const expenseChart = ref(null)
    const chartsSection = ref(null) // Add this line
    const transactionDetails = ref(null) // Add this line
    const exportType = ref('all')
    const showDetails = ref(false)
    const selectedType = ref('all')
    const showCompareModal = ref(false)
    const compareMonth1 = ref(new Date().getMonth())
    const compareYear1 = ref(new Date().getFullYear())
    const compareMonth2 = ref(new Date().getMonth())
    const compareYear2 = ref(new Date().getFullYear())

    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]

    const currentYear = new Date().getFullYear()
    const yearRange = Array.from(
      { length: 11 },
      (_, i) => currentYear - 5 + i
    )

    const selectedMonth = ref(new Date().getMonth())
    const selectedYear = ref(currentYear)

    // Chart Data Computeds
    const filteredIncome = computed(() => {
      return store.state.income.filter(item => {
        const date = new Date(item.date)
        return date.getMonth() === selectedMonth.value &&
          date.getFullYear() === selectedYear.value
      })
    })

    const filteredExpenses = computed(() => {
      return store.state.expenses.filter(item => {
        const date = new Date(item.date)
        return date.getMonth() === selectedMonth.value &&
          date.getFullYear() === selectedYear.value
      })
    })

    // ฟังก์ชันคำนวณรายจ่ายรวมของแต่ละเดือน
    const expenseTotalMonth = (month, year) => {
      return store.state.expenses
        .filter(item => {
          const d = new Date(item.date)
          return d.getMonth() === month && d.getFullYear() === year
        })
        .reduce((sum, item) => sum + Number(item.amount), 0)
    }

    const incomeChartData = computed(() => {
      const data = {}
      filteredIncome.value.forEach(item => {
        const pocket = store.state.pockets.find(p => p._id === item.pocketId)
        const category = pocket ? pocket.name : 'ไม่ระบุหมวดหมู่'
        data[category] = (data[category] || 0) + Number(item.amount)
      })

      return {
        labels: Object.keys(data),
        data: Object.values(data)
      }
    })

    const expenseChartData = computed(() => {
      const data = {}
      filteredExpenses.value.forEach(item => {
        const pocket = store.state.pockets.find(p => p._id === item.pocketId)
        const category = pocket ? pocket.name : 'ไม่ระบุหมวดหมู่'
        data[category] = (data[category] || 0) + Number(item.amount)
      })

      return {
        labels: Object.keys(data),
        data: Object.values(data)
      }
    })

    const totalIncome = computed(() => {
      return filteredIncome.value.reduce((sum, item) => sum + Number(item.amount), 0)
    })

    const totalExpenses = computed(() => {
      return filteredExpenses.value.reduce((sum, item) => sum + Number(item.amount), 0)
    })

    const balance = computed(() => {
      return totalIncome.value - totalExpenses.value
    })

    // Methods
    const formatAmount = (amount) => {
      return Number(amount).toLocaleString('th-TH')
    }

    const createChart = (canvas, data, type) => {
      // Pastel colors for income
      const incomeColors = [
        '#4ade80', // Green
        '#34d399', // Emerald
        '#2dd4bf', // Teal
        '#22d3ee', // Cyan
        '#38bdf8', // Light Blue
        '#60a5fa', // Blue
        '#818cf8', // Indigo
        '#a78bfa', // Violet
        '#c084fc', // Purple
        '#e879f9'  // Fuchsia
      ]

      // Pastel colors for expenses
      const expenseColors = [
        '#fb7185', // Rose
        '#f472b6', // Pink
        '#e879f9', // Fuchsia
        '#c084fc', // Purple
        '#a78bfa', // Violet
        '#818cf8', // Indigo
        '#7dd3fc', // Sky
        '#67e8f9', // Cyan
        '#5eead4', // Teal
        '#86efac'  // Green
      ]

      // เลือกชุดสีตามประเภท
      const colors = type === 'income' ? incomeColors : expenseColors

      // ทำลายกราฟเก่าถ้ามี
      if (canvas._chart) {
        canvas._chart.destroy()
      }

      const chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.data,
            backgroundColor: colors.slice(0, data.labels.length),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  family: 'Prompt',
                  size: 12
                },
                padding: 15
              }
            }
          },
          animation: {
            duration: 1000
          }
        }
      })

      // เก็บ instance ไว้สำหรับการทำลายภายหลัง
      canvas._chart = chart
      return chart
    }

    const updateCharts = () => {
      // อัพเดทกราฟรายรับ
      if (incomeChart.value && incomeChartData.value.labels.length > 0) {
        createChart(incomeChart.value, incomeChartData.value, 'income')
      }
      // อัพเดทกราฟรายจ่าย
      if (expenseChart.value && expenseChartData.value.labels.length > 0) {
        createChart(expenseChart.value, expenseChartData.value, 'expense')
      }
    }

    // Helper function to get data based on export type
    const getExportData = () => {
      const data = {
        income: [],
        expense: []
      }

      if (exportType.value === 'all' || exportType.value === 'income') {
        data.income = filteredIncome.value.map(item => ({
          date: new Date(item.date).toLocaleDateString('th-TH'),
          type: 'รายรับ',
          category: store.state.pockets.find(p => p._id === item.pocketId)?.name || 'ไม่ระบุ',
          description: item.description,
          amount: Number(item.amount).toLocaleString('th-TH')
        }))
      }

      if (exportType.value === 'all' || exportType.value === 'expense') {
        data.expense = filteredExpenses.value.map(item => ({
          date: new Date(item.date).toLocaleDateString('th-TH'),
          type: 'รายจ่าย',
          category: store.state.pockets.find(p => p._id === item.pocketId)?.name || 'ไม่ระบุ',
          description: item.description,
          amount: Number(item.amount).toLocaleString('th-TH')
        }))
      }

      return exportType.value === 'all'
        ? [...data.income, ...data.expense]
        : data[exportType.value]
    }

    // ฟังก์ชันสำหรับ export Excel แบบดูรายงาน
    const exportToViewExcel = () => {
      try {
        const data = getExportData()

        const summaryRows = [
          ['รายงานรายรับรายจ่าย', '', '', '', ''],
          [`เดือน: ${months[selectedMonth.value]}`, '', '', '', ''],
          [`ปี: ${selectedYear.value + 543}`, '', '', '', ''],
          ['รวมรายรับ', formatAmount(totalIncome.value), '', '', ''],
          ['รวมรายจ่าย', formatAmount(totalExpenses.value), '', '', ''],
          ['คงเหลือ', formatAmount(balance.value), '', '', ''],
          [], // เว้นบรรทัด
          ['วันที่', 'ประเภท', 'หมวดหมู่', 'รายละเอียด', 'จำนวนเงิน']
        ]

        // รวม summary กับข้อมูลหลัก
        const exportRows = [
          ...summaryRows,
          ...data.map(item => [
            item.date,
            item.type,
            item.category,
            item.description,
            item.amount
          ])
        ]

        // สร้าง worksheet
        const ws = XLSX.utils.aoa_to_sheet(exportRows)

        // ปรับแต่งความกว้างคอลัมน์
        const wscols = [
          { wch: 12 }, // วันที่
          { wch: 10 }, // ประเภท
          { wch: 15 }, // หมวดหมู่
          { wch: 30 }, // รายละเอียด
          { wch: 12 }  // จำนวนเงิน
        ]
        ws['!cols'] = wscols

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'รายงาน')

        // บันทึกไฟล์
        XLSX.writeFile(wb, `รายงานรายรับรายจ่ายเดือน_${months[selectedMonth.value]}_${selectedYear.value + 543}.xlsx`)
      } catch (error) {
        console.error('Excel Export Error:', error)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถส่งออกรายงานได้'
        })
      }
    }

    onMounted(() => {
      updateCharts()
    })

    onMounted(() => {
      // โหลดฟอนต์ไทย
      addThaiFonts()
    })

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('th-TH')
    }

    const getPocketName = (pocketId, type) => {
      const pockets = type === 'income' ? store.getters.incomePockets : store.getters.expensePockets
      const pocket = pockets.find(p => p._id === pocketId)
      return pocket?.name || 'ไม่ระบุหมวดหมู่'
    }

    const filteredTransactions = computed(() => {
      let transactions = []
      if (selectedType.value === 'income') {
        transactions = filteredIncome.value.map(item => ({ ...item, type: 'income' }))
      } else if (selectedType.value === 'expense') {
        transactions = filteredExpenses.value.map(item => ({ ...item, type: 'expense' }))
      } else {
        transactions = [
          ...filteredIncome.value.map(item => ({ ...item, type: 'income' })),
          ...filteredExpenses.value.map(item => ({ ...item, type: 'expense' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date))
      }
      return transactions
    })

    const totalAmount = computed(() => {
      if (selectedType.value === 'income') return totalIncome.value
      if (selectedType.value === 'expense') return totalExpenses.value
      return balance.value
    })

    const scrollToSection = (ref) => {
      nextTick(() => {
        if (ref.value) {
          ref.value.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      })
    }

    const showTransactionDetails = (type) => {
      selectedType.value = type
      showDetails.value = true
      nextTick(() => {
        scrollToSection(transactionDetails)
      })
    }

    // Add to script setup in each component that has a table
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

    // เพิ่ม pagination สำหรับตารางแสดงรายการ
    const itemsPerPage = ref(10)
    const currentPage = ref(1)

    const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
    const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, sortedData.value.length))

    // Sorted data computed property
    const sortedData = computed(() => {
      const data = [...filteredTransactions.value] // or whatever your data source is

      return data.sort((a, b) => {
        let compareResult = 0

        switch (sortConfig.value.key) {
          case 'date':
            compareResult = new Date(a.date) - new Date(b.date)
            break
          case 'amount':
            compareResult = Number(a.amount) - Number(b.amount)
            break
          case 'type':
            compareResult = a.type.localeCompare(b.type)
            break
          case 'category':
            compareResult = getPocketName(a.pocketId, a.type).localeCompare(getPocketName(b.pocketId, b.type))
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

    // เพิ่ม paginatedData
    const paginatedData = computed(() => {
      return sortedData.value.slice(startIndex.value, endIndex.value)
    })

    return {
      months,
      yearRange,
      selectedMonth,
      selectedYear,
      incomeChart,
      expenseChart,
      totalIncome,
      totalExpenses,
      balance,
      formatAmount,
      incomeChartData,
      expenseChartData,
      exportType,
      exportToViewExcel,
      showDetails,
      selectedType,
      formatDate,
      getPocketName,
      filteredTransactions,
      totalAmount,
      chartsSection,
      transactionDetails,
      scrollToSection,
      showTransactionDetails,
      sort,
      getSortIcon,
      sortedData,
      itemsPerPage,
      currentPage,
      startIndex,
      endIndex,
      paginatedData,
      showCompareModal,
      compareMonth1,
      compareYear1,
      compareMonth2,
      compareYear2,
      expenseTotalMonth
    }
  }
}
</script>

<style scoped>
.section-header {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.period-selector .input-group {
  min-width: 160px;
  background: white;
  border-radius: var(--border-radius);
}

.period-selector .input-group-text {
  background: transparent;
  border-color: var(--border-color);
}

.form-select {
  border-color: var(--border-color);
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-select:hover {
  border-color: var(--primary-color);
}

/* Summary Cards Styling */
.summary-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-card .card-body {
  color: white;
  padding: 1rem;
}

.summary-card h6 {
  font-size: 1rem;
  color: var(--text-light);
}

.summary-card h3 {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
}

/* Icon Wrappers */
.icon-wrapper {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  font-size: 1.5rem;
}

/* Income Card */
.income .icon-wrapper {
  background: #e8f5e9;
  color: #2e7d32;
}

/* Expense Card */
.expense .icon-wrapper {
  background: #ffebee;
  color: #c62828;
}

/* Balance Card */
.balance .icon-wrapper {
  background: #e3f2fd;
  color: #1565c0;
}

.chart-container {
  min-height: 350px;
  padding: 1rem;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: var(--text-light);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.sortable {
  cursor: pointer;
}

.sortable:hover {
  text-decoration: underline;
}

.sortable i {
  margin-left: 0.5rem;
  opacity: 0.7;
}

/* Pagination Controls */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.current-page {
  font-size: 0.9rem;
  color: var(--text-dark);
}

.btn-outline-primary {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-outline-primary:disabled {
  color: var(--text-muted);
  border-color: var(--text-muted);
}

/* Modal เปรียบเทียบรายจ่าย */
.compare-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.25);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compare-modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  padding: 2rem 1.5rem;
  position: relative;
}

.compare-modal-content .modal-header {
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
}

.compare-modal-content .btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}

.compare-modal-content .modal-body label {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.compare-result .card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .period-selector {
    width: 100%;
    flex-wrap: wrap;
  }

  .input-group {
    flex: 1;
    min-width: 140px;
  }
}
</style>