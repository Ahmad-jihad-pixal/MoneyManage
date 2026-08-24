import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useauthStore } from '@/stores/authStore.js'
import { toast } from '@/components/ui/sonner'

export const useGoalStore = defineStore('goal', () => {
  const authStore = useauthStore()
  const goal = ref([])
  const goalHistory = ref([])
  const name = ref()
  const targetAmount = ref()
  const moveAccountId = ref()
  const moveAmount = ref()
  const moveType = ref('IN')
  const moveDate = ref()

  const fetchGoal = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/goal', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      if (!response.ok) throw new Error('faild fetch goals')

      goal.value = await response.json()
    } catch (error) {
      console.error('Error fetching goal:', error)
    }
  }

  //create goal

  const createGoal = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          name: name.value,
          targetAmount: targetAmount.value,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to create goal')

      // POST returns the bare goal row — savedAmount/progress are computed
      // server-side on read only, so re-fetch instead of pushing the response
      // (otherwise the new card's progress bar is NaN until a manual refresh).
      await fetchGoal()

      name.value = null
      targetAmount.value = null
      toast.success('Goal created')
      return true
    } catch (error) {
      console.error('Error creating goal:', error)
      toast.error(error.message)
      return false
    }
  }

  // make trsfer to goal
  const moveGoalMoney = async (goalId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/goal/${goalId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          accountId: moveAccountId.value,
          amount: moveAmount.value,
          type: moveType.value,
          date: new Date(moveDate.value.toString()).toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to move goal money')
      }

      // refresh this goal's numbers so the card updates (saved amount, progress)
      await fetchGoal()

      moveAccountId.value = null
      moveAmount.value = null
      moveType.value = 'IN'
      moveDate.value = null

      toast.success('Goal updated')
      return true
    } catch (error) {
      console.error('Error moving goal money:', error)
      toast.error(error.message)
      return false
    }
  }

  //update goal name/target
  const updateGoal = async (id, newName, newTargetAmount) => {
    try {
      const response = await fetch(`http://localhost:3000/api/goal/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ name: newName, targetAmount: newTargetAmount }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to update goal')

      await fetchGoal()
      toast.success('Goal updated')
      return true
    } catch (error) {
      console.error('Error updating goal:', error)
      toast.error(error.message)
      return false
    }
  }

  //fetch a goal's transfer history
  const fetchGoalHistory = async (goalId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/goal/${goalId}/goaltransfer`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch goal history')

      goalHistory.value = await response.json()
    } catch (error) {
      console.error('Error fetching goal history:', error)
      toast.error(error.message)
    }
  }

  //delete goal
  const deleteGoal = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/goal/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || 'Failed to delete goal')

      goal.value = goal.value.filter((g) => g.id !== id)
      toast.success('Goal deleted')
      return true
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error(error.message)
      return false
    }
  }

  return {
    fetchGoal,
    createGoal,
    moveGoalMoney,
    updateGoal,
    deleteGoal,
    fetchGoalHistory,
    goal,
    goalHistory,
    name,
    targetAmount,
    moveAccountId,
    moveAmount,
    moveType,
    moveDate,
  }
})
