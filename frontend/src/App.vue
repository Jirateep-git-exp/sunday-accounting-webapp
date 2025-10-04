<template>
  <div :class="['app-container', { 'mobile-layout': isMobile }]">
    <Navbar />
    <main :class="['main-content', { 'mobile': isMobile }]">
      <div class="page-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Navbar from './components/shared/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const isMobile = ref(false)

    const currentPageTitle = computed(() => {
      return route.name || 'Dashboard'
    })

    const loadInitialData = async () => {
      if (store.getters.isAuthenticated) {
        try {
          await Promise.all([
            store.dispatch('fetchPockets'),
            store.dispatch('fetchIncome'),
            store.dispatch('fetchExpenses')
          ])
        } catch (error) {
          console.error('Error loading initial data:', error)
        }
      }
    }

    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768
    }

    onMounted(async () => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
      await loadInitialData()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
    })

    // Watch for auth state changes
    watch(() => store.getters.isAuthenticated, async (isAuth) => {
      if (isAuth) {
        await loadInitialData()
      }
    })

    return {
      currentPageTitle,
      isMobile
    }
  }
}
</script>

<style>
:root {
  --primary-color: #6c5ce7;
  --primary-light: #f8f5ff;
  --text-color: #2d3436;
  --text-light: #636e72;
  --background-color: #f8f9fa;
  --white: #ffffff;
  --sidebar-width: 250px;
}

body {
  margin: 0;
  font-family: 'Prompt', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
}

.app-container {
  display: flex;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  min-height: 100vh;
}

.page-header {
  background: var(--white);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eee;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-profile img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.page-content {
  padding: 2rem;
}

/* Global card styles */
.card {
  background: var(--white);
  border-radius: 1rem;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* Global button styles */
.btn-primary {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background: #5549d6;
  border-color: #5549d6;
}

.mobile-layout {
  flex-direction: column;
}

.main-content.mobile {
  margin-left: 0;
  margin-top: 60px;
}

/* Add smooth transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Improve mobile experience */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    margin-top: var(--header-height);
    min-height: calc(100vh - var(--header-height));
  }

  .page-content {
    padding: 1rem;
  }
}

/* Improve table responsiveness */
.table-responsive {
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 1.5rem;
}

@media (max-width: 576px) {
  .table th,
  .table td {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
}

/* Improved form styling */
.form-section {
  max-width: 500px;
  margin: 0 auto;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

/* Card hover effects */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

@media (max-width: 768px) {
  :root {
    --sidebar-width: 0;
  }
}
</style>