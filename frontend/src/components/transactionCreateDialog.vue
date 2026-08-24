<script setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/stores/categoryStore'
import { useAccountStore } from '@/stores/accountStore'
import { useTransactionStore } from '@/stores/transactionStore'

defineProps({
    label: {
        type: String,
        default: '+ Add transaction',
    },
})

const categoryStore = useCategoryStore()
const accountStore = useAccountStore()

const store = useTransactionStore()
const { accountId, categoryId, amount, date, note } = storeToRefs(store)

// Track active transaction type tab
const transactionType = ref('expense')

const filteredCategories = computed(() => categoryStore.categories.filter((c) => c.type === transactionType.value.toUpperCase()))

const open = ref(false)

const submit = async () => {
    const ok = await store.createTransaction()
    if (ok) open.value = false
}
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button class="bg-gray-950 text-gray-50" variant="outline">
                {{ label }}
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Add transaction</DialogTitle>
                <DialogDescription>
                    Choose income or expense — you always enter a positive amount.
                </DialogDescription>
            </DialogHeader>

            <!-- Tabs wrapping the form to manage state -->
            <Tabs v-model="transactionType" default-value="expense" class="w-full">
                <TabsList class="w-full mb-4">
                    <TabsTrigger value="expense" class="flex-1">
                        Expense
                    </TabsTrigger>
                    <TabsTrigger value="income" class="flex-1">
                        Income
                    </TabsTrigger>
                </TabsList>

                <form @submit.prevent="submit">
                    <!-- EXPENSE FORM TAB CONTENT -->
                    <TabsContent value="expense" class="grid gap-4 mt-0">
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div class="grid gap-3">
                                <Label for="expense-account">Account</Label>
                                <Select v-model="accountId">
                                    <SelectTrigger id="expense-account" class="w-full">
                                        <SelectValue placeholder="Select account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem v-for="acc in accountStore.accounts" :key="acc.id"
                                                :value="acc.id">
                                                {{ acc.name }}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div class="grid gap-3">
                                <Label for="expense-category">Expense Category</Label>
                                <Select v-model="categoryId">
                                    <SelectTrigger id="expense-category" class="w-full">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem v-for="cat in filteredCategories" :key="cat.id"
                                                :value="cat.id">
                                                {{ cat.name }}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div class="grid gap-3">
                            <Label for="expense-amount">Amount</Label>
                            <Input placeholder="0.00" v-model="amount" type="number" min="0" step="0.01"
                                id="expense-amount" />
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div class="grid gap-3">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger as-child>
                                        <Button variant="outline"
                                            class="w-full justify-start text-left font-normal">
                                            <CalendarIcon class="mr-2 size-4" />
                                            {{ date ? date : 'Pick a date' }}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent class="w-auto p-0">
                                        <Calendar v-model="date" />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div class="grid gap-3">
                                <Label for="expense-note">Note (optional)</Label>
                                <Input id="expense-note" v-model="note" placeholder="Grocery shopping"
                                    type="text" />
                            </div>
                        </div>
                    </TabsContent>

                    <!-- INCOME FORM TAB CONTENT -->
                    <TabsContent value="income" class="grid gap-4 mt-0">
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div class="grid gap-3">
                                <Label for="income-account">Account</Label>
                                <Select v-model="accountId">
                                    <SelectTrigger id="income-account" class="w-full">
                                        <SelectValue placeholder="Select account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem v-for="acc in accountStore.accounts" :key="acc.id"
                                                :value="acc.id">
                                                {{ acc.name }}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div class="grid gap-3">
                                <Label for="income-category">Income Source</Label>
                                <Select v-model="categoryId">
                                    <SelectTrigger id="income-category" class="w-full">
                                        <SelectValue placeholder="Select source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem v-for="cat in filteredCategories" :key="cat.id"
                                                :value="cat.id">
                                                {{ cat.name }}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div class="grid gap-3">
                            <Label for="income-amount">Amount</Label>
                            <Input placeholder="0.00" v-model="amount" type="number" min="0" step="0.01"
                                id="income-amount" />
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div class="grid gap-3">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger as-child>
                                        <Button variant="outline"
                                            class="w-full justify-start text-left font-normal">
                                            <CalendarIcon class="mr-2 size-4" />
                                            {{ date ? date : 'Pick a date' }}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent class="w-auto p-0">
                                        <Calendar v-model="date" />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div class="grid gap-3">
                                <Label for="income-note">Note (optional)</Label>
                                <Input id="income-note" v-model="note" placeholder="Monthly paycheck" type="text" />
                            </div>
                        </div>
                    </TabsContent>

                    <DialogFooter class="mt-4">
                        <DialogClose as-child>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            Create transaction
                        </Button>
                    </DialogFooter>
                </form>
            </Tabs>
        </DialogContent>
    </Dialog>
</template>
