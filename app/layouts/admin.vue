<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const sidebarItems: NavigationMenuItem[][] = [
  [
    {
      label: 'Dashboard',
      icon: 'i-heroicons-home',
      to: '/admin',
    },
    {
      label: 'Sản phẩm',
      icon: 'i-heroicons-cube',
      to: '/admin/products',
      children: [
        { label: 'Danh sách', to: '/admin/products' },
        { label: 'Thêm mới', to: '/admin/products/new' },
        { label: 'Danh mục', to: '/admin/categories' },
      ],
    },
    {
      label: 'Đơn hàng',
      icon: 'i-heroicons-shopping-bag',
      to: '/admin/orders',
    },
    {
      label: 'Khách hàng',
      icon: 'i-heroicons-users',
      to: '/admin/customers',
    },
    {
      label: 'Khuyến mãi',
      icon: 'i-heroicons-gift',
      to: '/admin/promotions',
    },
    {
      label: 'Blog',
      icon: 'i-heroicons-document-text',
      to: '/admin/blog',
    },
  ],
  [
    {
      label: 'Cài đặt',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/admin/settings',
      children: [
        { label: 'Chung', to: '/admin/settings' },
        { label: 'Người dùng', to: '/admin/users' },
        { label: 'Roles', to: '/admin/roles' },
      ],
    },
  ],
]
</script>

<template>
  <UApp>
    <UDashboardGroup>
      <UDashboardSidebar collapsible>
        <template #header="{ collapsed }">
          <NuxtLink to="/admin" class="flex items-center gap-2">
            <UIcon name="i-heroicons-computer-desktop" class="text-primary size-6" />
            <span v-if="!collapsed" class="text-lg font-bold">TechForge</span>
          </NuxtLink>
        </template>

        <template #default="{ collapsed }">
          <UNavigationMenu
            :collapsed="collapsed"
            :items="sidebarItems"
            orientation="vertical"
          />
        </template>

        <template #footer="{ collapsed }">
          <UButton
            :avatar="{ src: '' }"
            :label="collapsed ? undefined : 'Admin'"
            color="neutral"
            variant="ghost"
            class="w-full"
            :block="collapsed"
          />
        </template>
      </UDashboardSidebar>

      <UDashboardPanel class="h-screen">
        <slot />
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
