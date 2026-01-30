<script lang="ts" setup>
import type { MediaListResponse, MediaItem, MediaFolderBreadcrumb } from '#shared/types'
import { bytesToSize } from '@vt7/utils'

const props = defineProps<{
  open: boolean
  multiple?: boolean
  accept?: 'image' | 'video' | 'document' | 'all'
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  select: [items: MediaItem[]]
}>()

const toast = useToast()

// Current folder state
const currentFolderId = ref<string | null>(null)
const searchQuery = ref('')
const searchDebounced = refDebounced(searchQuery, 300)
const selectedItems = ref<MediaItem[]>([])

// Reset state when modal opens
watch(
  () => props.open,
  open => {
    if (open) {
      currentFolderId.value = null
      searchQuery.value = ''
      selectedItems.value = []
    }
  },
)

// Fetch media data
const { data: mediaData, status } = await useFetch<MediaListResponse>('/api/admin/media', {
  query: computed(() => ({
    folderId: currentFolderId.value,
    search: searchDebounced.value || undefined,
  })),
})

const items = computed(() => mediaData.value?.items || [])
const breadcrumbs = computed(() => mediaData.value?.breadcrumbs || [])

// Filter items based on accept prop
const filteredItems = computed(() => {
  if (!props.accept || props.accept === 'all') return items.value

  return items.value.filter(item => {
    if (item.type === 'folder') return true
    const mimeType = item.mimeType || ''
    switch (props.accept) {
      case 'image':
        return mimeType.startsWith('image/')
      case 'video':
        return mimeType.startsWith('video/')
      case 'document':
        return !mimeType.startsWith('image/') && !mimeType.startsWith('video/')
      default:
        return true
    }
  })
})

// Navigate to folder
function navigateToFolder(folderId: string | null) {
  currentFolderId.value = folderId
  searchQuery.value = ''
}

// Toggle item selection
function toggleSelect(item: MediaItem) {
  if (item.type === 'folder') {
    navigateToFolder(item.id)
    return
  }

  const index = selectedItems.value.findIndex(i => i.id === item.id)
  if (index >= 0) {
    selectedItems.value.splice(index, 1)
  } else {
    if (props.multiple) {
      selectedItems.value.push(item)
    } else {
      selectedItems.value = [item]
    }
  }
}

function isSelected(item: MediaItem): boolean {
  return selectedItems.value.some(i => i.id === item.id)
}

// Confirm selection
function confirmSelection() {
  emit('select', selectedItems.value)
  emit('update:open', false)
}

// Format helpers
function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

function getFileIcon(mimeType: string): string {
  if (isImage(mimeType)) return 'i-heroicons-photo'
  if (mimeType.startsWith('video/')) return 'i-heroicons-video-camera'
  if (mimeType.includes('pdf')) return 'i-heroicons-document-text'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'i-heroicons-document'
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'i-heroicons-table-cells'
  return 'i-heroicons-document'
}
</script>

<template>
  <UModal :open="open" :ui="{ content: 'max-w-4xl' }" @update:open="emit('update:open', $event)">
    <template #header>
      <div class="flex w-full items-center justify-between">
        <span class="font-semibold">Chọn Media</span>
        <UInput
          v-model="searchQuery"
          class="w-48"
          icon="i-heroicons-magnifying-glass"
          placeholder="Tìm kiếm..."
          size="sm"
        />
      </div>
    </template>

    <template #body>
      <!-- Breadcrumbs -->
      <div class="mb-4 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800/50">
        <nav class="flex items-center gap-1 text-sm">
          <UButton
            :variant="currentFolderId ? 'ghost' : 'soft'"
            class="px-2"
            color="neutral"
            size="xs"
            @click="navigateToFolder(null)"
          >
            <UIcon class="size-4" name="i-heroicons-home" />
            <span class="ml-1">Root</span>
          </UButton>
          <template v-for="crumb in breadcrumbs" :key="crumb.id">
            <UIcon class="size-4 text-neutral-400" name="i-heroicons-chevron-right" />
            <UButton
              :variant="crumb.id === currentFolderId ? 'soft' : 'ghost'"
              class="px-2"
              color="neutral"
              size="xs"
              @click="navigateToFolder(crumb.id)"
            >
              {{ crumb.name }}
            </UButton>
          </template>
        </nav>
      </div>

      <!-- Content -->
      <div class="h-[400px] overflow-y-auto">
        <!-- Loading -->
        <div v-if="status === 'pending'" class="flex items-center justify-center py-12">
          <UIcon class="size-8 animate-spin text-neutral-400" name="i-heroicons-arrow-path" />
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredItems.length === 0" class="flex flex-col items-center justify-center py-12">
          <UIcon class="size-16 text-neutral-300" name="i-heroicons-folder-open" />
          <p class="mt-4 text-neutral-500">
            {{ searchQuery ? 'Không tìm thấy file nào' : 'Folder trống' }}
          </p>
        </div>

        <!-- Grid view -->
        <div v-else class="grid grid-cols-4 gap-3 p-1 sm:grid-cols-5 md:grid-cols-6">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            :class="[
              'relative flex cursor-pointer flex-col items-center rounded-xl p-3 transition-all',
              isSelected(item)
                ? 'bg-primary-100 ring-primary-500 dark:bg-primary-900/30 ring-2'
                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/50 dark:hover:bg-neutral-800',
            ]"
            @click="toggleSelect(item)"
          >
            <!-- Selection indicator -->
            <div
              v-if="item.type === 'file'"
              :class="[
                'absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full',
                isSelected(item)
                  ? 'bg-primary-500'
                  : 'border-2 border-neutral-300 bg-white dark:border-neutral-500 dark:bg-neutral-700',
              ]"
            >
              <UIcon v-if="isSelected(item)" class="size-3 text-white" name="i-heroicons-check" />
            </div>

            <!-- Folder -->
            <template v-if="item.type === 'folder'">
              <UIcon class="size-12 text-amber-400" name="i-heroicons-folder-solid" />
              <p class="mt-1 w-full truncate text-center text-xs font-medium">{{ item.name }}</p>
            </template>

            <!-- File -->
            <template v-else>
              <div
                v-if="item.thumbnailUrl"
                class="relative flex h-12 w-full items-center justify-center overflow-hidden rounded-lg"
              >
                <img :alt="item.name" :src="item.thumbnailUrl" class="h-full w-full rounded-lg object-contain" />
              </div>
              <UIcon v-else :name="getFileIcon(item.mimeType!)" class="size-12 text-neutral-400" />
              <p class="mt-1 w-full truncate text-center text-xs font-medium">{{ item.name }}</p>
              <p class="text-[10px] text-neutral-500">{{ bytesToSize(item.size!) }}</p>
            </template>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between">
        <span v-if="selectedItems.length > 0" class="text-sm text-neutral-600 dark:text-neutral-400">
          Đã chọn {{ selectedItems.length }} file
        </span>
        <span v-else class="text-sm text-neutral-400">Chưa chọn file nào</span>

        <div class="flex gap-2">
          <UButton color="neutral" label="Hủy" variant="ghost" @click="emit('update:open', false)" />
          <UButton :disabled="selectedItems.length === 0" label="Chọn" @click="confirmSelection" />
        </div>
      </div>
    </template>
  </UModal>
</template>
