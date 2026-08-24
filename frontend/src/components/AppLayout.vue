<script setup>
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar.vue'
import NavBar from '@/components/NavBar.vue'
</script>

<template>
    <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
            <NavBar />
            <main class="flex-1 px-4 py-6 md:px-8 md:py-8">
                <div class="mx-auto w-full max-w-6xl space-y-6">
                    <RouterView />
                </div>
            </main>
        </SidebarInset>
    </SidebarProvider>
</template>
