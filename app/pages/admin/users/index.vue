<script lang="ts" setup>
import type { User } from '#shared/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Quản lý người dùng - TechForge Admin',
})

const toast = useToast()

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

// Format helpers
function getFullName(user: User): string {
  const parts = [user.firstName, user.lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : user.email
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Delete user
const deleteModal = ref(false)
const userToDelete = ref<User | null>(null)
const deleting = ref(false)

function confirmDelete(user: User) {
  userToDelete.value = user
  deleteModal.value = true
}

async function deleteUser() {
  if (!userToDelete.value) return

  deleting.value = true
  try {
    await $fetch(`/api/admin/users/${userToDelete.value.id}`, {
      method: 'DELETE',
    })
    toast.add({ title: 'Thành công', description: 'Đã xóa người dùng', color: 'success' })
    deleteModal.value = false
    userToDelete.value = null
    refresh()
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Lỗi',
      description: err.data?.message || 'Không thể xóa người dùng',
      color: 'error',
    })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <UDashboardNavbar title="Quản lý người dùng">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #right>
        <UButton icon="i-heroicons-plus" label="Thêm người dùng" to="/admin/users/new" />
      </template>
    </UDashboardNavbar>

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
            <div class="flex items-center gap-3">
              <UAvatar :alt="getFullName(row.original)" :src="row.original.avatar ?? undefined" size="sm" />
              <div>
                <div class="font-medium">{{ getFullName(row.original) }}</div>
                <div class="text-muted text-sm">{{ row.original.email }}</div>
                <div v-if="row.original.phone" class="text-muted text-xs">{{ row.original.phone }}</div>
              </div>
            </div>
          </template>

          <template #role-cell="{ row }">
            <UBadge v-if="row.original.role" color="primary" variant="subtle">
              {{ row.original.role.displayName }}
            </UBadge>
            <span v-else class="text-muted">—</span>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="row.original.isActive ? 'success' : 'neutral'" variant="subtle">
              {{ row.original.isActive ? 'Hoạt động' : 'Vô hiệu hóa' }}
            </UBadge>
          </template>

          <template #orders-cell="{ row }">
            <span>{{ row.original._count.orders }}</span>
          </template>

          <template #lastLogin-cell="{ row }">
            <span class="text-muted text-sm">{{ formatDate(row.original.lastLoginAt) }}</span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex justify-end gap-2">
              <UButton
                :to="`/admin/users/${row.original.id}`"
                color="neutral"
                icon="i-heroicons-pencil-square"
                size="xs"
                variant="ghost"
              />
              <UButton
                :disabled="row.original.role?.name === 'super_admin'"
                color="error"
                icon="i-heroicons-trash"
                size="xs"
                variant="ghost"
                @click="confirmDelete(row.original)"
              />
            </div>
          </template>
        </UTable>
      </UCard>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-4 flex justify-center">
        <UPagination v-model:page="page" :items-per-page="limit" :total="total" />
      </div>
    </div>

    <!-- Delete Modal -->
    <UModal v-model:open="deleteModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Xác nhận xóa</h3>
          </template>

          <p>
            Bạn có chắc muốn xóa người dùng
            <strong>{{ userToDelete?.email }}</strong>
            ?
          </p>
          <p class="text-muted mt-2 text-sm">Người dùng sẽ bị vô hiệu hóa và không thể đăng nhập.</p>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton color="neutral" label="Hủy" variant="outline" @click="deleteModal = false" />
              <UButton :loading="deleting" color="error" label="Xóa" @click="deleteUser" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
