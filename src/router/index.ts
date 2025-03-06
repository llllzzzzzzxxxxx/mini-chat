import { createRouter, createWebHistory } from 'vue-router'
import ws from '@/utils/ws.js'
import Chat from '@/views/ChatPage.vue'
import Login from '@/views/LoginPage.vue'
import { useUserStore } from '@/stores/module/useUserStore'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/',
      name: 'chat',
      component: Chat,
    },
  ],
})

router.beforeEach((to, from, next) => {
  let token = window.localStorage.getItem('x-token')
  let user = window.localStorage.getItem('user')
  const userStore = useUserStore()
  if (token) {
    ws.connect(token)
    userStore.setToken(token)
    userStore.setUser(JSON.parse(user as string))
  }
  if (!token && to.path !== '/login') {
    next({ path: '/login' })
    return
  }
  if ((token && to.path === '/login') || !to.matched.length) {
    next({ path: '/' })
    return
  }
  next()
})

export default router
