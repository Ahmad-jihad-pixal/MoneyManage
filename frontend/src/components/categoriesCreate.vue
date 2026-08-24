<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogClose, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCategoryStore } from '@/stores/categoryStore'

const store = useCategoryStore()
const { name, type, parentId } = storeToRefs(store)

const eligibleParents = computed(() =>
    store.categories.filter((c) => !c.parentId && c.type === type.value)
)

const open = ref(false)

const submit = async () => {
    const ok = await store.createCategory()
    if (ok) open.value = false
}
</script>


<template>
    <div class="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-foreground text-3xl font-bold tracking-tight">Categories</h1>
            <p class="text-gray-500 text-sm pt-1">Default categories are shared by everyone and read-only. Your own
                categories can be renamed or removed.
            </p>
        </div>
        <Dialog v-model:open="open">
            <DialogTrigger as-child>
                <Button class=" bg-gray-950 text-gray-50" variant="outline">
                    + Add category
                </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle> Add category</DialogTitle>
                    <DialogDescription>
                        A subcategory always inherits its parent's type and can't be nested further.
                    </DialogDescription>
                </DialogHeader>
                <form @submit.prevent="submit">
                    <div class="grid gap-4">
                        <div class="grid gap-3">
                            <Label for="name"> Name</Label>
                            <Input id="name" v-model="name" placeholder="Coffee runs" />
                        </div>


                        <div class="grid gap-3">
                            <label class="text-sm font-medium">Type</label>
                            <Tabs v-model="type" class="w-full" default-value="EXPENSE">
                                <TabsList class="w-full">
                                    <TabsTrigger value="EXPENSE" class="flex-1">
                                        Expense
                                    </TabsTrigger>
                                    <TabsTrigger value="INCOME" class="flex-1">
                                        Income
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <div class="grid gap-3"> <label class="text-sm font-medium">Parent category (optional)</label>
                            <Select v-model="parentId">
                                <SelectTrigger class="w-full">
                                    <SelectValue placeholder="No parent — top level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem v-for="p in eligibleParents" :key="p.id" :value="p.id">
                                            {{ p.name }}
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                    <DialogFooter class="mt-4">
                        <DialogClose as-child>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            Create category
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
</template>