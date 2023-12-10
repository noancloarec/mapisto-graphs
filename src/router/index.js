import { createRouter, createWebHistory } from 'vue-router'
import ParisMap from '../components/ParisMap.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/paris-bien-etre-1886'
    },
    {
      path: '/paris-bien-etre-1886',
      name: 'paris-bien-etre-1886',
      component: ParisMap
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
