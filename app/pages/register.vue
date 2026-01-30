<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Đăng ký - TechForge',
})

const { register } = useAuth()
const toast = useToast()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
  error.value = ''

  if (form.password !== form.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  loading.value = true

  try {
    await register({
      email: form.email,
      password: form.password,
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      phone: form.phone || undefined,
    })
    toast.add({
      title: 'Đăng ký thành công',
      description: 'Chào mừng bạn đến với TechForge!',
      color: 'success',
    })
    await navigateTo('/')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err.data?.message || 'Đã có lỗi xảy ra'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="mb-4 flex items-center justify-center gap-2">
          <UIcon name="i-heroicons-computer-desktop" class="text-primary size-10" />
          <span class="text-2xl font-bold">TechForge</span>
        </NuxtLink>
        <h1 class="text-2xl font-bold">Đăng ký tài khoản</h1>
        <p class="text-muted mt-2">Tạo tài khoản để mua sắm dễ dàng hơn</p>
      </div>

      <UCard>
        <UForm :state="form" class="space-y-4" @submit="onSubmit">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Họ" name="lastName">
              <UInput v-model="form.lastName" placeholder="Nguyễn" class="w-full" />
            </UFormField>

            <UFormField label="Tên" name="firstName">
              <UInput v-model="form.firstName" placeholder="Văn A" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Email" name="email" required>
            <UInput v-model="form.email" type="email" placeholder="email@example.com" class="w-full" />
          </UFormField>

          <UFormField label="Số điện thoại" name="phone">
            <UInput v-model="form.phone" type="tel" placeholder="0912345678" class="w-full" />
          </UFormField>

          <UFormField label="Mật khẩu" name="password" required hint="Ít nhất 6 ký tự">
            <UInput v-model="form.password" type="password" placeholder="Nhập mật khẩu" class="w-full" />
          </UFormField>

          <UFormField label="Xác nhận mật khẩu" name="confirmPassword" required>
            <UInput v-model="form.confirmPassword" type="password" placeholder="Nhập lại mật khẩu" class="w-full" />
          </UFormField>

          <UAlert v-if="error" color="error" :title="error" icon="i-heroicons-exclamation-circle" />

          <UButton type="submit" block size="lg" :loading="loading">Đăng ký</UButton>
        </UForm>

        <template #footer>
          <p class="text-center text-sm">
            Đã có tài khoản?
            <NuxtLink to="/login" class="text-primary font-medium hover:underline">Đăng nhập</NuxtLink>
          </p>
        </template>
      </UCard>
    </div>
  </div>
</template>
