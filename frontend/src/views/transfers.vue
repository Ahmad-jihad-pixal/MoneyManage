<script setup>
import transferCreate from '@/components/transferCreate.vue';
import { ArrowRight } from '@lucide/vue'
import { Card } from '@/components/ui/card'
import { onMounted } from 'vue'
import { useTransferStore } from '@/stores/transferStore'
import { useAccountStore } from '@/stores/accountStore'
import { formatMoney } from '@/lib/format.js'

const transferStore = useTransferStore()
const accountStore = useAccountStore()

onMounted(() => {
    transferStore.fetchTransfer()
    accountStore.fetchAccounts()
})

//You have a transfer with fromAccountId: 4, but you need to display "Main Checking". The pattern: search accountStore.accounts for the account whose id matches, then return its name.
function accountName(id) {
    const account = accountStore.accounts.find((a) => a.id === id)
    return account ? account.name : 'Unknown'
}


//Simplest fix — a small helper function to change form fo the date
function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
</script>
<template>
    <div>
        <transferCreate />
    </div>
    <div class="space-y-3">
        <Card v-for="t in transferStore.transfer" :key="t.id"
            class="flex-row items-center justify-between gap-3 p-4 sm:gap-4">
            <span class="text-muted-foreground w-20 shrink-0 font-mono text-xs sm:w-24">{{ formatDate(t.date) }}</span>

            <div class="flex flex-1 items-center gap-2 text-sm font-medium">
                <span>{{ accountName(t.fromAccountId) }}</span>
                <ArrowRight class="text-muted-foreground size-3.5" />
                <span>{{ accountName(t.toAccountId) }}</span>
            </div>

            <span class="font-mono text-sm font-medium">{{ formatMoney(t.amount) }}</span>
        </Card>
    </div>
</template>
