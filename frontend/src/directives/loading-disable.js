// v-loading-disable: disables element when global store is loading
import store from '../store'

export default {
  mounted(el) {
    const update = () => {
      const disabled = store.getters.isLoading
      if ('disabled' in el) el.disabled = !!disabled
      el.style.pointerEvents = disabled ? 'none' : ''
      el.style.opacity = disabled ? '0.6' : ''
      el.style.cursor = disabled ? 'not-allowed' : ''
    }
    el.__loadingUpdate__ = update
    update()
    el.__loadingInterval__ = setInterval(update, 150) // lightweight polling
  },
  unmounted(el) {
    clearInterval(el.__loadingInterval__)
    delete el.__loadingInterval__
    delete el.__loadingUpdate__
  }
}
