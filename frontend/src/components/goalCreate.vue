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
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGoalStore } from '@/stores/goalStore'

const store = useGoalStore()
const { name, targetAmount } = storeToRefs(store)

const open = ref(false)

const submit = async () => {
    const ok = await store.createGoal()
    if (ok) open.value = false
}
</script>


<template>
    <div class="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-foreground text-3xl font-bold tracking-tight">Goals</h1>
            <p class="text-gray-500 text-sm pt-1">Balances are Saved amounts move in and out of real accounts — they're
                never typed in directly.
            </p>
        </div>
        <Dialog v-model:open="open">
            <DialogTrigger as-child>
                <Button class=" bg-gray-950 text-gray-50" variant="outline">
                    + New goal
                </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>New goal</DialogTitle>
                    <DialogDescription>
                        Only the name and target can be set — the saved amount comes from transfers.
                    </DialogDescription>
                </DialogHeader>
                <form @submit.prevent="submit">
                    <div class="grid gap-4">
                        <div class="grid gap-3">
                            <Label for="name"> Name</Label>
                            <Input id="name" v-model="name" placeholder="Goal name " />
                        </div>
                        <div class="grid gap-3">
                            <Label for="number ">Target amount</Label>
                            <Input placeholder="0,00" v-model="targetAmount" type="number" min="0" step="0.01"
                                id="number" />
                        </div>
                    </div>
                    <DialogFooter class="mt-4">
                        <DialogClose as-child>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            Create goal
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
</template>