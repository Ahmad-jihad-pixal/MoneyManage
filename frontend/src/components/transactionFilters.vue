<script setup>
import { ref, watch } from 'vue'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useTransactionStore } from '@/stores/transactionStore'
import { useAccountStore } from '@/stores/accountStore'
import { useCategoryStore } from '@/stores/categoryStore'

const transactionStore = useTransactionStore()
const accountStore = useAccountStore()
const categoryStore = useCategoryStore()

const accountId = ref(undefined)
const categoryId = ref(undefined)
const from = ref('')
const to = ref('')

function applyFilters() {
    transactionStore.fetchTransactions({
        accountId: accountId.value,
        categoryId: categoryId.value,
        from: from.value || undefined,
        to: to.value || undefined,
    })
}

watch([accountId, categoryId, from, to], applyFilters)

function reset() {
    accountId.value = undefined
    categoryId.value = undefined
    from.value = ''
    to.value = ''
}
</script>

<template>
    <Card class="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
        <div class="grid gap-2">
            <Label>Account</Label>
            <Select v-model="accountId">
                <SelectTrigger class="w-full">
                    <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem v-for="acc in accountStore.accounts" :key="acc.id" :value="acc.id">
                            {{ acc.name }}
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
        <div class="grid gap-2">
            <Label>Category</Label>
            <Select v-model="categoryId">
                <SelectTrigger class="w-full">
                    <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
        <div class="grid gap-2">
            <Label>From</Label>
            <Input v-model="from" type="date" />
        </div>
        <div class="grid gap-2">
            <Label>To</Label>
            <Input v-model="to" type="date" />
        </div>
        <Button variant="ghost" @click="reset">Reset</Button>
    </Card>
</template>
