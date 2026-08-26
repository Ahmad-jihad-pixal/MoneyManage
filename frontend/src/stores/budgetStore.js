import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useauthStore } from '@/stores/authStore.js'
import { toast } from '@/components/ui/sonner'

export const useBudgetStore = defineStore('budget', () => {
  const authStore = useauthStore()
  const budget = ref([])
  const categoryId = ref()
  const amount = ref()
  const period = ref()
  const autoReset = ref()

  const fetchBudget = async () => {
    try {
      const response = await fetch('/api/budget', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch budget')

      budget.value = await response.json()
    } catch (error) {
      console.error('Error fetching budget:', error)
    }
  }

  const createBudget = async () => {
    try {
      const response = await fetch('/api/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          categoryId: categoryId.value,
          amount: amount.value,
          period: period.value,
          autoReset: autoReset.value,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to create budget')

      await fetchBudget()
      categoryId.value = null
      amount.value = null
      period.value = null
      autoReset.value = null
      toast.success('Budget created')
      return true
    } catch (error) {
      console.error('Error creating budget:', error)
      toast.error(error.message)
      return false
    }
  }

  const deleteBudget = async (id) => {
    try {
      const response = await fetch(`/api/budget/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to delete budget')

      budget.value = budget.value.filter((b) => b.id !== id)
      toast.success('Budget deleted')
      return true
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error(error.message)
      return false
    }
  }

  return {
    budget,
    fetchBudget,
    categoryId,
    amount,
    period,
    autoReset,
    createBudget,
    deleteBudget,
  }
})
