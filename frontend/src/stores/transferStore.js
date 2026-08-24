import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useauthStore } from '@/stores/authStore.js'
import { toast } from '@/components/ui/sonner'

export const useTransferStore = defineStore('transfer', () => {
  const authStore = useauthStore()
  const transfer = ref([])
  const fromAccount = ref()
  const toAccount = ref()
  const amount = ref()
  const date = ref()

  const fetchTransfer = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/transfer', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      if (!response.ok) throw new Error('faild to fetch transfer ')
      transfer.value = await response.json()
    } catch (error) {
      console.error('Error fetching transfer(f):', error)
    }
  }

  //create  transfer
  const createTransfer = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          fromAccountId: fromAccount.value,
          toAccountId: toAccount.value,
          amount: amount.value,
          date: new Date(date.value.toString()).toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create transfer')
      }

      transfer.value.push(data)
      toast.success('Transfer created')

      return data
    } catch (error) {
      console.error('Error creating transfer:', error)
      toast.error(error.message)
      return false
    }
  }

  return {
    transfer,
    fromAccount,
    toAccount,
    amount,
    date,
    fetchTransfer,
    createTransfer,
  }
})
