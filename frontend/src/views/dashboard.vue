<script setup>
import { computed, onMounted } from 'vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { ArrowRight } from '@lucide/vue'
import transactionCreateDialog from '@/components/transactionCreateDialog.vue'
import { useAccountStore } from '@/stores/accountStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { useGoalStore } from '@/stores/goalStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { formatMoney, formatNumber } from '@/lib/format.js'

const accountStore = useAccountStore()
const transactionStore = useTransactionStore()
const budgetStore = useBudgetStore()
const goalStore = useGoalStore()
const categoryStore = useCategoryStore()

onMounted(() => {
    accountStore.fetchAccounts()
    transactionStore.fetchTransactions()
    budgetStore.fetchBudget()
    goalStore.fetchGoal()
    categoryStore.fetchCategory()
})

const recentTransactions = computed(() =>
    [...transactionStore.transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
)

function categoryName(id) {
    const category = categoryStore.categories.find((c) => c.id === id)
    return category ? category.name : 'Unknown'
}

//categories are soft-deleted, so a deleted one is gone from categoryStore while its
//transactions remain — fall back to the category the API sends with each transaction
function transactionCategoryName(transaction) {
    const live = categoryStore.categories.find((c) => c.id === transaction.categoryId)
    if (live) return live.name
    return transaction.category ? `${transaction.category.name} (deleted)` : 'Unknown'
}

function isIncome(transaction) {
    const live = categoryStore.categories.find((c) => c.id === transaction.categoryId)
    return (live ?? transaction.category)?.type === 'INCOME'
}

function accountName(id) {
    const account = accountStore.accounts.find((a) => a.id === id)
    return account ? account.name : 'Unknown'
}

function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
</script>

<template>
    <div class="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-foreground text-3xl font-bold tracking-tight">Dashboard</h1>
            <p class="text-gray-500 text-sm pt-1">A calm overview of where your money sits and where it went.</p>
        </div>
        <transactionCreateDialog label="Add transaction" />
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card v-for="acc in accountStore.accounts" :key="acc.id" class="gap-2">
            <CardHeader>
                <CardDescription>{{ acc.name }}</CardDescription>
                <CardTitle class="font-mono text-2xl font-bold"
                    :class="Number(acc.balance) < 0 ? 'text-destructive' : ''">
                    {{ formatMoney(acc.balance) }}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <span class="text-muted-foreground text-xs">Calculated from activity</span>
            </CardContent>
        </Card>
    </div>

    <div class="grid gap-4 xl:grid-cols-3">
        <Card class="min-w-0 gap-4 xl:col-span-2">
            <CardHeader class="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle class="text-base font-bold">Recent activity</CardTitle>
                    <CardDescription>Latest income and expenses</CardDescription>
                </div>
                <RouterLink to="/transactions"
                    class="inline-flex items-center gap-1 text-sm font-medium hover:underline">
                    View all <ArrowRight class="size-3.5" />
                </RouterLink>
            </CardHeader>
            <CardContent>
                <p v-if="recentTransactions.length === 0" class="text-muted-foreground py-6 text-center text-sm">
                    No transactions yet.
                </p>
                <Table v-else>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead class="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="t in recentTransactions" :key="t.id">
                            <TableCell class="text-muted-foreground font-mono text-sm">{{ formatDate(t.date) }}
                            </TableCell>
                            <TableCell>{{ transactionCategoryName(t) }}</TableCell>
                            <TableCell class="text-muted-foreground">{{ accountName(t.accountId) }}</TableCell>
                            <TableCell class="text-right font-mono" :class="isIncome(t) ? 'text-success' : ''">
                                {{ isIncome(t) ? '+' : '-' }}{{ formatMoney(t.amount) }}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <div class="min-w-0 space-y-4">
            <Card class="gap-4">
                <CardHeader>
                    <CardTitle class="text-base font-bold">Budgets</CardTitle>
                    <CardDescription>Current cycle</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <p v-if="budgetStore.budget.length === 0" class="text-muted-foreground text-sm">
                        No budgets set up yet.
                    </p>
                    <div v-for="b in budgetStore.budget" :key="b.id">
                        <div class="flex items-center justify-between text-sm">
                            <span class="font-bold">{{ categoryName(b.categoryId) }}</span>
                            <span class="font-mono text-xs"
                                :class="b.progress > 100 ? 'text-destructive' : 'text-muted-foreground'">
                                {{ formatNumber(b.spentAmount) }} / {{ formatNumber(b.amount) }}
                            </span>
                        </div>
                        <Progress :model-value="Math.min(b.progress, 100)" class="mt-2"
                            :class="b.progress > 100 ? '[&>div]:bg-destructive' : ''" />
                        <p class="text-muted-foreground mt-1 text-xs">{{ b.daysRemaining }} days left in cycle</p>
                    </div>
                    <RouterLink to="/budgets">
                        <Button variant="outline" class="w-full">Manage budgets</Button>
                    </RouterLink>
                </CardContent>
            </Card>

            <Card class="gap-4">
                <CardHeader>
                    <CardTitle class="text-base font-bold">Goals</CardTitle>
                    <CardDescription>Saved vs. target</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <p v-if="goalStore.goal.length === 0" class="text-muted-foreground text-sm">
                        No goals yet.
                    </p>
                    <div v-for="g in goalStore.goal" :key="g.id">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-bold">{{ g.name }}</span>
                            <Badge variant="secondary" class="font-mono text-[10px]">
                                {{ Math.round(g.progress) }}%
                            </Badge>
                        </div>
                        <Progress :model-value="Math.min(g.progress, 100)" class="mt-2" />
                        <p class="text-muted-foreground mt-1 font-mono text-xs">
                            {{ formatNumber(g.savedAmount) }} of {{ formatNumber(g.targetAmount) }}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>
