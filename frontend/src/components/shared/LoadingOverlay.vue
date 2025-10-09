<template>
  <transition name="fade">
    <div v-if="isLoading" class="loading-overlay" aria-busy="true" aria-live="polite">
      <div class="loader">
        <div class="spinner"></div>
        <div class="text">กำลังโหลด...</div>
      </div>
    </div>
  </transition>
  
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'LoadingOverlay',
  setup() {
    const store = useStore()
    const isLoading = computed(() => store.getters.isLoading)
    return { isLoading }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: all; /* block interactions */
}
.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--primary-color, #6c5ce7);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.text {
  font-size: 0.9rem;
  color: #374151;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
