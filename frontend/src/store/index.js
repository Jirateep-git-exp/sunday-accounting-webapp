import { createStore } from 'vuex'
import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:5000/api'

export default createStore({
  state() {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    
    return {
      user: JSON.parse(localStorage.getItem('user')) || null,
      token: token || null,
      income: [],
      expenses: [],
      incomePockets: [],
      expensePockets: [],
      pockets: []
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    setToken(state, token) {
      state.token = token
      localStorage.setItem('token', token)
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        delete axios.defaults.headers.common['Authorization']
      }
    },
    clearAuth(state) {
      state.user = null
      state.token = null
      state.income = []
      state.expenses = []
      state.pockets = []
      state.incomePockets = []
      state.expensePockets = []
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
    setIncome(state, income) {
      state.income = income
    },
    setExpenses(state, expenses) {
      state.expenses = expenses
    },
    addIncome(state, incomeEntry) {
      state.income.push(incomeEntry)
    },
    addExpense(state, expenseEntry) {
      state.expenses.push(expenseEntry)
    },
    deleteIncome(state, id) {
      state.income = state.income.filter(item => item._id !== id)
    },
    deleteExpense(state, id) {
      state.expenses = state.expenses.filter(item => item._id !== id)
    },
    updateIncome(state, updatedIncome) {
      const index = state.income.findIndex(item => item._id === updatedIncome._id)
      if (index !== -1) {
        state.income.splice(index, 1, updatedIncome)
      }
    },
    updateExpense(state, updatedExpense) {
      const index = state.expenses.findIndex(item => item._id === updatedExpense._id)
      if (index !== -1) {
        state.expenses.splice(index, 1, updatedExpense)
      }
    },
    clearTransactions(state) {
      state.income = []
      state.expenses = []
    },
    setPockets(state, pockets) {
      state.pockets = pockets
    },
    addPocket(state, pocket) {
      state.pockets.push(pocket)
    },
    updatePocket(state, updatedPocket) {
      const index = state.pockets.findIndex(p => p._id === updatedPocket._id)
      if (index !== -1) {
        state.pockets.splice(index, 1, updatedPocket)
      }
    },
    deletePocket(state, pocketId) {
      state.pockets = state.pockets.filter(p => p._id !== pocketId)
    }
  },
  actions: {
    // Income actions
    // Pocket actions
    async fetchPockets({ commit }) {
      try {
        const response = await axios.get(`${API_URL}/pockets`)
        commit('setPockets', response.data)
      } catch (error) {
        console.error('Error fetching pockets:', error)
        throw error
      }
    },
    async fetchIncome({ commit }) {
      try {
        const response = await axios.get(`${API_URL}/income`)
        commit('setIncome', response.data)
      } catch (error) {
        console.error('Error fetching income:', error)
        throw error
      }
    },
    async addIncome({ commit }, income) {
      try {
        const response = await axios.post(`${API_URL}/income`, income)
        commit('addIncome', response.data)
        return response.data
      } catch (error) {
        console.error('Error adding income:', error)
        throw error
      }
    },
    async createIncome({ dispatch }, income) {
      try {
        await axios.post(`${API_URL}/income`, income)
        await dispatch('fetchIncome')
      } catch (error) {
        console.error('Error creating income:', error)
        throw error
      }
    },
    async createMultipleIncome({ dispatch }, incomes) {
      try {
        await axios.post(`${API_URL}/income/bulk`, { incomes })
        await dispatch('fetchIncome')
      } catch (error) {
        console.error('Error creating multiple income entries:', error)
        throw error
      }
    },
    async updateIncome({ dispatch }, { id, income }) {
      try {
        await axios.put(`${API_URL}/income/${id}`, income)
        await dispatch('fetchIncome')
      } catch (error) {
        console.error('Error updating income:', error)
        throw error
      }
    },
    async deleteIncome({ dispatch }, id) {
      try {
        await axios.delete(`${API_URL}/income/${id}`)
        await dispatch('fetchIncome')
      } catch (error) {
        console.error('Error deleting income:', error)
        throw error
      }
    },

    // Expense actions
    async fetchExpenses({ commit }) {
      try {
        const response = await axios.get(`${API_URL}/expenses`)
        commit('setExpenses', response.data)
      } catch (error) {
        console.error('Error fetching expenses:', error)
        throw error
      }
    },
    async addExpense({ commit }, expense) {
      try {
        const response = await axios.post(`${API_URL}/expenses`, expense)
        commit('addExpense', response.data)
        return response.data
      } catch (error) {
        console.error('Error adding expense:', error)
        throw error
      }
    },
    async createExpense({ dispatch }, expense) {
      try {
        await axios.post(`${API_URL}/expenses`, expense)
        await dispatch('fetchExpenses')
      } catch (error) {
        console.error('Error creating expense:', error)
        throw error
      }
    },
    async createMultipleExpenses({ dispatch }, expenses) {
      try {
        await axios.post(`${API_URL}/expenses/bulk`, { expenses })
        await dispatch('fetchExpenses')
      } catch (error) {
        console.error('Error creating multiple expenses:', error)
        throw error
      }
    },
    async updateExpense({ dispatch }, { id, expense }) {
      try {
        await axios.put(`${API_URL}/expenses/${id}`, expense)
        await dispatch('fetchExpenses')
      } catch (error) {
        console.error('Error updating expense:', error)
        throw error
      }
    },
    async deleteExpense({ dispatch }, id) {
      try {
        await axios.delete(`${API_URL}/expenses/${id}`)
        await dispatch('fetchExpenses')
      } catch (error) {
        console.error('Error deleting expense:', error)
        throw error
      }
    },
    async register({ commit }, credentials) {
      try {
        const response = await axios.post(`${API_URL}/auth/register`, credentials)
        const { user, token } = response.data.data
        commit('setUser', user)
        commit('setToken', token)
        // เพิ่มบันทึกเวลาหมดอายุ token (6 ชั่วโมง)
        const expireAt = Date.now() + 6 * 60 * 60 * 1000
        localStorage.setItem('token_expire_at', expireAt)
        return user
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Registration failed')
      }
    },
    async login({ commit }, credentials) {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials)
        const { user, token } = response.data.data
        commit('setUser', user)
        commit('setToken', token)
        // เพิ่มบันทึกเวลาหมดอายุ token (6 ชั่วโมง)
        const expireAt = Date.now() + 6 * 60 * 60 * 1000
        localStorage.setItem('token_expire_at', expireAt)
        return user
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Login failed')
      }
    },
    logout({ commit }) {
      commit('clearAuth')
      commit('clearTransactions')
      // ลบเวลาหมดอายุ token
      localStorage.removeItem('token_expire_at')
    },
    async fetchPockets({ commit }) {
      try {
        const response = await axios.get(`${API_URL}/pockets`)
        commit('setPockets', response.data)
        return response.data
      } catch (error) {
        console.error('Error fetching pockets:', error);
        if (error.message.includes('กรุณาเข้าสู่ระบบ') || error.response?.status === 401) {
          commit('setToken', null);
          commit('setUser', null);
        }
        throw error;
      }
    },
    async createPocket({ commit }, pocketData) {
      try {
        const response = await axios.post(`${API_URL}/pockets`, pocketData)
        commit('addPocket', response.data)
        return response.data
      } catch (error) {
        console.error('Error creating pocket:', error)
        throw error
      }
    },
    async updatePocket({ commit }, { id, data }) {
      try {
        const response = await axios.put(`${API_URL}/pockets/${id}`, data)
        commit('updatePocket', response.data)
        return response.data
      } catch (error) {
        console.error('Error updating pocket:', error)
        throw error
      }
    },
    async deletePocket({ commit }, id) {
      try {
        await axios.delete(`${API_URL}/pockets/${id}`)
        commit('deletePocket', id)
      } catch (error) {
        console.error('Error deleting pocket:', error)
        throw error
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    getUser: state => state.user,
    incomePockets: state => state.pockets.filter(p => p.type === 'income'),
    expensePockets: state => state.pockets.filter(p => p.type === 'expense'),
    getIncomeTransactions: state => state.income,
    getExpenseTransactions: state => state.expenses,
    // Helper getter to get transactions by pocket
    getTransactionsByPocket: (state) => (pocketId, type) => {
      const transactions = type === 'income' ? state.income : state.expenses
      return transactions.filter(t => t.pocketId === pocketId)
    },
    totalIncome: (state) => {
      return state.income.reduce((total, entry) => total + Number(entry.amount), 0)
    },
    totalExpenses: (state) => {
      return state.expenses.reduce((total, entry) => total + Number(entry.amount), 0)
    },
    balance: (state, getters) => {
      return getters.totalIncome - getters.totalExpenses
    }
  }
})