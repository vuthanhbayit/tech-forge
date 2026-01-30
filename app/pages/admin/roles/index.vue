<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Quản lý Roles - TechForge Admin',
})

interface Role {
  id: string
  name: string
  displayName: string
  description: string | null
  isSystem: boolean
  isDefault: boolean
  _count: {
    users: number
    permissions: number
  }
}

const { data: roles, refresh, status } = await useFetch<Role[]>('/api/admin/roles')

const columns: TableColumn<Role>[] = [
  { accessorKey: 'displayName', header: 'Tên hiển thị' },
  { accessorKey: 'name', header: 'Mã role' },
  { accessorKey: '_count.permissions', header: 'Permissions' },
  { accessorKey: '_count.users', header: 'Người dùng' },
  { accessorKey: 'isSystem', header: 'Hệ thống' },
  { accessorKey: 'actions', header: '' },
]

// Delete role
const toast = useToast()
const deleteLoading = ref<string | null>(null)

async function deleteRole(role: Role) {
  if (role.isSystem) {
    toast.add({ title: 'Lỗi', description: 'Không thể xóa role hệ thống', color: 'error' })
    return
  }

  if (role._count.users > 0) {
    toast.add({
      title: 'Lỗi',
      description: `Không thể xóa role có ${role._count.users} người dùng`,
      color: 'error',
    })
    return
  }

  if (!confirm(`Bạn có chắc muốn xóa role "${role.displayName}"?`)) return

  deleteLoading.value = role.id
  try {
    await $fetch(`/api/admin/roles/${role.id}`, { method: 'DELETE' })
    toast.add({ title: 'Thành công', description: 'Đã xóa role', color: 'success' })
    refresh()
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Lỗi',
      description: err.data?.message || 'Không thể xóa role',
      color: 'error',
    })
  } finally {
    deleteLoading.value = null
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <UDashboardNavbar title="Quản lý Roles">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #right>
        <UButton label="Thêm Role" icon="i-heroicons-plus" to="/admin/roles/new" />
      </template>
    </UDashboardNavbar>

    <div class="min-h-0 flex-1 overflow-y-auto p-6">
      <UCard>
        <UTable :columns="columns" :data="roles || []" :loading="status === 'pending'">
          <template #cell-isSystem="{ row }">
            <UBadge v-if="row.original.isSystem" label="Hệ thống" color="neutral" variant="subtle" />
            <UBadge v-if="row.original.isDefault" label="Mặc định" color="primary" variant="subtle" class="ml-1" />
          </template>

          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <UButton
                icon="i-heroicons-pencil-square"
                color="neutral"
                variant="ghost"
                size="sm"
                :to="`/admin/roles/${row.original.id}`"
              />
              <UButton
                icon="i-heroicons-trash"
                color="error"
                variant="ghost"
                size="sm"
                :disabled="row.original.isSystem || row.original._count.users > 0"
                :loading="deleteLoading === row.original.id"
                @click="deleteRole(row.original)"
              />
            </div>
          </template>
        </UTable>
      </UCard>
    </div>
  </div>
</template>
