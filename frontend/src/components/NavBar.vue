<script setup>
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { LogOut } from '@lucide/vue'

</script>
<template>

    <header
        class="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur justify-between">
        <SidebarTrigger />
        <!-- rest of navbar -->
        <RouterLink to="/login">
            <Button class="p-2 flex items-center justify-center gap-2" variant="outline">
                <LogOut class="size-4" />
                Sign Out
            </Button>
        </RouterLink>
    </header>
</template>