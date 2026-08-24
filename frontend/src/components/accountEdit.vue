<script setup>
import { ref, watch } from 'vue'
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
import { Pencil } from '@lucide/vue'
import { useAccountStore } from '@/stores/accountStore.js'

const props = defineProps({
    account: {
        type: Object,
        required: true,
    }
})

const store = useAccountStore()
const name = ref(props.account.name)
const open = ref(false)

watch(() => props.account.name, (newName) => {
    name.value = newName
})

const submit = async () => {
    const ok = await store.updateAccount(props.account.id, name.value)
    if (ok) open.value = false
}
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button variant="ghost" size="icon" :aria-label="`Edit ${props.account.name}`">
                <Pencil class="size-4" />
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit account</DialogTitle>
                <DialogDescription>
                    Only the name can change. The balance stays derived from activity.
                </DialogDescription>
            </DialogHeader>
            <form @submit.prevent="submit">
                <div class="grid gap-4">
                    <div class="grid gap-3">
                        <Label for="name">Name</Label>
                        <Input id="name" v-model="name" placeholder="New name" />
                    </div>
                </div>
                <DialogFooter class="mt-4">
                    <DialogClose as-child>
                        <Button variant="outline" type="button">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit">
                        Save changes
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>
