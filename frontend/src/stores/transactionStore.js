import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useauthStore } from '@/stores/authStore.js'
import { toast } from '@/components/ui/sonner'

export const useTransactionStore = defineStore('Transactions', () => {
  const authStore = useauthStore()
  const transactions = ref([])
  const categoryId = ref()
  const accountId = ref()
  const amount = ref()
  const note = ref()
  const date = ref()

  //  fetch all Transactions, optionally filtered
  const fetchTransactions = async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.accountId) params.set('accountId', filters.accountId)
      if (filters.categoryId) params.set('categoryId', filters.categoryId)
      if (filters.from) params.set('from', filters.from)
      if (filters.to) params.set('to', filters.to)
      const query = params.toString()

      const response = await fetch(
        `http://localhost:3000/api/transaction${query ? `?${query}` : ''}`,
        {
          headers: { Authorization: `Bearer ${authStore.token}` },
        },
      )
      if (!response.ok) throw new Error('faild to fetch transaction')
      transactions.value = await response.json()
    } catch (error) {
      console.error('Error fetching (front)transaction:', error)
    }
  }

  //create transaction
  const createTransaction = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
        body: JSON.stringify({
          categoryId: categoryId.value,
          accountId: accountId.value,
          amount: amount.value,
          date: new Date(date.value.toString()).toISOString(),
          note: note.value,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to create transaction')

      transactions.value.push(data)

      categoryId.value = null
      accountId.value = null
      amount.value = null
      date.value = null
      note.value = null
      toast.success('Transaction created')
      return true
    } catch (error) {
      console.error('Error create new transaction:', error)
      toast.error(error.message)
      return false
    }
  }

  //delete transaction
  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/transaction/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to delete transaction')

      transactions.value = transactions.value.filter((t) => t.id !== id)
      toast.success('Transaction deleted')
      return true
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error(error.message)
      return false
    }
  }

  return {
    transactions,
    categoryId,
    accountId,
    amount,
    note,
    date,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
  }
})
