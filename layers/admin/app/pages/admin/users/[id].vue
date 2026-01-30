<script lang="ts" setup>
import type { FormErrorEvent } from '@nuxt/ui'
import type { UserDetail, MediaItem } from '#shared/types'
import { MIN_PASSWORD_LENGTH } from '#shared/utils/validation'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { hasPermission } = useAuth()
const { scrollToError } = useFormScroll()

const userId = computed(() => route.params.id as string)
const isNew = computed(() => userId.value === 'new')

// Check if user can change role
const canChangeRole = computed(() => hasPermission('roles', 'UPDATE'))

// Avatar picker
const showAvatarPicker = ref(false)

function onAvatarSelect(items: MediaItem[]) {
  const selected = items[0]
  if (selected && selected.type === 'file' && selected.url) {
    state.avatar = selected.url
  }
}

function removeAvatar() {
  state.avatar = ''
}

useSeoMeta({
  title: () => (isNew.value ? 'Thêm người dùng' : 'Sửa người dùng') + ' - TechForge Admin',
})

// Fetch user data (for edit mode)
const { data: user } = useFetch<UserDetail>(`/api/admin/users/${userId.value}`, {
  immediate: !isNew.value,
})

// Fetch roles for select
const { data: roles } = useFetch('/api/admin/roles')

const roleOptions = computed(() => {
  if (!roles.value) return []
  return roles.value.map(r => ({ value: r.id, label: r.displayName }))
})

// Form state
const state = reactive({
  email: '',
  phone: '',
  password: '',
  firstName: '',
  lastName: '',
  avatar: '',
  roleId: undefined as string | undefined,
  isActive: true,
})

// Populate form when user is loaded
watch(
  user,
  newUser => {
    if (newUser) {
      state.email = newUser.email
      state.phone = newUser.phone || ''
      state.password = '' // Don't populate password
      state.firstName = newUser.firstName || ''
      state.lastName = newUser.lastName || ''
      state.avatar = newUser.avatar || ''
      state.roleId = newUser.role?.id || undefined
      state.isActive = newUser.isActive
    }
  },
  { immediate: true },
)

