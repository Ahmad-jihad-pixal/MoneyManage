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
import { useGoalStore } from '@/stores/goalStore'

const props = defineProps({
    goal: {
        type: Object,
        required: true,
    }
})

const store = useGoalStore()
const name = ref(props.goal.name)
const targetAmount = ref(props.goal.targetAmount)
const open = ref(false)

watch(() => props.goal, (g) => {
    name.value = g.name
    targetAmount.value = g.targetAmount
})

const submit = async () => {
    const ok = await store.updateGoal(props.goal.id, name.value, targetAmount.value)
    if (ok) open.value = false
}
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button variant="ghost" size="icon" class="size-7" :aria-label="`Edit ${props.goal.name}`">
                <Pencil class="size-3.5" />
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit goal</DialogTitle>
                <DialogDescription>
                    Renaming or retargeting doesn't touch the saved amount.
                </DialogDescription>
            </DialogHeader>
            <form @submit.prevent="submit">
                <div class="grid gap-4">
                    <div class="grid gap-3">
                        <Label for="goal-name">Name</Label>
                        <Input id="goal-name" v-model="name" placeholder="Goal name" />
                    </div>
                    <div class="grid gap-3">
                        <Label for="goal-target">Target amount</Label>
                        <Input id="goal-target" v-model="targetAmount" type="number" min="0" step="0.01" />
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
