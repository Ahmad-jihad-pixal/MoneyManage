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
import { useCategoryStore } from '@/stores/categoryStore'
import { categoryValidate } from '@/lib/validation'

const props = defineProps({
    category: {
        type: Object,
        required: true,
    }
})

const store = useCategoryStore()
const name = ref(props.category.name)
const open = ref(false)
const errors = ref({})

watch(() => props.category.name, (newName) => {
    name.value = newName
})

//don't leave old errors on screen when the dialog is reopened
watch(open, (isOpen) => {
    if (!isOpen) errors.value = {}
})

const submit = async () => {
    //type isn't editable here, so pass the existing one to keep it valid
    errors.value = categoryValidate(name.value, props.category.type)
    if (Object.keys(errors.value).length > 0) return

    const ok = await store.updateCategory(props.category.id, name.value)
    if (ok) open.value = false
}
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button variant="ghost" size="icon" :aria-label="`Edit ${props.category.name}`">
                <Pencil class="size-4" />
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit category</DialogTitle>
                <DialogDescription>
                    Only the name can change.
                </DialogDescription>
            </DialogHeader>
            <form @submit.prevent="submit">
                <div class="grid gap-4">
                    <div class="grid gap-3">
                        <Label for="category-name">Name</Label>
                        <p v-if="errors.name" class="text-destructive text-sm font-medium">{{ errors.name }}</p>
                        <Input id="category-name" v-model="name" placeholder="Category name"
                            :aria-invalid="!!errors.name"
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
