<script lang="ts" setup>
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import type { CategoryDetail, CategoryOption } from '#shared/types'
import { removeVietnameseTones, toKebabCase } from '@vt7/utils'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { scrollToError } = useFormScroll()

const categoryId = computed(() => route.params.id as string)
const isNew = computed(() => categoryId.value === 'new')

useSeoMeta({
  title: () => (isNew.value ? 'Thêm danh mục' : 'Sửa danh mục') + ' - TechForge Admin',
})

// Fetch category data (for edit mode)
const { data: category } = await useFetch<CategoryDetail>(`/api/admin/categories/${categoryId.value}`, {
  immediate: !isNew.value,
})

// Fetch parent category options (exclude current category and its children when editing)
const { data: allCategories } = await useFetch<CategoryOption[]>('/api/admin/categories', {
  query: {
    excludeId: isNew.value ? undefined : categoryId.value,
  },
})

// Build parent options
const parentOptions = computed(() => {
  if (!allCategories.value) return []

  const options = [{ id: '', name: '— Danh mục gốc —' }]
  allCategories.value.forEach(cat => {
    options.push(cat)
  })

  return options
})

// Form state
const state = reactive({
  name: '',
  slug: '',
  description: '',
  image: '',
  parentId: '',
  rank: 0,
  isActive: true,
  specTemplate: '',
})

// Track if slug was manually edited
const slugManuallyEdited = ref(false)

// Populate form when category is loaded
watch(
  category,
  newCategory => {
    if (newCategory) {
      state.name = newCategory.name
      state.slug = newCategory.slug
      state.description = newCategory.description || ''
      state.image = newCategory.image || ''
      state.parentId = newCategory.parentId || ''
      state.rank = newCategory.rank
      state.isActive = newCategory.isActive
      state.specTemplate = newCategory.specTemplate ? JSON.stringify(newCategory.specTemplate, null, 2) : ''
      slugManuallyEdited.value = true // Don't auto-generate when editing
    }
  },
  { immediate: true },
)

// Auto-generate slug from name (only for new categories)
watch(
  () => state.name,
  newName => {
    if (isNew.value && !slugManuallyEdited.value && newName) {
      state.slug = toKebabCase(removeVietnameseTones(newName))
    }
  },
)

// Mark slug as manually edited when user changes it
function onSlugInput() {
  slugManuallyEdited.value = true
}

