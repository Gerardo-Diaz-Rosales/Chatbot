import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LeadsView from '../views/LeadsView.vue'
import PotentialClientView from '../views/PotentialClientView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/posibles-clientes',
      name: 'posibles-clientes',
      component: LeadsView
    },
    {
      path: '/posible-cliente/:id',
      name: 'posible-cliente',
      component: PotentialClientView
    }
  ]
})

export default router
