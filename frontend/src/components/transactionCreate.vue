<script setup>
import transactionCreateDialog from '@/components/transactionCreateDialog.vue'
</script>

<template>
    <div class="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-foreground text-3xl font-bold tracking-tight">Transactions</h1>
            <p class="text-gray-500 text-sm pt-1">
                Every entry updates its account balance — and its category budget — automatically.
            </p>
        </div>
        <transactionCreateDialog />
    </div>
</template>
