<script setup>
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2 } from '@lucide/vue'
import { onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useAccountStore } from '@/stores/accountStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { formatMoney } from '@/lib/format.js'

const transactionStore = useTransactionStore()
const accountStore = useAccountStore()
const categoryStore = useCategoryStore()

//Simplest fix — a small helper function to change form fo the date
function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
//You have a transfer with fromAccountId: 4, but you need to display "Main Checking". The pattern: search accountStore.accounts for the account whose id matches, then return its name.
function accountName(id) {
    const account = accountStore.accounts.find((a) => a.id === id)
    return account ? account.name : 'Unknown'
}

//Deleting a category is a soft delete, so the transaction stays untouched but the
//category drops out of categoryStore (which only lists live ones). Fall back to the
//category the API sends along with the transaction, so old rows keep their real label
//instead of turning into "Unknown".
function categoryName(transaction) {
    const live = categoryStore.categories.find((c) => c.id === transaction.categoryId)
    if (live) return live.name
    return transaction.category ? `${transaction.category.name} (deleted)` : 'Unknown'
}

//to know the tarnsaction type using category — same fallback, otherwise an income
//transaction whose category was deleted would render with a minus sign
function isIncome(transaction) {
    const live = categoryStore.categories.find((c) => c.id === transaction.categoryId)
    return (live ?? transaction.category)?.type === 'INCOME'
}

onMounted(() => {
    transactionStore.fetchTransactions()
    accountStore.fetchAccounts()
    categoryStore.fetchCategory()


})
</script>

<template>
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                <TableHead class="text-right">Amount</TableHead>
                <TableHead class="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow v-for="transaction in transactionStore.transactions" :key="transaction.id">
                <TableCell class="text-muted-foreground font-mono text-sm">{{ formatDate(transaction.date) }}
                </TableCell>
                <TableCell>{{ categoryName(transaction) }}</TableCell>
                <TableCell class="text-muted-foreground">{{ accountName(transaction.accountId) }}</TableCell>

                <TableCell class="text-right font-mono" :class="isIncome(transaction) ? 'text-success' : ''">
                    {{ isIncome(transaction) ? '+' : '-' }}{{ formatMoney(transaction.amount) }}
                </TableCell>

                <TableCell class="text-right">
                    <div class="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" :aria-label="`Delete transaction`"
                            @click="transactionStore.deleteTransaction(transaction.id)">
                            <Trash2 class="size-4" />
                        </Button>
                    </div>
                </TableCell>

            </TableRow>
        </TableBody>
    </Table>
</template>
