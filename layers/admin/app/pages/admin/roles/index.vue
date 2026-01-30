<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Role } from '#shared/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Quản lý Roles - TechForge Admin',
})

const { handleError, showSuccess, showWarning } = useApiError()

const { data: roles, refresh, status } = await useFetch<Role[]>('/api/admin/roles')

const columns: TableColumn<Role>[] = [
  { accessorKey: 'displayName', header: 'Tên hiển thị' },
  { accessorKey: 'name', header: 'Mã role' },
  { accessorKey: '_count.permissions', header: 'Permissions' },
  { accessorKey: '_count.users', header: 'Người dùng' },
  { accessorKey: 'isSystem', header: 'Hệ thống' },
  { accessorKey: 'actions', header: '' },
]

// Delete confirmation modal
const {
  isOpen: deleteModal,
  itemToDelete: roleToDelete,
  isDeleting,
  openModal,
  confirmDelete,
} = useDeleteConfirm<Role>()

function handleDeleteClick(role: Role) {
  if (role.isSystem) {
    showWarning('Không thể xóa role hệ thống')
    return
  }
  if (role._count.users > 0) {
    showWarning(`Không thể xóa role có ${role._count.users} người dùng`)
    return
  }
  openModal(role)
}

async function deleteRole() {
  await confirmDelete(async () => {
    await $fetch(`/api/admin/roles/${roleToDelete.value!.id}`, { method: 'DELETE' })
    showSuccess('Đã xóa role')
    refresh()
  })
}

async function handleDelete() {
  try {
    await deleteRole()
  } catch (error) {
    handleError(error, 'Không thể xóa role')
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <AdminPageHeader title="Quản lý Roles" add-label="Thêm Role" add-link="/admin/roles/new" />

    <div class="min-h-0 flex-1 overflow-y-auto p-6">
      <UCard>
        <UTable :columns="columns" :data="roles || []" :loading="status === 'pending'">
          <template #cell-isSystem="{ row }">
            <UBadge v-if="row.original.isSystem" label="Hệ thống" color="neutral" variant="subtle" />
            <UBadge v-if="row.original.isDefault" label="Mặc định" color="primary" variant="subtle" class="ml-1" />
          </template>

          <template #cell-actions="{ row }">
            <TableActions
              :edit-link="`/admin/roles/${row.original.id}`"
              :delete-disabled="row.original.isSystem || row.original._count.users > 0"
              @delete="handleDeleteClick(row.original)"
            />
          </template>
        </UTable>
      </UCard>
    </div>

    <!-- Delete Modal -->
    <DeleteConfirmModal
      v-model:open="deleteModal"
      :item-name="roleToDelete?.displayName"
      :loading="isDeleting"
      description="Role sẽ bị xóa vĩnh viễn."
      @confirm="handleDelete"
    />
  </div>
</template>
