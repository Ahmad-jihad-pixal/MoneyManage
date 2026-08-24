<script setup>

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
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/stores/categoryStore'
import { useBudgetStore } from '@/stores/budgetStore'

const categoryStore = useCategoryStore()
const store = useBudgetStore()
const { categoryId, amount, period, autoReset } = storeToRefs(store)

const open = ref(false)

const submit = async () => {
    const ok = await store.createBudget()
    if (ok) open.value = false
}

</script>

<template>
    <div class="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-foreground text-3xl font-bold tracking-tight">Budgets</h1>
            <p class="text-gray-500 text-sm pt-1">Spending limits per category. Spent amounts come from your expense
                transactions.
            </p>
        </div>
        <Dialog v-model:open="open">
            <DialogTrigger as-child>
                <Button class=" bg-gray-950 text-gray-50" variant="outline">
                    + Add budget
                </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add budget</DialogTitle>
                    <DialogDescription>
                        Only expense categories can be budgeted.
                    </DialogDescription>
                </DialogHeader>
                <form @submit.prevent="submit">

                    <!-- body  -->
                    <div class="grid gap-4">
                        <div class="grid gap-3">
                            <label class="text-sm font-medium">Category</label>
                            <Select v-model="categoryId">
                                <SelectTrigger class="w-full">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem
                                            v-for="cat in categoryStore.categories.filter(c => c.type === 'EXPENSE')"
                                            :key="cat.id" :value="cat.id">
                                            {{ cat.name }}
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <!-- tow aside label  -->
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <!-- 1st label -->
                            <div class="grid gap-3">
                                <Label for="number ">Target amount</Label>
                                <Input placeholder="0.00" v-model="amount" type="number" min="0" step="0.01"
                                    id="number" />
                            </div>

                            <!-- 2nd label  -->
                            <div class="grid gap-3">
                                <label class="text-sm font-medium">period</label>
                                <Select v-model="period">
                                    <SelectTrigger class="w-full">
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="YEARLY">Yearly</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>

                        <div class="flex items-center justify-between rounded-md border px-3 py-2.5">
                            <div>
                                <Label for="auto-reset" class="text-sm">Auto-reset each cycle</Label>
                                <p class="text-muted-foreground text-xs">
                                    Start a fresh cycle automatically when this one ends.
                                </p>
                            </div>
                            <Switch id="auto-reset" v-model="autoReset" />
                        </div>
                    </div>
                    <DialogFooter class="mt-4">
                        <DialogClose as-child>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            Create budget
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
</template>