<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Dashboard - TechForge Admin',
})

const stats = [
  { label: 'Đơn hàng hôm nay', value: '12', icon: 'i-heroicons-shopping-bag', change: '+5%' },
  { label: 'Doanh thu hôm nay', value: '45.2M', icon: 'i-heroicons-banknotes', change: '+12%' },
  { label: 'Khách hàng mới', value: '8', icon: 'i-heroicons-users', change: '+3%' },
  { label: 'Sản phẩm hết hàng', value: '3', icon: 'i-heroicons-exclamation-triangle', change: '-2' },
]
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <UDashboardNavbar title="Dashboard">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
    </UDashboardNavbar>

    <div class="min-h-0 flex-1 overflow-y-auto p-6">
      <!-- Stats -->
      <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <UCard v-for="stat in stats" :key="stat.label">
          <div class="flex items-center gap-4">
            <div class="bg-primary/10 rounded-lg p-3">
              <UIcon :name="stat.icon" class="text-primary size-6" />
            </div>
            <div>
              <p class="text-muted text-sm">{{ stat.label }}</p>
              <p class="text-2xl font-bold">{{ stat.value }}</p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Recent Orders -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Đơn hàng gần đây</h3>
            <UButton label="Xem tất cả" variant="ghost" size="sm" to="/admin/orders" />
          </div>
        </template>

        <UTable
          :columns="[
            { accessorKey: 'id', header: 'Mã đơn' },
            { accessorKey: 'customer', header: 'Khách hàng' },
            { accessorKey: 'total', header: 'Tổng tiền' },
            { accessorKey: 'status', header: 'Trạng thái' },
            { accessorKey: 'date', header: 'Ngày đặt' },
          ]"
          :data="[
            { id: '#1001', customer: 'Nguyễn Văn A', total: '15,000,000đ', status: 'Đang xử lý', date: '29/01/2026' },
            { id: '#1002', customer: 'Trần Thị B', total: '8,500,000đ', status: 'Đã giao', date: '29/01/2026' },
            { id: '#1003', customer: 'Lê Văn C', total: '25,000,000đ', status: 'Chờ thanh toán', date: '28/01/2026' },
          ]"
        />
      </UCard>
    </div>
  </div>
</template>
