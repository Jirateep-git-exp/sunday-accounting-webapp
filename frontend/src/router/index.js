import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Dashboard from '../components/Dashboard.vue'
import Transaction from '../components/shared/MultipleTransactionForm.vue'
import Income from '../components/Income.vue'
import Expenses from '../components/Expenses.vue'
import Analyze from '../components/Analyze.vue'
import CloudPocket from '../components/CloudPocket.vue'
import Settings from '../components/Settings.vue'
import Onboarding from '../components/Onboarding.vue'
import ConnectLine from '../components/shared/ConnectLine.vue'
import Login from '../components/auth/Login.vue'
import Register from '../components/auth/Register.vue'
import LoginSuccess from '../components/shared/LoginSuccess.vue'
import OnboardingIntro from '../components/OnboardingIntro.vue'
import EditTransaction from '../components/shared/EditTransaction.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/tx/:type/:id/edit',
    name: 'EditTransaction',
    component: EditTransaction,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/login-success',
    name: 'LoginSuccess',
    component: LoginSuccess,
    // meta: { requiresGuest: true }
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
    path: '/transaction',
    name: 'Transaction',
    component: Transaction,
    // Provide required prop selectedDate with current date or from query
    props: (route) => ({
      selectedDate: route.query.date ? new Date(route.query.date) : new Date()
    }),
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
    path: '/onboarding',
    name: 'Onboarding',
    component: Onboarding
  },
  {
    path: '/getting-started',
    name: 'OnboardingIntro',
    component: OnboardingIntro
  },
  {
    path: '/onboarding-intro',
    redirect: { name: 'OnboardingIntro' }
  },
  {
    path: '/connect-line',
    name: 'ConnectLine',
    component: ConnectLine
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
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  
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
        const pockets = await store.dispatch('fetchPockets')
        // If first time: no pockets -> force onboarding intro unless already there
        if ((!pockets || pockets.length === 0) && !['OnboardingIntro','Onboarding'].includes(to.name)) {
          return next({ name: 'OnboardingIntro' })
        }
        await Promise.all([store.dispatch('fetchIncome'), store.dispatch('fetchExpenses')])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    next()
  }
})

export default router