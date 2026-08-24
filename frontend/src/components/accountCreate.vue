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
import { useAccountStore } from '@/stores/accountStore'

const store = useAccountStore()
const { name, balance } = storeToRefs(store)

const open = ref(false)


//to close the dialog auto after submet
const submit = async () => {
    const ok = await store.createAccount()
    if (ok) open.value = false
}

</script>

<template>
    <div class="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-foreground text-3xl font-bold tracking-tight">Accounts</h1>
            <p class="text-gray-500 text-sm pt-1">Balances are derived from transactions, transfers and goal funding
                —
                they're never edited
                directly.
            </p>
        </div>
        <Dialog v-model:open="open">
            <DialogTrigger as-child>
                <Button class=" bg-gray-950 text-gray-50" variant="outline">
                    + Add account
                </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add account</DialogTitle>
                    <DialogDescription>
                        The opening balance can only be set now — afterwards the balance is calculated from your
                        activity.
                    </DialogDescription>
                </DialogHeader>
                <form @submit.prevent="submit">
                    <div class="grid gap-4">
                        <div class="grid gap-3">
                            <Label for="name"> Name</Label>
                            <Input id="name" v-model="name" placeholder="account name " />
                        </div>
                        <div class="grid gap-3">
                            <Label for="number ">Opening balance (optional)</Label>
                            <Input placeholder="0,00" v-model="balance" type="number" id="number" />
                        </div>
                    </div>
                    <DialogFooter class="mt-4">
                        <DialogClose as-child>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            Create account
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
</template>