// Validation
function validate(formState: typeof state) {
  const errors = []

  if (!formState.name?.trim()) {
    errors.push({ name: 'name', message: 'Tên danh mục là bắt buộc' })
  }

  if (!formState.slug?.trim()) {
    errors.push({ name: 'slug', message: 'Slug là bắt buộc' })
  } else if (!/^[a-z0-9-]+$/.test(formState.slug)) {
    errors.push({ name: 'slug', message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang' })
  }

  if (formState.rank < 0) {
    errors.push({ name: 'rank', message: 'Thứ tự phải >= 0' })
  }

  // Validate JSON if specTemplate is provided
  if (formState.specTemplate?.trim()) {
    try {
      JSON.parse(formState.specTemplate)
    } catch {
      errors.push({ name: 'specTemplate', message: 'Spec Template phải là JSON hợp lệ' })
    }
  }

  return errors
}

// Submit
const loading = ref(false)

function onError(event: FormErrorEvent) {
  scrollToError(event.errors)
}

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  loading.value = true
  try {
    // Prepare data
    const data = {
      name: event.data.name.trim(),
      slug: event.data.slug.trim(),
      description: event.data.description?.trim() || null,
      image: event.data.image?.trim() || null,
      parentId: event.data.parentId || null,
      rank: event.data.rank,
      isActive: event.data.isActive,
      specTemplate: event.data.specTemplate?.trim() ? JSON.parse(event.data.specTemplate) : null,
    }

    if (isNew.value) {
      await $fetch('/api/admin/categories', {
        method: 'POST',
        body: data,
      })
      toast.add({ title: 'Thành công', description: 'Đã tạo danh mục mới', color: 'success' })
    } else {
      await $fetch(`/api/admin/categories/${categoryId.value}`, {
        method: 'PUT',
        body: data,
      })
      toast.add({ title: 'Thành công', description: 'Đã cập nhật danh mục', color: 'success' })
    }

    router.push('/admin/categories')
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Lỗi',
      description: err.data?.message || 'Không thể lưu danh mục',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <UDashboardNavbar :title="isNew ? 'Thêm danh mục' : 'Sửa danh mục'">
      <template #leading>
        <UButton color="neutral" icon="i-heroicons-arrow-left" to="/admin/categories" variant="ghost" />
      </template>
    </UDashboardNavbar>

    <div class="min-h-0 flex-1 overflow-y-auto p-6">
      <UForm :state="state" :validate="validate" class="space-y-6" @error="onError" @submit="onSubmit">
        <!-- Basic Info -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Thông tin cơ bản</h3>
          </template>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Tên danh mục" name="name" required>
              <UInput v-model="state.name" class="w-full" placeholder="Laptop Gaming" />
            </UFormField>

            <UFormField label="Slug" name="slug" required>
              <UInput v-model="state.slug" class="w-full" placeholder="laptop-gaming" @input="onSlugInput" />
              <template #hint>
                <span class="text-xs text-neutral-500">
                  {{
                    isNew && !slugManuallyEdited ? 'Tự động tạo từ tên' : 'Chỉ chứa chữ thường, số và dấu gạch ngang'
                  }}
                </span>
              </template>
            </UFormField>

            <UFormField class="md:col-span-2" label="Danh mục cha" name="parentId">
              <USelect
                v-model="state.parentId"
                :options="parentOptions"
                class="w-full"
                option-label="name"
                option-value="id"
              />
            </UFormField>

            <UFormField class="md:col-span-2" label="Mô tả" name="description">
              <UTextarea v-model="state.description" :rows="3" class="w-full" placeholder="Mô tả ngắn về danh mục..." />
            </UFormField>
          </div>
        </UCard>

        <!-- Display Settings -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Hiển thị</h3>
          </template>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField class="md:col-span-2" label="Hình ảnh (URL)" name="image">
              <UInput v-model="state.image" class="w-full" placeholder="https://example.com/image.jpg" />
            </UFormField>

            <!-- Image Preview -->
            <div v-if="state.image" class="md:col-span-2">
              <p class="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Preview:</p>
              <img :alt="state.name" :src="state.image" class="h-32 w-auto rounded-lg object-cover" />
            </div>

            <UFormField label="Thứ tự hiển thị" name="rank">
              <UInput v-model.number="state.rank" class="w-full" min="0" placeholder="0" type="number" />
              <template #hint>
                <span class="text-xs text-neutral-500">Số nhỏ hơn sẽ hiển thị trước</span>
              </template>
            </UFormField>

            <UFormField class="md:col-span-2" name="isActive">
              <UCheckbox v-model="state.isActive" label="Kích hoạt danh mục" />
            </UFormField>
          </div>
        </UCard>

        <!-- Advanced Settings -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Cấu hình nâng cao</h3>
          </template>

          <UFormField label="Spec Template (JSON)" name="specTemplate">
            <UTextarea
              v-model="state.specTemplate"
              class="w-full font-mono text-sm"
              placeholder='{"cpu": "string", "ram": "string", "storage": "string"}'
              :rows="8"
            />
            <template #hint>
              <span class="text-xs text-neutral-500">Template cho thông số kỹ thuật sản phẩm (JSON format)</span>
            </template>
          </UFormField>
        </UCard>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <UButton color="neutral" label="Hủy" to="/admin/categories" variant="outline" />
          <UButton :label="isNew ? 'Tạo danh mục' : 'Lưu thay đổi'" :loading="loading" type="submit" />
        </div>
      </UForm>
    </div>
  </div>
</template>
