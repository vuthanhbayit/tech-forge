<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Permission, RoleDetail, GroupedPermissions } from '#shared/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const roleId = computed(() => route.params.id as string)
const isNew = computed(() => roleId.value === 'new')

useSeoMeta({
  title: () => (isNew.value ? 'Thêm Role' : 'Sửa Role') + ' - TechForge Admin',
})

// Fetch role data
const { data: role } = await useFetch<RoleDetail>(`/api/admin/roles/${roleId.value}`, {
  immediate: !isNew.value,
})

// Fetch all permissions
const { data: permissionsGrouped } = await useFetch<GroupedPermissions>('/api/admin/permissions', {
  query: { grouped: true },
})

// Form state
const state = reactive({
  name: '',
  displayName: '',
  description: '',
  isDefault: false,
  permissionIds: [] as string[],
})

// Populate form when role is loaded
watch(
  role,
  newRole => {
    if (newRole) {
      state.name = newRole.name
      state.displayName = newRole.displayName
      state.description = newRole.description || ''
      state.isDefault = newRole.isDefault
      state.permissionIds = newRole.permissions.map(p => p.permission.id)
    }
  },
  { immediate: true }
)

// Validation
function validate(formState: typeof state) {
  const errors = []
  if (!formState.name?.trim()) errors.push({ name: 'name', message: 'Mã role là bắt buộc' })
  if (!formState.displayName?.trim()) errors.push({ name: 'displayName', message: 'Tên hiển thị là bắt buộc' })
  return errors
}

// Submit
const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  loading.value = true
  try {
    if (isNew.value) {
      await $fetch('/api/admin/roles', {
        method: 'POST',
        body: event.data,
      })
      toast.add({ title: 'Thành công', description: 'Đã tạo role mới', color: 'success' })
    } else {
      await $fetch(`/api/admin/roles/${roleId.value}`, {
        method: 'PUT',
        body: event.data,
      })
      toast.add({ title: 'Thành công', description: 'Đã cập nhật role', color: 'success' })
    }
    router.push('/admin/roles')
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Lỗi',
      description: err.data?.message || 'Không thể lưu role',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Toggle all permissions in a group
function toggleGroup(groupPermissions: Permission[], checked: boolean) {
  const ids = groupPermissions.map(p => p.id)
  if (checked) {
    state.permissionIds = [...new Set([...state.permissionIds, ...ids])]
  } else {
    state.permissionIds = state.permissionIds.filter(id => !ids.includes(id))
  }
}

function isGroupChecked(groupPermissions: Permission[]) {
  return groupPermissions.every(p => state.permissionIds.includes(p.id))
}

function isGroupIndeterminate(groupPermissions: Permission[]) {
  const checkedCount = groupPermissions.filter(p => state.permissionIds.includes(p.id)).length
  return checkedCount > 0 && checkedCount < groupPermissions.length
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <UDashboardNavbar :title="isNew ? 'Thêm Role' : 'Sửa Role'">
      <template #leading>
        <UButton icon="i-heroicons-arrow-left" color="neutral" variant="ghost" to="/admin/roles" />
      </template>
    </UDashboardNavbar>

    <div class="min-h-0 flex-1 overflow-y-auto p-6">
      <UForm :state="state" :validate="validate" class="space-y-6" @submit="onSubmit">
        <!-- Basic Info -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Thông tin Role</h3>
          </template>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Mã role" name="name" required>
              <UInput
                v-model="state.name"
                placeholder="product_manager"
                :disabled="role?.isSystem"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Tên hiển thị" name="displayName" required>
              <UInput
                v-model="state.displayName"
                placeholder="Quản lý sản phẩm"
                :disabled="role?.isSystem"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Mô tả" name="description" class="md:col-span-2">
              <UTextarea
                v-model="state.description"
                placeholder="Mô tả ngắn về role này..."
                :disabled="role?.isSystem"
                class="w-full"
              />
            </UFormField>

            <UFormField name="isDefault">
              <UCheckbox v-model="state.isDefault" label="Role mặc định cho người dùng mới" />
            </UFormField>
          </div>
        </UCard>

        <!-- Permissions -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">Phân quyền</h3>
              <UBadge :label="`${state.permissionIds.length} permissions`" variant="subtle" />
            </div>
          </template>

          <div class="space-y-6">
            <div v-for="(permissions, group) in permissionsGrouped" :key="group" class="space-y-3">
              <!-- Group Header -->
              <div class="flex items-center gap-3 border-b pb-2">
                <UCheckbox
                  :model-value="isGroupChecked(permissions) ? true : isGroupIndeterminate(permissions) ? 'indeterminate' : false"
                  :label="String(group)"
                  class="font-medium"
                  @update:model-value="toggleGroup(permissions, $event === true)"
                />
                <span class="text-muted text-sm">({{ permissions.length }})</span>
              </div>

              <!-- Permissions in group -->
              <div class="grid gap-2 pl-6 md:grid-cols-2 lg:grid-cols-3">
                <UCheckbox
                  v-for="perm in permissions"
                  :key="perm.id"
                  :model-value="state.permissionIds.includes(perm.id)"
                  :label="perm.name"
                  @update:model-value="
                    $event
                      ? state.permissionIds.push(perm.id)
                      : (state.permissionIds = state.permissionIds.filter(id => id !== perm.id))
                  "
                />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <UButton label="Hủy" color="neutral" variant="outline" to="/admin/roles" />
          <UButton type="submit" :label="isNew ? 'Tạo Role' : 'Lưu thay đổi'" :loading="loading" />
        </div>
      </UForm>
    </div>
  </div>
</template>
