<script setup>
import goalCreate from '@/components/goalCreate.vue';
import GoalItem from '@/components/goalItem.vue'
import { useGoalStore } from '@/stores/goalStore'
import { onMounted } from 'vue'

const goalStore = useGoalStore()

onMounted(() => {
    goalStore.fetchGoal()
})
</script>
<template>
    <div>
        <goalCreate />
    </div>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <GoalItem v-for="g in goalStore.goal" :key="g.id" :goal="g" />
    </div>
</template>
