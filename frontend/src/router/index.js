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
    //anything unrecognised goes home, where the guard below decides what happens
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

//the only two pages a signed-out visitor may see
const PUBLIC_ROUTES = ['login', 'signup']

router.beforeEach((to) => {
  //read sessionStorage directly rather than going through the Pinia store: the store
  //calls useRouter() during setup, which needs an injection context that navigation
  //guards don't have. This is the same value the store initialises itself from.
  const isLoggedIn = !!sessionStorage.getItem('token')
  const isPublic = PUBLIC_ROUTES.includes(to.name)

  //signed out and heading for an app page -> send to login
  if (!isLoggedIn && !isPublic) {
    return { name: 'login' }
  }

  //already signed in -> no reason to sit on login/signup again
  if (isLoggedIn && isPublic) {
    return { name: 'dashboard' }
  }
})

export default router
