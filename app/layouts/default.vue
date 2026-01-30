<script setup lang="ts">
const { isLoggedIn, isAdmin, fullName, logout } = useAuth()

const links = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Sản phẩm', to: '/products' },
  { label: 'PC Gaming', to: '/products?category=pc-gaming' },
  { label: 'Linh kiện', to: '/products?category=linh-kien' },
  { label: 'Blog', to: '/blog' },
]

const userMenuItems = computed(() => {
  const items: Array<Array<{ label: string; icon: string; to?: string; click?: () => void }>> = [
    [{ label: 'Tài khoản', icon: 'i-heroicons-user', to: '/account' }],
    [{ label: 'Đơn hàng', icon: 'i-heroicons-shopping-bag', to: '/account/orders' }],
  ]

  if (isAdmin.value) {
    items.push([{ label: 'Quản trị', icon: 'i-heroicons-cog-6-tooth', to: '/admin' }])
  }

  items.push([{ label: 'Đăng xuất', icon: 'i-heroicons-arrow-right-on-rectangle', click: logout }])

  return items
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-heroicons-computer-desktop" class="text-primary size-6" />
          <span class="text-xl font-bold">TechForge</span>
        </NuxtLink>
      </template>

      <template #default>
        <UNavigationMenu :items="links" />
      </template>

      <template #right>
        <UButton icon="i-heroicons-magnifying-glass" color="neutral" variant="ghost" />
        <UButton icon="i-heroicons-shopping-cart" color="neutral" variant="ghost" to="/cart" />

        <template v-if="isLoggedIn">
          <UDropdownMenu :items="userMenuItems">
            <UButton color="neutral" variant="ghost">
              <UAvatar size="xs" :alt="fullName" />
              <span class="hidden sm:inline">{{ fullName }}</span>
            </UButton>
          </UDropdownMenu>
        </template>
        <template v-else>
          <UButton label="Đăng nhập" color="primary" to="/login" />
        </template>
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <UFooter>
      <template #left>
        <span class="text-muted text-sm">&copy; {{ new Date().getFullYear() }} TechForge. All rights reserved.</span>
      </template>
      <template #right>
        <div class="flex items-center gap-4">
          <NuxtLink to="/about" class="text-muted hover:text-primary text-sm">Về chúng tôi</NuxtLink>
          <NuxtLink to="/contact" class="text-muted hover:text-primary text-sm">Liên hệ</NuxtLink>
          <NuxtLink to="/policy" class="text-muted hover:text-primary text-sm">Chính sách</NuxtLink>
        </div>
      </template>
    </UFooter>
  </UApp>
</template>
