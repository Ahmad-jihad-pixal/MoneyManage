import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useauthStore } from '@/stores/authStore.js'
import { toast } from '@/components/ui/sonner'

export const useAccountStore = defineStore('accounts', () => {
  const authStore = useauthStore()
  const accounts = ref([])
  const name = ref()
  const balance = ref()
  //fetch finction method defult methods is get
  // fetch all acoount from bd via api
  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      if (!response.ok) throw new Error('faild to fetch accounts')

      accounts.value = await response.json()
    } catch (error) {
      console.error('Error fetching account:', error)
    }
  }

  //create account

  const createAccount = async () => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          name: name.value,
          balance: balance.value,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to create account')

      accounts.value.push(data)

      name.value = null
      balance.value = null
      toast.success('Account created')
      return true
    } catch (error) {
      console.error('Error create new account:', error)
      toast.error(error.message)
      return false
    }
  }

  //update account name
  const updateAccount = async (id, newName) => {
    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ name: newName }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to update account')

      const index = accounts.value.findIndex((a) => a.id === id)
      if (index !== -1) accounts.value[index] = data
      toast.success('Account updated')
      return true
    } catch (error) {
      console.error('Error updating account:', error)
      toast.error(error.message)
      return false
    }
  }

  //delete account
  const deleteAccount = async (id) => {
    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to delete account')

      accounts.value = accounts.value.filter((a) => a.id !== id)
      toast.success('Account deleted')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error(error.message)
    }
  }

  return {
    accounts,
    name,
    balance,
    createAccount,
    fetchAccounts,
    updateAccount,
    deleteAccount,
  }
})