// Validation
function validate(formState: typeof state) {
  const errors = []

  if (!formState.email?.trim()) {
    errors.push({ name: 'email', message: 'Email là bắt buộc' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
    errors.push({ name: 'email', message: 'Email không hợp lệ' })
  }

  if (isNew.value && !formState.password?.trim()) {
    errors.push({ name: 'password', message: 'Mật khẩu là bắt buộc cho người dùng mới' })
  }

  if (formState.password && formState.password.length < MIN_PASSWORD_LENGTH) {
    errors.push({ name: 'password', message: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự` })
  }

  return errors
}

// Submit
const loading = ref(false)

function onError(event: FormErrorEvent) {
  scrollToError(event.errors)
}

async function onSubmit() {
  loading.value = true
  try {
    const data: Record<string, unknown> = {
      email: state.email.trim(),
      phone: state.phone?.trim() || null,
      firstName: state.firstName?.trim() || null,
      lastName: state.lastName?.trim() || null,
      avatar: state.avatar?.trim() || null,
      roleId: state.roleId ?? null,
      isActive: state.isActive,
    }

    // Only include password if provided
    if (state.password) {
      data.password = state.password
    }

    if (isNew.value) {
      await $fetch('/api/admin/users', {
        method: 'POST',
        body: data,
      })
      toast.add({ title: 'Thành công', description: 'Đã tạo người dùng mới', color: 'success' })
    } else {
      await $fetch(`/api/admin/users/${userId.value}`, {
        method: 'PUT',
        body: data,
      })
      toast.add({ title: 'Thành công', description: 'Đã cập nhật người dùng', color: 'success' })
    }

    router.push('/admin/users')
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Lỗi',
      description: err.data?.message || 'Không thể lưu người dùng',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Format helpers
function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <UDashboardNavbar :title="isNew ? 'Thêm người dùng' : 'Sửa người dùng'">
      <template #leading>
        <UButton color="neutral" icon="i-heroicons-arrow-left" to="/admin/users" variant="ghost" />
      </template>
    </UDashboardNavbar>

    <div class="min-h-0 flex-1 overflow-y-auto p-6">
      <div class="mx-auto max-w-4xl">
        <UForm :state="state" :validate="validate" class="space-y-6" @error="onError" @submit="onSubmit">
          <!-- Basic Info -->
          <UCard>
            <template #header>
              <h3 class="font-semibold">Thông tin cơ bản</h3>
            </template>

            <div class="grid gap-4 md:grid-cols-2">
              <UFormField class="md:col-span-2" label="Email" name="email" required>
                <UInput v-model="state.email" class="w-full" placeholder="user@example.com" type="email" />
              </UFormField>

              <UFormField label="Họ" name="firstName">
                <UInput v-model="state.firstName" class="w-full" placeholder="Nguyễn" />
              </UFormField>

              <UFormField label="Tên" name="lastName">
                <UInput v-model="state.lastName" class="w-full" placeholder="Văn A" />
              </UFormField>

              <UFormField label="Số điện thoại" name="phone">
                <UInput v-model="state.phone" class="w-full" placeholder="0912345678" />
              </UFormField>

              <UFormField label="Avatar" name="avatar">
                <div class="flex items-center gap-4">
                  <!-- Preview -->
                  <div class="relative">
                    <img
                      v-if="state.avatar"
                      :src="state.avatar"
                      alt="Avatar"
                      class="size-16 rounded-full object-cover"
                    />
                    <div
                      v-else
                      class="flex size-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
                    >
                      <UIcon name="i-heroicons-user" class="size-8 text-neutral-400" />
                    </div>
                    <!-- Remove button -->
                    <UButton
                      v-if="state.avatar"
                      icon="i-heroicons-x-mark"
                      size="xs"
                      color="error"
                      variant="solid"
                      class="absolute -top-1 -right-1 rounded-full"
                      @click="removeAvatar"
                    />
                  </div>
                  <!-- Select button -->
                  <UButton
                    icon="i-heroicons-photo"
                    label="Chọn ảnh"
                    variant="outline"
                    @click="showAvatarPicker = true"
                  />
                </div>
              </UFormField>
            </div>
          </UCard>

          <!-- Security -->
          <UCard>
            <template #header>
              <h3 class="font-semibold">Bảo mật</h3>
            </template>

            <div class="grid gap-4 md:grid-cols-2">
              <UFormField :label="isNew ? 'Mật khẩu' : 'Mật khẩu mới'" :required="isNew" name="password">
                <UInput v-model="state.password" class="w-full" placeholder="••••••••" type="password" />
                <template #hint>
                  <span v-if="!isNew" class="text-xs text-neutral-500">Để trống nếu không muốn đổi mật khẩu</span>
                </template>
              </UFormField>

              <UFormField label="Role" name="roleId">
                <USelectMenu
                  v-model="state.roleId"
                  :disabled="!canChangeRole"
                  :items="roleOptions"
                  class="w-full"
                  clear
                  placeholder="— Không có role —"
                  value-key="value"
                />
                <template v-if="!canChangeRole" #hint>
                  <span class="text-xs text-neutral-500">Bạn không có quyền thay đổi role</span>
                </template>
              </UFormField>

              <UFormField class="md:col-span-2" name="isActive">
                <UCheckbox v-model="state.isActive" label="Tài khoản đang hoạt động" />
              </UFormField>
            </div>
          </UCard>

          <!-- User Stats (Edit mode only) -->
          <UCard v-if="!isNew && user">
            <template #header>
              <h3 class="font-semibold">Thông tin khác</h3>
            </template>

            <div class="grid gap-4 text-sm md:grid-cols-3">
              <div>
                <span class="text-muted">Ngày tạo:</span>
                <p class="font-medium">{{ formatDate(user.createdAt) }}</p>
              </div>
              <div>
                <span class="text-muted">Đăng nhập cuối:</span>
                <p class="font-medium">{{ formatDate(user.lastLoginAt) }}</p>
              </div>
              <div>
                <span class="text-muted">Email verified:</span>
                <p class="font-medium">{{ user.emailVerified ? formatDate(user.emailVerified) : 'Chưa xác thực' }}</p>
              </div>
              <div>
                <span class="text-muted">Số đơn hàng:</span>
                <p class="font-medium">{{ user._count.orders }}</p>
              </div>
              <div>
                <span class="text-muted">Số đánh giá:</span>
                <p class="font-medium">{{ user._count.reviews }}</p>
              </div>
              <div>
                <span class="text-muted">Số địa chỉ:</span>
                <p class="font-medium">{{ user.addresses.length }}</p>
              </div>
            </div>

            <!-- Addresses -->
            <div v-if="user.addresses.length > 0" class="mt-4 border-t pt-4">
              <h4 class="mb-2 font-medium">Địa chỉ</h4>
              <div class="space-y-2">
                <div
                  v-for="addr in user.addresses"
                  :key="addr.id"
                  class="bg-muted/50 flex items-start justify-between rounded-lg p-3"
                >
                  <div class="text-sm">
                    <p>{{ addr.addressLine }}</p>
                    <p class="text-muted">
                      {{ [addr.ward, addr.district, addr.province].filter(Boolean).join(', ') }}
                    </p>
                  </div>
                  <UBadge v-if="addr.isDefault" color="primary" size="xs" variant="subtle">Mặc định</UBadge>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Actions -->
          <div class="flex justify-end gap-3">
            <UButton color="neutral" label="Hủy" to="/admin/users" variant="outline" />
            <UButton :label="isNew ? 'Tạo người dùng' : 'Lưu thay đổi'" :loading="loading" type="submit" />
          </div>
        </UForm>
      </div>
    </div>

    <!-- Avatar Picker Modal -->
    <MediaPickerModal v-model:open="showAvatarPicker" accept="image" @select="onAvatarSelect" />
  </div>
</template>
