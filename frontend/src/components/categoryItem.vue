<script setup>
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lock, Trash2 } from '@lucide/vue'
import { ref, computed, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'
import categoryEdit from '@/components/categoryEdit.vue'

const categoryStore = useCategoryStore()
const activeTab = ref('expense')

const filteredCategories = computed(() =>
    categoryStore.categories.filter(
        (c) => c.type === activeTab.value.toUpperCase()
    )
)

function parentName(parentId) {
    if (!parentId) return '—'
    const parent = categoryStore.categories.find((c) => c.id === parentId)
    return parent ? parent.name : '—'
}

onMounted(() => {
    categoryStore.fetchCategory()
})
</script>


<template>


    <Tabs v-model="activeTab" default-value="expense" class="w-full">
        <TabsList class="mb-4 w-full max-w-sm">
            <TabsTrigger value="expense" class="flex-1">Expense</TabsTrigger>
            <TabsTrigger value="income" class="flex-1">Income</TabsTrigger>
        </TabsList>
    </Tabs>

    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead class="text-right">Status</TableHead>
                <TableHead class="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow v-for="cat in filteredCategories" :key="cat.id">
                <TableCell class="font-medium">{{ cat.name }}</TableCell>
                <TableCell>
                    <Badge :variant="cat.type === 'INCOME' ? 'secondary' : 'outline'" class="text-[10px]">
                        {{ cat.type === 'INCOME' ? 'Income' : 'Expense' }}
                    </Badge>
                </TableCell>
                <TableCell class="text-muted-foreground text-sm">
                    {{ parentName(cat.parentId) }}
                </TableCell>
                <TableCell class="text-right">
                    <Badge v-if="cat.userId === null" variant="outline" class="text-muted-foreground gap-1 text-[10px]">
                        <Lock class="size-2.5" /> Default
                    </Badge>
                </TableCell>
                <TableCell class="h-13 text-right">
                    <div v-if="cat.userId !== null" class="flex justify-end gap-1">
                        <categoryEdit :category="cat" />
                        <Button variant="ghost" size="icon" :aria-label="`Delete ${cat.name}`"
                            @click="categoryStore.deleteCategory(cat.id)">
                            <Trash2 class="size-4" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>
</template>
