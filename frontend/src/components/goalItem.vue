<script setup>
import { Trash2 } from '@lucide/vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import goalAddMoney from '@/components/goalAddMoney.vue'
import goalWithdraw from '@/components/goalWithdraw.vue'
import goalEdit from '@/components/goalEdit.vue'
import goalHistory from '@/components/goalHistory.vue'
import { useGoalStore } from '@/stores/goalStore'
import { formatMoney } from '@/lib/format.js'

const props = defineProps({
    goal: {
        type: Object,
        required: true,
    }
})

const store = useGoalStore()
</script>

<template>
    <Card class="gap-4">
        <CardHeader>
            <div class="flex items-start justify-between">
                <div>
                    <CardTitle class="text-base font-bold">{{ props.goal.name }}</CardTitle>
                    <CardDescription class="font-mono text-xs">
                        {{ formatMoney(props.goal.savedAmount) }} of {{ formatMoney(props.goal.targetAmount) }}
                    </CardDescription>
                </div>
                <Badge variant="secondary" class="font-mono text-[10px]">
                    {{ Math.round(props.goal.progress) }}%
                </Badge>
            </div>
        </CardHeader>
        <CardContent class="space-y-4">
            <Progress :model-value="Math.min(props.goal.progress, 100)" />

            <div class="grid grid-cols-2 gap-2">
                <goalAddMoney :goal="props.goal" />
                <goalWithdraw :goal="props.goal" />
            </div>

            <Separator />

            <div class="flex items-center justify-between">
                <goalHistory :goal="props.goal" />
                <div class="flex gap-0.5">
                    <goalEdit :goal="props.goal" />
                    <Button variant="ghost" size="icon" class="size-7" :aria-label="`Delete ${props.goal.name}`"
                        @click="store.deleteGoal(props.goal.id)">
                        <Trash2 class="size-3.5" />
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
</template>
