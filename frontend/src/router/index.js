import { createRouter, createWebHistory } from 'vue-router'
import store from '../../../frontend/src/store'
import Dashboard from '../components/Dashboard.vue'
import Income from '../components/Income.vue'
import Expenses from '../components/Expenses.vue'
import Analyze from '../components/Analyze.vue'
import CloudPocket from '../components/CloudPocket.vue'
import Login from '../components/auth/Login.vue'
import Register from '../components/auth/Register.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/income',
    name: 'Income',
    component: Income,
    meta: { requiresAuth: true }
  },
  {
    path: '/expenses',
    name: 'Expenses',
    component: Expenses,
    meta: { requiresAuth: true }
  },
  {
    path: '/analyze',
    name: 'Analyze',
    component: Analyze,
    meta: { requiresAuth: true }
  },
  {
    path: '/cloudpocket',
    name: 'CloudPocket',
    component: CloudPocket,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const isAuthenticated = store.getters.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    next('/dashboard')
  } else {
    if (isAuthenticated && to.name !== 'Login' && to.name !== 'Register') {
      // Ensure data is loaded
      try {
        await Promise.all([
          store.dispatch('fetchPockets'),
          store.dispatch('fetchIncome'),
          store.dispatch('fetchExpenses')
        ])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    next()
  }
})

export default router