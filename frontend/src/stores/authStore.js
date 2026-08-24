import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useauthStore = defineStore('Auth', () => {
  //set the defult value to read token from session becuse without if the user refresh the page the token value gonna be null and have to login agin
  const token = ref(sessionStorage.getItem('token'))
  const password = ref()
  const Name = ref()
  const email = ref()
  const router = useRouter()

  //   call POST /api/login with email + password
  //         ↓
  // get token back from response
  //         ↓
  // save token in sessionStorage
  //         ↓
  // save token in token ref
  //         ↓
  // redirect to dashboard

  // login

  //hold the server's reason for a failed login/signup so the forms can show it in red
  const loginError = ref('')
  const registerError = ref('')

  const login = async () => {
    loginError.value = ''
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, password: password.value }),
      })

      const data = await response.json()

      //NOTE: /api/login answers with { error }, not { message } like the other routes
      if (!response.ok) throw new Error(data.error || 'Failed to log in')

      sessionStorage.setItem('token', data.token)
      token.value = data.token
      router.push('/')

      // Null for resetting the fields
      password.value = null
      email.value = null
      return true
    } catch (error) {
      console.error('error in login', error)
      loginError.value =
        error instanceof TypeError ? 'Cannot reach the server' : error.message
      return false
    }
  }

  //  logout function
  //   clear token from sessionStorage
  //         ↓
  // set token ref to null
  //         ↓
  // redirect to login page
  const logout = async () => {
    sessionStorage.removeItem('token')
    token.value = null
    router.push('/login')
  }

  //   Step 5 — isLoggedIn computed
  // return true if token exists
  // return false if token is null
  //made it in another way ,define a liogin vaiable set false as defulat when login function call and reponse ok make ture and when user logout make false
  const isLoggedIn = computed(() => {
    if (token.value) {
      return true
    } else {
      return false
    }
  })

  //register post
  const register = async () => {
    registerError.value = ''
    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: Name.value,
          email: email.value,
          password: password.value,
        }),
      })
      const data = await response.json()

      //NOTE: register.js answers 400s with { message } but its 500 with { error }
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to register')

      router.push('/login')
      Name.value = null
      email.value = null
      password.value = null
      return true
    } catch (err) {
      console.error('Error saving new user(front) :', err)
      registerError.value =
        err instanceof TypeError ? 'Cannot reach the server' : err.message
      return false
    }
  }

  return {
    token,
    email,
    password,
    Name,
    login,
    loginError,
    registerError,
    logout,
    register,
    isLoggedIn,
  }
})
