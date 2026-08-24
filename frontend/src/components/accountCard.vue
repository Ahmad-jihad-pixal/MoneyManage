<script setup>
import { Trash2 } from '@lucide/vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import accountEdit from '@/components/accountEdit.vue'
import { useAccountStore } from '@/stores/accountStore.js'
import { formatMoney } from '@/lib/format.js'

const props = defineProps({
    accounts: {
        type: Object,
        required: true,
    }
})

const store = useAccountStore()
</script>

<template>
    <Card class="gap-2">
        <CardHeader>
            <CardDescription>{{ props.accounts.name }}</CardDescription>
            <CardTitle class="font-mono text-2xl font-bold"
                :class="Number(props.accounts.balance) < 0 ? 'text-destructive' : ''">
                {{ formatMoney(props.accounts.balance) }}
            </CardTitle>
        </CardHeader>
        <CardContent class="flex items-center justify-between">
            <span class="text-muted-foreground font-mono text-xs">
                Opening {{ Number(props.accounts.openingBalance).toLocaleString('en-US') }}
            </span>
            <div class="flex gap-1">
                <accountEdit :account="props.accounts" />
                <Button variant="ghost" size="icon" :aria-label="`Delete ${props.accounts.name}`"
                    @click="store.deleteAccount(props.accounts.id)">
                    <Trash2 class="size-4" />
                </Button>
            </div>
        </CardContent>
    </Card>
</template>
