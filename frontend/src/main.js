import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Import styles
import './assets/styles/main.scss'

// Import Bootstrap JS
import 'bootstrap'

const app = createApp(App)

// ตรวจสอบ token หมดอายุทุกครั้งที่โหลดแอป
const checkTokenExpire = () => {
  const expireAt = localStorage.getItem('token_expire_at')
  if (expireAt && Date.now() > Number(expireAt)) {
    store.dispatch('logout')
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }
}
checkTokenExpire()

app.use(router)
app.use(store)

// ตรวจสอบ token ทุกครั้งที่เปลี่ยน route
router.beforeEach((to, from, next) => {
  checkTokenExpire()
  next()
})

app.mount('#app')