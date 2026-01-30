<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Category } from '#shared/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Quản lý Danh mục - TechForge Admin',
})

const { data: categories, refresh, status } = await useFetch<Category[]>('/api/admin/categories')

const columns: TableColumn<Category>[] = [
  { accessorKey: 'image', header: '' },
  { accessorKey: 'name', header: 'Tên danh mục' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'parent.name', header: 'Danh mục cha' },
  { accessorKey: '_count.products', header: 'Sản phẩm' },
  { accessorKey: '_count.children', header: 'Danh mục con' },
  { accessorKey: 'isActive', header: 'Trạng thái' },
  { accessorKey: 'actions', header: '' },
]

// Delete category
const toast = useToast()
const deleteLoading = ref<string | null>(null)

async function deleteCategory(category: Category) {
  if (category._count.children > 0) {
    toast.add({
      title: 'Lỗi',
      description: `Không thể xóa danh mục có ${category._count.children} danh mục con`,
      color: 'error',
    })
    return
  }

  if (category._count.products > 0) {
    toast.add({
      title: 'Lỗi',
      description: `Không thể xóa danh mục có ${category._count.products} sản phẩm`,
      color: 'error',
    })
    return
  }

  if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) return

  deleteLoading.value = category.id
  try {
    await $fetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' })
    toast.add({ title: 'Thành công', description: 'Đã xóa danh mục', color: 'success' })
    refresh()
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Lỗi',
      description: err.data?.message || 'Không thể xóa danh mục',
      color: 'error',
    })
  } finally {
    deleteLoading.value = null
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <UDashboardNavbar title="Quản lý Danh mục">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #right>
        <UButton label="Thêm danh mục" icon="i-heroicons-plus" to="/admin/categories/new" />
      </template>
    </UDashboardNavbar>

    <div class="min-h-0 flex-1 overflow-y-auto p-6">
      <UCard>
        <UTable :columns="columns" :data="categories || []" :loading="status === 'pending'">
          <template #cell-image="{ row }">
            <div class="flex items-center">
              <img
                v-if="row.original.image"
                :src="row.original.image"
                :alt="row.original.name"
                class="size-10 rounded object-cover"
              />
              <div v-else class="size-10 rounded bg-neutral-100 dark:bg-neutral-800" />
            </div>
          </template>

          <template #cell-name="{ row }">
            <div class="font-medium">{{ row.original.name }}</div>
            <div v-if="row.original.description" class="line-clamp-1 text-sm text-neutral-500">
              {{ row.original.description }}
            </div>
          </template>

          <template #cell-parent.name="{ row }">
            <span v-if="row.original.parent" class="text-sm text-neutral-600 dark:text-neutral-400">
              {{ row.original.parent.name }}
            </span>
            <span v-else class="text-sm text-neutral-400">—</span>
          </template>

          <template #cell-_count.products="{ row }">
            <span class="text-sm">{{ row.original._count.products }}</span>
          </template>

          <template #cell-_count.children="{ row }">
            <span class="text-sm">{{ row.original._count.children }}</span>
          </template>

          <template #cell-isActive="{ row }">
            <UBadge
              :label="row.original.isActive ? 'Hoạt động' : 'Tắt'"
              :color="row.original.isActive ? 'success' : 'neutral'"
              variant="subtle"
            />
          </template>

          <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
              <UButton
                icon="i-heroicons-pencil-square"
                color="neutral"
                variant="ghost"
                size="sm"
                :to="`/admin/categories/${row.original.id}`"
              />
              <UButton
                icon="i-heroicons-trash"
                color="error"
                variant="ghost"
                size="sm"
                :disabled="row.original._count.children > 0 || row.original._count.products > 0"
                :loading="deleteLoading === row.original.id"
                @click="deleteCategory(row.original)"
              />
            </div>
          </template>
        </UTable>
      </UCard>
    </div>
  </div>
</template>
