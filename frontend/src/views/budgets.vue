<script setup>
import budgetCreate from '@/components/budgetCreate.vue'
import budgetItem from '@/components/budgetItem.vue'
import { onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'

const categoryStore = useCategoryStore()

onMounted(() => {
    categoryStore.fetchCategory()
})
</script>
<template>
    <div>
        <budgetCreate />
    </div>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <budgetItem />
    </div>
</template>
