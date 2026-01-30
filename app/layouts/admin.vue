<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { user, hasPermission, fullName } = useAuth()

// Menu items với permission requirements
interface MenuItem extends NavigationMenuItem {
  permission?: { resource: string; action: string }
  children?: MenuItem[]
}

const allSidebarItems: MenuItem[][] = [
  [
    {
      label: 'Dashboard',
      icon: 'i-heroicons-home',
      to: '/admin',
      // Dashboard không cần permission
    },
    {
      label: 'Sản phẩm',
      icon: 'i-heroicons-cube',
      to: '/admin/products',
      permission: { resource: 'products', action: 'READ' },
      children: [
        { label: 'Danh sách', to: '/admin/products' },
        { label: 'Thêm mới', to: '/admin/products/new', permission: { resource: 'products', action: 'CREATE' } },
        { label: 'Danh mục', to: '/admin/categories', permission: { resource: 'categories', action: 'READ' } },
      ],
    },
    {
      label: 'Đơn hàng',
      icon: 'i-heroicons-shopping-bag',
      to: '/admin/orders',
      permission: { resource: 'orders', action: 'READ' },
    },
    {
      label: 'Khách hàng',
      icon: 'i-heroicons-users',
      to: '/admin/customers',
      permission: { resource: 'users', action: 'READ' },
    },
    {
      label: 'Khuyến mãi',
      icon: 'i-heroicons-gift',
      to: '/admin/promotions',
      permission: { resource: 'promotions', action: 'READ' },
    },
    {
      label: 'Blog',
      icon: 'i-heroicons-document-text',
      to: '/admin/blog',
      permission: { resource: 'blog_posts', action: 'READ' },
    },
  ],
  [
    {
      label: 'Cài đặt',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/admin/settings',
      permission: { resource: 'settings', action: 'READ' },
      children: [
        { label: 'Chung', to: '/admin/settings' },
        { label: 'Người dùng', to: '/admin/users', permission: { resource: 'users', action: 'READ' } },
        { label: 'Roles', to: '/admin/roles', permission: { resource: 'roles', action: 'READ' } },
      ],
    },
  ],
]

// Filter menu items based on permissions
function filterMenuItems(items: MenuItem[]): NavigationMenuItem[] {
  return items
    .filter(item => {
      // Nếu không có permission requirement, luôn hiển thị
      if (!item.permission) return true
      return hasPermission(item.permission.resource, item.permission.action)
    })
    .map(item => {
      // Filter children nếu có
      if (item.children) {
        const filteredChildren = filterMenuItems(item.children)
        return { ...item, children: filteredChildren.length > 0 ? filteredChildren : undefined }
      }
      return item
    })
}

const sidebarItems = computed<NavigationMenuItem[][]>(() => {
  return allSidebarItems
    .map(group => filterMenuItems(group))
    .filter(group => group.length > 0)
})
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
            :avatar="{ src: user?.avatar || undefined, alt: fullName }"
            :label="collapsed ? undefined : fullName"
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
