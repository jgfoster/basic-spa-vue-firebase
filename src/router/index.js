import Vue from 'vue'
import Router from 'vue-router'
import { store } from '../store'

const routerOptions = [
  { path: '/', component: 'Landing' },
  { path: '/signin', component: 'Signin' },
  { path: '/home', component: 'Home', meta: { requiresAuth: true } },
  { path: '*', component: 'NotFound' }
]

const routes = routerOptions.map(route => {
  return {
    ...route,
    component: () => import(`@/components/${route.component}.vue`)
  }
})

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = store.getters.isAuthenticated
  if (requiresAuth && !isAuthenticated) {
    next('/signin')
  } else {
    next()
  }
})

export default router
