import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useauthStore } from '@/stores/authStore.js'
import { toast } from '@/components/ui/sonner'

export const useCategoryStore = defineStore('categories', () => {
  const authStore = useauthStore()
  const categories = ref([])
  const name = ref()
  const type = ref('EXPENSE')
  const parentId = ref()

  const fetchCategory = async () => {
    try {
      const response = await fetch('/api/category', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      if (!response.ok) throw new Error('faild to fetch category')
      categories.value = await response.json()
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const createCategory = async () => {
    try {
      const response = await fetch('/api/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          name: name.value,
          type: type.value,
          parentId: parentId.value,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to create category')

      categories.value.push(data)

      name.value = null
      type.value = null
      parentId.value = null
      toast.success('Category created')
      return true
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error(error.message)
      return false
    }
  }

  //update category name (type/parent stay as they were)
  const updateCategory = async (id, newName) => {
    try {
      const existing = categories.value.find((c) => c.id === id)
      const response = await fetch(`/api/category/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          name: newName,
          type: existing?.type,
          parentId: existing?.parentId,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to update category')

      const index = categories.value.findIndex((c) => c.id === id)
      if (index !== -1) categories.value[index] = data
      toast.success('Category updated')
      return true
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error(error.message)
      return false
    }
  }

  //delete category
  const deleteCategory = async (id) => {
    try {
      const response = await fetch(`/api/category/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || 'Failed to delete category')

      categories.value = categories.value.filter((c) => c.id !== id)
      toast.success('Category deleted')
      return true
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error(error.message)
      return false
    }
  }

  return {
    categories,
    fetchCategory,
    name,
    type,
    parentId,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
