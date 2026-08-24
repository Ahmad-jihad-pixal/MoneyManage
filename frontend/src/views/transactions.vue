<script setup>
import transactionsCreate from '@/components/transactionCreate.vue';
import transactionFilters from '@/components/transactionFilters.vue';
import transactionItem from '@/components/transactionItem.vue';

import { onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useAccountStore } from '@/stores/accountStore'
import { useCategoryStore } from '@/stores/categoryStore'

const transactionStore = useTransactionStore()
const accountStore = useAccountStore()
const categoryStore = useCategoryStore()

onMounted(() => {
    transactionStore.fetchTransactions()
    accountStore.fetchAccounts()
    categoryStore.fetchCategory()
})
</script>
<template>
    <div>
        <transactionsCreate />
    </div>
    <div>
        <transactionFilters />
    </div>
    <div>
        <transactionItem />
    </div>
</template>
