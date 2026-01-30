<script lang="ts" setup>
import type { User } from '#shared/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Quản lý người dùng - TechForge Admin',
})

const { handleError, showSuccess } = useApiError()
const { formatDateTime } = useFormatters()
const {
  isOpen: deleteModal,
  itemToDelete: userToDelete,
  isDeleting,
  openModal,
  confirmDelete,
} = useDeleteConfirm<User>()

// Filters
const search = ref('')
const selectedRoleId = ref<string | undefined>(undefined)
const selectedStatus = ref<string | undefined>(undefined)
const page = ref(1)
const limit = 20

// Debounced search
const debouncedSearch = refDebounced(search, 300)

// Fetch roles for filter
const { data: roles } = useFetch('/api/admin/roles')

const roleOptions = computed(() => {
  if (!roles.value) return []
  return roles.value.map(r => ({ value: r.id, label: r.displayName }))
})

const statusOptions = [
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Đã vô hiệu hóa' },
]

// Query params - only include if has value
const queryRoleId = computed(() => selectedRoleId.value || undefined)
const queryIsActive = computed(() => selectedStatus.value || undefined)

// Fetch users
const {
  data,
  refresh,
  status: fetchStatus,
} = useFetch('/api/admin/users', {
  query: {
    page,
    limit,
    search: debouncedSearch,
    roleId: queryRoleId,
    isActive: queryIsActive,
  },
  watch: [page, debouncedSearch, selectedRoleId, selectedStatus],
})

const users = computed(() => data.value?.users || [])
const totalPages = computed(() => data.value?.pagination.totalPages || 1)
const total = computed(() => data.value?.pagination.total || 0)

// Reset page when filters change
watch([debouncedSearch, selectedRoleId, selectedStatus], () => {
  page.value = 1
})

// Table columns
const columns = [
  { accessorKey: 'user', header: 'Người dùng' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Trạng thái' },
  { accessorKey: 'orders', header: 'Đơn hàng' },
  { accessorKey: 'lastLogin', header: 'Đăng nhập cuối' },
  { accessorKey: 'actions', header: '' },
]

// Delete user
async function deleteUser() {
  await confirmDelete(async () => {
    await $fetch(`/api/admin/users/${userToDelete.value!.id}`, { method: 'DELETE' })
    showSuccess('Đã xóa người dùng')
    refresh()
  })
}

async function handleDelete() {
  try {
    await deleteUser()
  } catch (error) {
    handleError(error, 'Không thể xóa người dùng')
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <AdminPageHeader title="Quản lý người dùng" add-label="Thêm người dùng" add-link="/admin/users/new" />

    <div class="min-h-0 flex-1 overflow-y-auto p-6">
      <!-- Filters -->
      <div class="mb-6 flex flex-wrap items-center gap-4">
        <UInput
          v-model="search"
          class="w-64"
          icon="i-heroicons-magnifying-glass"
          placeholder="Tìm theo email, tên, SĐT..."
        />
        <USelectMenu
          v-model="selectedRoleId"
          :items="roleOptions"
          :search-input="false"
          class="w-48"
          clear
          placeholder="Tất cả roles"
          value-key="value"
        />
        <USelectMenu
          v-model="selectedStatus"
          :items="statusOptions"
          :search-input="false"
          class="w-48"
          clear
          placeholder="Tất cả trạng thái"
          value-key="value"
        />
        <span class="text-muted text-sm">{{ total }} người dùng</span>
      </div>

      <!-- Table -->
      <UCard>
        <UTable :columns="columns" :data="users" :loading="fetchStatus === 'pending'">
          <template #user-cell="{ row }">
            <UserCell
              :first-name="row.original.firstName"
              :last-name="row.original.lastName"
              :email="row.original.email"
              :phone="row.original.phone"
              :avatar="row.original.avatar"
            />
          </template>

          <template #role-cell="{ row }">
            <UBadge v-if="row.original.role" color="primary" variant="subtle">
              {{ row.original.role.displayName }}
            </UBadge>
            <span v-else class="text-muted">—</span>
          </template>

          <template #status-cell="{ row }">
            <StatusBadge :active="row.original.isActive" />
          </template>

          <template #orders-cell="{ row }">
            <span>{{ row.original._count.orders }}</span>
          </template>

          <template #lastLogin-cell="{ row }">
            <span class="text-muted text-sm">{{ formatDateTime(row.original.lastLoginAt) }}</span>
          </template>

          <template #actions-cell="{ row }">
            <TableActions
              :edit-link="`/admin/users/${row.original.id}`"
              :delete-disabled="row.original.role?.name === 'super_admin'"
              @delete="openModal(row.original)"
            />
          </template>
        </UTable>
      </UCard>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-4 flex justify-center">
        <UPagination v-model:page="page" :items-per-page="limit" :total="total" />
      </div>
    </div>

    <!-- Delete Modal -->
    <DeleteConfirmModal
      v-model:open="deleteModal"
      :item-name="userToDelete?.email"
      :loading="isDeleting"
      description="Người dùng sẽ bị vô hiệu hóa và không thể đăng nhập."
      @confirm="handleDelete"
    />
  </div>
</template>
