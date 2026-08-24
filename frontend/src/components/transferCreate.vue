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
import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from '@lucide/vue'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAccountStore } from '@/stores/accountStore'
import { useTransferStore } from '@/stores/transferStore.js'
const accountStore = useAccountStore()
const store = useTransferStore()
const { fromAccount, toAccount, amount, date } = storeToRefs(store)

const open = ref(false)

const submit = async () => {
    const ok = await store.createTransfer()
    if (ok) open.value = false
}

</script>

<template>
    <div class="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-foreground text-3xl font-bold tracking-tight">Transfers</h1>
            <p class="text-gray-500 text-sm pt-1">Money moved between your own accounts — neither income nor expense.
            </p>
        </div>
        <Dialog v-model:open="open">
            <DialogTrigger as-child>
                <Button class=" bg-gray-950 text-gray-50" variant="outline">
                    + New transfer
                </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Transfer money</DialogTitle>
                    <DialogDescription>
                        The source and destination accounts must be different.
                    </DialogDescription>
                </DialogHeader>
                <form @submit.prevent="submit">
                    <div class="grid gap-4">
                        <div class="grid gap-3">
                            <Label for="from-account">From</Label>
                            <Select v-model="fromAccount">
                                <SelectTrigger id="from-account" class="w-full">
                                    <SelectValue placeholder="Select source account" />
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
                        <div class="grid gap-3">
                            <Label for="to-account">To</Label>
                            <Select v-model="toAccount">
                                <SelectTrigger id="to-account" class="w-full">
                                    <SelectValue placeholder="Select destination account" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem v-for="acc in accountStore.accounts" :key="acc.id" :value="acc.id"
                                            :disabled="acc.id === fromAccount">
                                            {{ acc.name }}
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <!-- main div that have tow label beside eash other  -->
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <!-- 1st label  -->
                            <div class="grid gap-3">
                                <Label for="number ">Amount</Label>
                                <Input placeholder="0,00" v-model="amount" type="number" min="0" step="0.01"
                                    id="number" />
                            </div>

                            <div class="grid gap-3">
                                <label class="text-sm font-medium">Date</label>
                                <Popover>
                                    <PopoverTrigger as-child>
                                        <Button variant="outline" class="w-full justify-start text-left font-normal">
                                            <CalendarIcon class="mr-2 size-4" />
                                            {{ date ? date : 'Pick a date' }}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent class="w-auto p-0">
                                        <Calendar v-model="date" />
                                    </PopoverContent>
                                </Popover>
                            </div>


                        </div>
                    </div>
                    <DialogFooter class="mt-4">
                        <DialogClose as-child>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            Transfer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
</template>