<script setup>
import { ref, computed, watch } from 'vue'
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
import { transactionValidate } from '@/lib/validation'

defineProps({
    label: {
        type: String,
        default: '+ Add transaction',
    },
})

const categoryStore = useCategoryStore()
const accountStore = useAccountStore()

const store = useTransactionStore()
const { accountId, categoryId, amount, date } = storeToRefs(store)

// Track active transaction type tab
const transactionType = ref('expense')

const filteredCategories = computed(() => categoryStore.categories.filter((c) => c.type === transactionType.value.toUpperCase()))

const open = ref(false)
const errors = ref({})

//don't leave old errors on screen when the dialog is reopened, or when
//switching between the Expense and Income tabs
watch(open, (isOpen) => {
    if (!isOpen) errors.value = {}
})
watch(transactionType, () => {
    errors.value = {}
})

const submit = async () => {
    errors.value = transactionValidate(accountId.value, categoryId.value, amount.value, date.value)
    if (Object.keys(errors.value).length > 0) return

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
                                <p v-if="errors.accountId" class="text-destructive text-sm font-medium">
                                    {{ errors.accountId }}</p>
                                <Select v-model="accountId">
                                    <SelectTrigger id="expense-account" class="w-full"
                                        :class="errors.accountId ? 'border-destructive' : ''">
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
                                <p v-if="errors.categoryId" class="text-destructive text-sm font-medium">
                                    {{ errors.categoryId }}</p>
                                <Select v-model="categoryId">
                                    <SelectTrigger id="expense-category" class="w-full"
                                        :class="errors.categoryId ? 'border-destructive' : ''">
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
                            <p v-if="errors.amount" class="text-destructive text-sm font-medium">{{ errors.amount }}</p>
                            <Input placeholder="0.00" v-model="amount" type="number" min="0" step="0.01"
                                id="expense-amount" :aria-invalid="!!errors.amount"
                                :class="errors.amount ? 'border-destructive focus-visible:ring-destructive/30' : ''" />
                        </div>

                        <div class="grid gap-3">
                            <Label>Date</Label>
                            <p v-if="errors.date" class="text-destructive text-sm font-medium">{{ errors.date }}</p>
                            <Popover>
                                <PopoverTrigger as-child>
                                    <Button variant="outline" class="w-full justify-start text-left font-normal"
                                        :class="errors.date ? 'border-destructive' : ''">
                                        <CalendarIcon class="mr-2 size-4" />
                                        {{ date ? date : 'Pick a date' }}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent class="w-auto p-0">
                                    <Calendar v-model="date" />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </TabsContent>

                    <!-- INCOME FORM TAB CONTENT -->
                    <TabsContent value="income" class="grid gap-4 mt-0">
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div class="grid gap-3">
                                <Label for="income-account">Account</Label>
                                <p v-if="errors.accountId" class="text-destructive text-sm font-medium">
                                    {{ errors.accountId }}</p>
                                <Select v-model="accountId">
                                    <SelectTrigger id="income-account" class="w-full"
                                        :class="errors.accountId ? 'border-destructive' : ''">
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
                                <p v-if="errors.categoryId" class="text-destructive text-sm font-medium">
                                    {{ errors.categoryId }}</p>
                                <Select v-model="categoryId">
                                    <SelectTrigger id="income-category" class="w-full"
                                        :class="errors.categoryId ? 'border-destructive' : ''">
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
                            <p v-if="errors.amount" class="text-destructive text-sm font-medium">{{ errors.amount }}</p>
                            <Input placeholder="0.00" v-model="amount" type="number" min="0" step="0.01"
                                id="income-amount" :aria-invalid="!!errors.amount"
                                :class="errors.amount ? 'border-destructive focus-visible:ring-destructive/30' : ''" />
                        </div>

                        <div class="grid gap-3">
                            <Label>Date</Label>
                            <p v-if="errors.date" class="text-destructive text-sm font-medium">{{ errors.date }}</p>
                            <Popover>
                                <PopoverTrigger as-child>
                                    <Button variant="outline" class="w-full justify-start text-left font-normal"
                                        :class="errors.date ? 'border-destructive' : ''">
                                        <CalendarIcon class="mr-2 size-4" />
                                        {{ date ? date : 'Pick a date' }}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent class="w-auto p-0">
                                    <Calendar v-model="date" />
                                </PopoverContent>
                            </Popover>
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
