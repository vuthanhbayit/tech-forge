<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Đăng nhập - TechForge',
})

const { login } = useAuth()
const toast = useToast()

const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    await login(form)
    toast.add({
      title: 'Đăng nhập thành công',
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
        <h1 class="text-2xl font-bold">Đăng nhập</h1>
        <p class="text-muted mt-2">Chào mừng bạn quay trở lại</p>
      </div>

      <UCard>
        <UForm :state="form" class="space-y-4" @submit="onSubmit">
          <UFormField label="Email" name="email" required>
            <UInput v-model="form.email" type="email" placeholder="email@example.com" size="lg" class="w-full" />
          </UFormField>

          <UFormField label="Mật khẩu" name="password" required>
            <UInput v-model="form.password" type="password" placeholder="Nhập mật khẩu" size="lg" class="w-full" />
          </UFormField>

          <UAlert v-if="error" color="error" :title="error" icon="i-heroicons-exclamation-circle" />

          <UButton type="submit" block size="lg" :loading="loading">Đăng nhập</UButton>
        </UForm>

        <template #footer>
          <p class="text-center text-sm">
            Chưa có tài khoản?
            <NuxtLink to="/register" class="text-primary font-medium hover:underline">Đăng ký ngay</NuxtLink>
          </p>
        </template>
      </UCard>
    </div>
  </div>
</template>
