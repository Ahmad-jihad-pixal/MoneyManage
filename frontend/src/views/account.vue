<script setup>
import accountCard from '@/components/accountCard.vue';
import accountCreate from '@/components/accountCreate.vue';
import { onMounted } from 'vue'
import { useAccountStore } from '@/stores/accountStore.js'

const accountStore = useAccountStore();

onMounted(() => {
    accountStore.fetchAccounts()
})
</script>
<template>
    <div>
        <accountCreate />
    </div>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <accountCard v-for="accounts in accountStore.accounts" :key="accounts.id" :accounts="accounts" />
    </div>
</template>
