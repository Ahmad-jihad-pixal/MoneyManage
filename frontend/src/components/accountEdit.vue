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
import { accountValidate } from '@/lib/validation'

const props = defineProps({
    account: {
        type: Object,
        required: true,
    }
})

const store = useAccountStore()
const name = ref(props.account.name)
const open = ref(false)
const errors = ref({})

watch(() => props.account.name, (newName) => {
    name.value = newName
})

//don't leave old errors on screen when the dialog is reopened
watch(open, (isOpen) => {
    if (!isOpen) errors.value = {}
})

const submit = async () => {
    errors.value = accountValidate(name.value)
    if (Object.keys(errors.value).length > 0) return

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
                        <p v-if="errors.name" class="text-destructive text-sm font-medium">{{ errors.name }}</p>
                        <Input id="name" v-model="name" placeholder="New name" :aria-invalid="!!errors.name"
                            :class="errors.name ? 'border-destructive focus-visible:ring-destructive/30' : ''" />
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
