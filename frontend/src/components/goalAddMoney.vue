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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from '@lucide/vue'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGoalStore } from '@/stores/goalStore'
import { useAccountStore } from '@/stores/accountStore'

const accountStore = useAccountStore()
const store = useGoalStore();

const { moveAccountId, moveAmount, moveDate, moveType } = storeToRefs(store)

const props = defineProps({
    goal: {
        type: Object,
        required: true,
    }
})

const open = ref(false)

const submit = async () => {
    moveType.value = 'IN'
    const ok = await store.moveGoalMoney(props.goal.id)
    if (ok) open.value = false
}

</script>

<template>
    <div class="flex w-full items-center justify-between">

        <Dialog v-model:open="open">
            <DialogTrigger as-child>
                <Button class="w-full bg-gray-950 text-gray-50" variant="outline">
                    Add Money
                </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        Add money to goal</DialogTitle>
                    <DialogDescription>
                        Moves money out of the chosen account and into {{ props.goal.name }}.
                    </DialogDescription>
                </DialogHeader>
                <form @submit.prevent="submit">
                    <div class="grid gap-4">
                        <div class="grid gap-3">
                            <Label for="account">Source account</Label>
                            <Select v-model="moveAccountId">
                                <SelectTrigger id="account" class="w-full">
                                    <SelectValue placeholder="Select account" />
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
                            <Label for="amount">Amount</Label>
                            <Input placeholder="0.00" v-model="moveAmount" type="number" min="0" step="0.01"
                                id="amount" />

                        </div>
                        <div class="grid gap-3">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger as-child>
                                    <Button variant="outline" class="w-full justify-start text-left font-normal">
                                        <CalendarIcon class="mr-2 size-4" />
                                        {{ moveDate ? moveDate : 'Pick a date' }}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent class="w-auto p-0">
                                    <Calendar v-model="moveDate" />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter class="mt-4">
                        <DialogClose as-child>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            Add Money
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
</template>