<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Cài đặt - TechForge Admin',
})

interface Setting {
  id: string
  key: string
  value: unknown
  group: string | null
  isPublic: boolean
}

const toast = useToast()

// Fetch settings grouped
const { data: settingsGrouped, refresh } = await useFetch<Record<string, Setting[]>>('/api/admin/settings', {
  query: { grouped: true },
})

// Edit modal
const editModalOpen = ref(false)
const editingSetting = ref<Setting | null>(null)
const editValue = ref('')
const editIsPublic = ref(false)
const saving = ref(false)

function openEdit(setting: Setting) {
  editingSetting.value = setting
  editValue.value = typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value, null, 2)
  editIsPublic.value = setting.isPublic
  editModalOpen.value = true
}

async function saveSetting() {
  if (!editingSetting.value) return

  saving.value = true
  try {
    let parsedValue: unknown = editValue.value
    // Try to parse as JSON
    try {
      parsedValue = JSON.parse(editValue.value)
    } catch {
      // Keep as string if not valid JSON
    }

    await $fetch(`/api/admin/settings/${editingSetting.value.key}`, {
      method: 'PUT',
      body: {
        value: parsedValue,
        isPublic: editIsPublic.value,
      },
    })

    toast.add({ title: 'Thành công', description: 'Đã lưu cài đặt', color: 'success' })
    editModalOpen.value = false
    refresh()
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Lỗi',
      description: err.data?.message || 'Không thể lưu cài đặt',
      color: 'error',
    })
  } finally {
    saving.value = false
  }
}

// Add new setting
const addModalOpen = ref(false)
const newSetting = reactive({
  key: '',
  value: '',
  group: '',
  isPublic: false,
})

async function addSetting() {
  if (!newSetting.key.trim()) {
    toast.add({ title: 'Lỗi', description: 'Key là bắt buộc', color: 'error' })
    return
  }

  saving.value = true
  try {
    let parsedValue: unknown = newSetting.value
    try {
      parsedValue = JSON.parse(newSetting.value)
    } catch {
      // Keep as string
    }

    await $fetch(`/api/admin/settings/${newSetting.key}`, {
      method: 'PUT',
      body: {
        value: parsedValue,
        group: newSetting.group || null,
        isPublic: newSetting.isPublic,
      },
    })

    toast.add({ title: 'Thành công', description: 'Đã thêm cài đặt', color: 'success' })
    addModalOpen.value = false
    newSetting.key = ''
    newSetting.value = ''
    newSetting.group = ''
    newSetting.isPublic = false
    refresh()
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Lỗi',
      description: err.data?.message || 'Không thể thêm cài đặt',
      color: 'error',
    })
  } finally {
    saving.value = false
  }
}

// Delete setting
async function deleteSetting(setting: Setting) {
  if (!confirm(`Bạn có chắc muốn xóa cài đặt "${setting.key}"?`)) return

  try {
    await $fetch(`/api/admin/settings/${setting.key}`, { method: 'DELETE' })
    toast.add({ title: 'Thành công', description: 'Đã xóa cài đặt', color: 'success' })
    refresh()
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Lỗi',
      description: err.data?.message || 'Không thể xóa cài đặt',
      color: 'error',
    })
  }
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <UDashboardNavbar title="Cài đặt">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #right>
        <UButton label="Thêm cài đặt" icon="i-heroicons-plus" @click="addModalOpen = true" />
      </template>
    </UDashboardNavbar>

    <div class="min-h-0 flex-1 overflow-y-auto p-6">
      <div class="space-y-6">
        <UCard v-for="(settings, group) in settingsGrouped" :key="group">
          <template #header>
            <h3 class="font-semibold capitalize">{{ group }}</h3>
          </template>

          <div class="divide-y">
            <div v-for="setting in settings" :key="setting.id" class="flex items-center justify-between py-3">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ setting.key }}</span>
                  <UBadge v-if="setting.isPublic" label="Public" color="success" variant="subtle" size="xs" />
                </div>
                <p class="text-muted mt-1 truncate text-sm">{{ formatValue(setting.value) }}</p>
              </div>
              <div class="flex gap-2">
                <UButton
                  icon="i-heroicons-pencil-square"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  @click="openEdit(setting)"
                />
                <UButton
                  icon="i-heroicons-trash"
                  color="error"
                  variant="ghost"
                  size="sm"
                  @click="deleteSetting(setting)"
                />
              </div>
            </div>
          </div>
        </UCard>

        <UCard v-if="!settingsGrouped || Object.keys(settingsGrouped).length === 0">
          <div class="py-8 text-center">
            <UIcon name="i-heroicons-cog-6-tooth" class="text-muted mx-auto size-12" />
            <p class="text-muted mt-2">Chưa có cài đặt nào</p>
            <UButton label="Thêm cài đặt đầu tiên" class="mt-4" @click="addModalOpen = true" />
          </div>
        </UCard>
      </div>
    </div>

    <!-- Edit Modal -->
    <UModal v-model:open="editModalOpen" title="Sửa cài đặt">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Key">
            <UInput :model-value="editingSetting?.key" disabled class="w-full" />
          </UFormField>
          <UFormField label="Value">
            <UTextarea v-model="editValue" :rows="5" class="w-full font-mono text-sm" />
          </UFormField>
          <UCheckbox v-model="editIsPublic" label="Cho phép truy cập từ frontend (Public)" />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton label="Hủy" color="neutral" variant="outline" @click="editModalOpen = false" />
          <UButton label="Lưu" :loading="saving" @click="saveSetting" />
        </div>
      </template>
    </UModal>

    <!-- Add Modal -->
    <UModal v-model:open="addModalOpen" title="Thêm cài đặt">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Key" required>
            <UInput v-model="newSetting.key" placeholder="site_name" class="w-full" />
          </UFormField>
          <UFormField label="Group">
            <UInput v-model="newSetting.group" placeholder="general" class="w-full" />
          </UFormField>
          <UFormField label="Value">
            <UTextarea v-model="newSetting.value" :rows="5" class="w-full font-mono text-sm" placeholder="Value (string hoặc JSON)" />
          </UFormField>
          <UCheckbox v-model="newSetting.isPublic" label="Cho phép truy cập từ frontend (Public)" />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton label="Hủy" color="neutral" variant="outline" @click="addModalOpen = false" />
          <UButton label="Thêm" :loading="saving" @click="addSetting" />
        </div>
      </template>
    </UModal>
  </div>
</template>
