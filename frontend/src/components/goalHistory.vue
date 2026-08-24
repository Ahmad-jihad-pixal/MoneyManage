<script setup>
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useGoalStore } from '@/stores/goalStore'
import { useAccountStore } from '@/stores/accountStore'
import { formatMoney } from '@/lib/format.js'

const props = defineProps({
    goal: {
        type: Object,
        required: true,
    }
})

const store = useGoalStore()
const accountStore = useAccountStore()
const open = ref(false)

watch(open, (isOpen) => {
    if (isOpen) {
        store.fetchGoalHistory(props.goal.id)
        accountStore.fetchAccounts()
    }
})

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
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button variant="link" size="sm" class="h-auto p-0">
                View history
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[550px]">
            <DialogHeader>
                <DialogTitle>{{ props.goal.name }} — history</DialogTitle>
                <DialogDescription>
                    Every transfer that moved money in or out of this goal.
                </DialogDescription>
            </DialogHeader>

            <p v-if="store.goalHistory.length === 0" class="text-muted-foreground py-6 text-center text-sm">
                No transfers yet.
            </p>
            <Table v-else>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead class="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="t in store.goalHistory" :key="t.id">
                        <TableCell class="text-muted-foreground font-mono text-sm">{{ formatDate(t.date) }}
                        </TableCell>
                        <TableCell>{{ accountName(t.accountId) }}</TableCell>
                        <TableCell>
                            <Badge :variant="t.type === 'IN' ? 'secondary' : 'outline'" class="text-[10px]">
                                {{ t.type === 'IN' ? 'Added' : 'Withdrawn' }}
                            </Badge>
                        </TableCell>
                        <TableCell class="text-right font-mono" :class="t.type === 'IN' ? 'text-success' : ''">
                            {{ t.type === 'IN' ? '+' : '-' }}{{ formatMoney(t.amount) }}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </DialogContent>
    </Dialog>
</template>
