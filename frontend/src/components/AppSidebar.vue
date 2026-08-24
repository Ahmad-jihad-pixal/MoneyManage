<script setup>
import { LayoutDashboard, Wallet, Receipt, ArrowLeftRight, Target, PiggyBank, ListTree, } from '@lucide/vue'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useRoute } from 'vue-router'
const route = useRoute()
// Menu items.
const items = [
    {
        title: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
    },
    {
        title: 'Accounts',
        url: '/accounts',
        icon: Wallet,
    },
    {
        title: 'Transactions',
        url: '/transactions',
        icon: Receipt,
    },
    {
        title: 'Transfers',
        url: '/transfers',
        icon: ArrowLeftRight,
    },
    {
        title: 'Goals',
        url: '/goals',
        icon: Target,
    },

    {
        title: 'Budgets',
        url: '/budgets',
        icon: PiggyBank,
    },
    {
        title: 'Categories',
        url: '/categories',
        icon: ListTree,
    },
]
</script>

<template>
    <Sidebar>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem v-for="item in items" :key="item.url">
                            <SidebarMenuButton as-child :is-active="route.path === item.url" :tooltip="item.title">
                                <RouterLink :to="item.url">
                                    <component :is="item.icon" />
                                    <span>{{ item.title }}</span>
                                </RouterLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    </Sidebar>
</template>
