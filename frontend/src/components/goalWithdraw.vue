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
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGoalStore } from '@/stores/goalStore'
import { useAccountStore } from '@/stores/accountStore'
import { goalMoveValidate } from '@/lib/validation'

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
const errors = ref({})

//don't leave old errors on screen when the dialog is reopened
watch(open, (isOpen) => {
    if (!isOpen) errors.value = {}
})

const submit = async () => {
    errors.value = goalMoveValidate(moveAccountId.value, moveAmount.value, moveDate.value)
    if (Object.keys(errors.value).length > 0) return

    moveType.value = 'OUT'
    const ok = await store.moveGoalMoney(props.goal.id)
    if (ok) open.value = false
}

</script>

<template>
    <div class="flex w-full items-center justify-between">

        <Dialog v-model:open="open">
            <DialogTrigger as-child>
                <Button class="w-full bg-gray-950 text-gray-50" variant="outline">
                    Withdraw
                </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        Withdraw money from goal</DialogTitle>
                    <DialogDescription>
                        Moves money out of {{ props.goal.name }} and into the chosen account.
                    </DialogDescription>
                </DialogHeader>
                <form @submit.prevent="submit">
                    <div class="grid gap-4">
                        <div class="grid gap-3">
                            <Label for="account">Source account</Label>
                            <p v-if="errors.accountId" class="text-destructive text-sm font-medium">
                                {{ errors.accountId }}</p>
                            <Select v-model="moveAccountId">
                                <SelectTrigger id="account" class="w-full"
                                    :class="errors.accountId ? 'border-destructive' : ''">
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
                            <p v-if="errors.amount" class="text-destructive text-sm font-medium">{{ errors.amount }}</p>
                            <Input placeholder="0.00" v-model="moveAmount" type="number" min="0" step="0.01"
                                id="amount" :aria-invalid="!!errors.amount"
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
                            Withdraw
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
</template>