<template>
  <div class="">
    <div>Signing in with LINE...</div>
  </div>
  <LoadingOverlay />
</template>

<script>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'
import LoadingOverlay from '../shared/LoadingOverlay.vue'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()

    onMounted(async () => {
      const token = route.query.token
      const linked = route.query.linked === 'true'
      const error = route.query.error
      const isFirst = route.query.first === 'true'
      const addFriendUrl = typeof route.query.addfriend === 'string' && route.query.addfriend
        ? decodeURIComponent(route.query.addfriend)
        : null

      if (error === 'lineid_in_use') {
        await Swal.fire({
          icon: 'error',
          title: 'Linking failed',
          text: 'This LINE account is already linked. Please use another LINE account.',
          confirmButtonText: 'Go to Settings'
        })
        return router.replace('/settings')
      }

      if (linked) {
        // Linked successfully while already logged in; just refresh data
        try {
          await Promise.all([
            store.dispatch('fetchPockets'),
            store.dispatch('fetchIncome'),
            store.dispatch('fetchExpenses')
          ])
        } catch (e) { }
        return router.push('/dashboard')
      }

      if (token) {
        // ✅ Store token and set expiry (6 hours)
        store.commit('setToken', token)
        const expireAt = Date.now() + 6 * 60 * 60 * 1000
        localStorage.setItem('token_expire_at', String(expireAt))

        // ✅ On first LINE login with an Add Friend link, prompt user before navigating
        if (isFirst && addFriendUrl) {
          try {
            const result = await Swal.fire({
              icon: 'info',
              title: 'Welcome!',
              html: 'To receive notifications and use LINE features fully, please add our LINE Official account as a friend.',
              confirmButtonText: 'Add LINE OA',
              cancelButtonText: 'Skip for now',
              showCancelButton: false,
            })
            if (result.isConfirmed) {
              // Open in a new tab to not disrupt app flow
              window.open(addFriendUrl, '_blank', 'noopener')
            }
          } catch (e) {
            // Ignore if Swal fails; don't block access
          }
        }

        // ✅ Preload main data before navigating (reduce empty screens and early 401s)
        try {
          await Promise.all([
            store.dispatch('fetchPockets'),
            store.dispatch('fetchIncome'),
            store.dispatch('fetchExpenses')
          ])
        } catch (e) {
          // If loading fails, clear state and go back to login
          store.commit('setToken', null)
          store.commit('setUser', null)
          localStorage.removeItem('token_expire_at')
          return router.push('/login')
        }

        const redirect = route.query.redirect && typeof route.query.redirect === 'string' ? decodeURIComponent(route.query.redirect) : '/dashboard'
        router.push(redirect)
      } else {
        console.error('❌ No token found in query parameters')
        router.push('/login')
      }
    })
  }
}
</script>
