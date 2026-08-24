import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import account from '@/views/account.vue'
import dashboard from '@/views/dashboard.vue'
import transactions from '@/views/transactions.vue'
import transfers from '@/views/transfers.vue'
import goals from '@/views/goals.vue'
import budgets from '@/views/budgets.vue'
import categories from '@/views/Categories.vue'
import login from '@/views/login.vue'
import signup from '@/views/signup.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: dashboard,
        },
        {
          path: 'accounts',
          name: 'account',
          component: account,
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: transactions,
        },
        {
          path: 'transfers',
          name: 'transfers',
          component: transfers,
        },
        {
          path: 'goals',
          name: 'goals',
          component: goals,
        },
        {
          path: 'budgets',
          name: 'budgets',
          component: budgets,
        },
        {
          path: 'categories',
          name: 'categories',
          component: categories,
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: login,
    },
    {
      path: '/signup',
      name: 'signup',
      component: signup,
    },
  ],
})

export default router
