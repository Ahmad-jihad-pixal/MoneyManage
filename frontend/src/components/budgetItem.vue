<script setup>
import { Trash2 } from '@lucide/vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { formatMoney } from '@/lib/format.js'

const categoryStore = useCategoryStore()
const budgetStore = useBudgetStore()

function categoryName(id) {
    const category = categoryStore.categories.find((c) => c.id === id)
    return category ? category.name : 'Unknown'
}

function periodLabel(period) {
    if (!period) return ''
    return period.charAt(0) + period.slice(1).toLowerCase()
}

onMounted(() => {
    budgetStore.fetchBudget()
    categoryStore.fetchCategory()
})
</script>

<template>
    <Card v-for="budget in budgetStore.budget" :key="budget.id" class="gap-4">
        <CardHeader>
            <div class="flex items-start justify-between">
                <div>
                    <CardTitle class="text-base font-bold">{{ categoryName(budget.categoryId) }}</CardTitle>
                    <CardDescription class="font-mono text-xs">
                        {{ periodLabel(budget.period) }} · {{ formatMoney(budget.amount) }}
                    </CardDescription>
                </div>
                <Badge
                    :variant="budget.progress > 100 ? 'destructive' : budget.progress >= 80 ? 'default' : 'secondary'"
                    class="text-[10px]">
                    {{ budget.progress > 100 ? 'Over limit' : budget.progress >= 80 ? 'Approaching' : 'On track' }}
                </Badge>
            </div>
        </CardHeader>
        <CardContent class="space-y-3">
            <Progress :model-value="Math.min(budget.progress, 100)"
                :class="budget.progress > 100 ? '[&>div]:bg-destructive' : ''" />
            <div class="flex items-center justify-between text-xs">
                <span class="font-mono">{{ formatMoney(budget.spentAmount) }} spent</span>
                <span class="font-mono" :class="budget.remaining < 0 ? 'text-destructive' : 'text-muted-foreground'">
                    {{ budget.remaining < 0 ? formatMoney(Math.abs(budget.remaining)) + ' over' :
                        formatMoney(budget.remaining) + ' left' }}
                </span>
            </div>
            <p class="text-muted-foreground text-xs">
                {{ budget.daysRemaining }} days remaining
            </p>
            <div class="flex items-center justify-between pt-1">
                <span class="text-muted-foreground text-xs">Past cycles</span>
                <Button variant="ghost" size="icon" aria-label="Delete budget" @click="budgetStore.deleteBudget(budget.id)">
                    <Trash2 class="size-4" />
                </Button>
            </div>
        </CardContent>
    </Card>
</template>
