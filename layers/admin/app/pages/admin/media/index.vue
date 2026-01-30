<script lang="ts" setup>
import type { MediaListResponse, MediaItem, MediaFolderBreadcrumb } from '#shared/types'
import { bytesToSize } from '@vt7/utils'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Quản lý Media - TechForge Admin',
})

const toast = useToast()
const { handleError, showSuccess } = useApiError()
const { formatDate } = useFormatters()

// Current folder state
const currentFolderId = ref<string | null>(null)
const searchQuery = ref('')
const searchDebounced = refDebounced(searchQuery, 300)

// Fetch media data
const {
  data: mediaData,
  refresh,
  status,
} = await useFetch<MediaListResponse>('/api/admin/media', {
  query: computed(() => ({
    folderId: currentFolderId.value,
    search: searchDebounced.value || undefined,
  })),
})

const items = computed(() => mediaData.value?.items || [])
const breadcrumbs = computed(() => mediaData.value?.breadcrumbs || [])

// Navigate to folder
function navigateToFolder(folderId: string | null) {
  currentFolderId.value = folderId
  searchQuery.value = ''
}

// Create folder modal
const showCreateFolderModal = ref(false)
const newFolderName = ref('')
const isCreatingFolder = ref(false)

async function createFolder() {
  if (!newFolderName.value.trim()) return

  isCreatingFolder.value = true
  try {
    await $fetch('/api/admin/media/folders', {
      method: 'POST',
      body: {
        name: newFolderName.value.trim(),
        parentId: currentFolderId.value,
      },
    })
    showSuccess('Đã tạo folder')
    newFolderName.value = ''
    showCreateFolderModal.value = false
    refresh()
  } catch (error) {
    handleError(error, 'Không thể tạo folder')
  } finally {
    isCreatingFolder.value = false
  }
}

// Upload modal
const showUploadModal = ref(false)
const uploadFiles = ref<File[]>([])
const isUploading = ref(false)

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    uploadFiles.value = Array.from(input.files)
  }
}

async function uploadSelectedFiles() {
  if (uploadFiles.value.length === 0) return

  isUploading.value = true
  try {
    const formData = new FormData()
    for (const file of uploadFiles.value) {
      formData.append('file', file)
    }
    if (currentFolderId.value) {
      formData.append('folderId', currentFolderId.value)
    }

    await $fetch('/api/admin/media/upload', {
      method: 'POST',
      body: formData,
    })

    showSuccess(`Đã upload ${uploadFiles.value.length} file`)
    uploadFiles.value = []
    showUploadModal.value = false
    refresh()
  } catch (error) {
    handleError(error, 'Không thể upload file')
  } finally {
    isUploading.value = false
  }
}

// Delete confirmation
const {
  isOpen: deleteModal,
  itemToDelete,
  isDeleting,
  openModal: openDeleteModal,
  confirmDelete,
} = useDeleteConfirm<MediaItem>()

// Media in use warning
interface MediaUsage {
  type: string
  id: string
  name: string
}
const showInUseModal = ref(false)
const mediaUsages = ref<MediaUsage[]>([])
const isDeletingForce = ref(false)

async function handleDelete() {
  await confirmDelete(async () => {
    const item = itemToDelete.value!
    if (item.type === 'folder') {
      await $fetch(`/api/admin/media/folders/${item.id}?force=true`, { method: 'DELETE' })
      showSuccess('Đã xóa folder')
    } else {
      try {
        await $fetch(`/api/admin/media/${item.id}`, { method: 'DELETE' })
        showSuccess('Đã xóa file')
      } catch (error: unknown) {
        const err = error as { data?: { code?: string; usages?: MediaUsage[] } }
        if (err.data?.code === 'MEDIA_IN_USE') {
          mediaUsages.value = err.data.usages || []
          showInUseModal.value = true
          throw error // Re-throw to prevent closing delete modal
        }
        throw error
      }
    }
    refresh()
  })
}

async function forceDeleteMedia() {
  if (!itemToDelete.value) return

  isDeletingForce.value = true
  try {
    await $fetch(`/api/admin/media/${itemToDelete.value.id}?force=true`, { method: 'DELETE' })
    showSuccess('Đã xóa file')
    showInUseModal.value = false
    refresh()
  } catch (error) {
    handleError(error, 'Không thể xóa file')
  } finally {
    isDeletingForce.value = false
  }
}

// Rename folder modal
const showRenameFolderModal = ref(false)
const folderToRename = ref<MediaItem | null>(null)
const newName = ref('')
const isRenaming = ref(false)

function openRenameModal(item: MediaItem) {
  folderToRename.value = item
  newName.value = item.name
  showRenameFolderModal.value = true
}

async function renameFolder() {
  if (!newName.value.trim() || !folderToRename.value) return

  isRenaming.value = true
  try {
    await $fetch(`/api/admin/media/folders/${folderToRename.value.id}`, {
      method: 'PUT',
      body: { name: newName.value.trim() },
    })
    showSuccess('Đã đổi tên folder')
    showRenameFolderModal.value = false
    refresh()
  } catch (error) {
    handleError(error, 'Không thể đổi tên folder')
  } finally {
    isRenaming.value = false
  }
}

// Preview modal
const showPreviewModal = ref(false)
const previewItem = ref<MediaItem | null>(null)

function openPreview(item: MediaItem) {
  if (item.type === 'file') {
    previewItem.value = item
    showPreviewModal.value = true
  }
}

// Format helpers
function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

function isVideo(mimeType: string): boolean {
  return mimeType.startsWith('video/')
}

function getFileIcon(mimeType: string): string {
  if (isImage(mimeType)) return 'i-heroicons-photo'
  if (isVideo(mimeType)) return 'i-heroicons-video-camera'
  if (mimeType.includes('pdf')) return 'i-heroicons-document-text'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'i-heroicons-document'
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'i-heroicons-table-cells'
  return 'i-heroicons-document'
}

// Copy URL
async function copyUrl(url: string) {
  await navigator.clipboard.writeText(url)
  toast.add({ title: 'Đã copy URL', color: 'success' })
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <!-- Header -->
    <UDashboardNavbar title="Quản lý Media">
      <template #right>
        <div class="flex items-center gap-2">
          <UInput
            v-model="searchQuery"
            class="w-64"
            icon="i-heroicons-magnifying-glass"
            placeholder="Tìm kiếm file..."
          />
          <UButton
            icon="i-heroicons-folder-plus"
            label="Tạo folder"
            variant="outline"
            @click="showCreateFolderModal = true"
          />
          <UButton icon="i-heroicons-arrow-up-tray" label="Upload" @click="showUploadModal = true" />
        </div>
      </template>
    </UDashboardNavbar>

    <!-- Breadcrumbs -->
    <div class="bg-neutral-50/80 px-6 py-3 dark:bg-neutral-900/50">
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
    <div class="min-h-0 flex-1 overflow-y-auto p-6">
      <!-- Loading -->
      <div v-if="status === 'pending'" class="flex items-center justify-center py-12">
        <UIcon class="size-8 animate-spin text-neutral-400" name="i-heroicons-arrow-path" />
      </div>

      <!-- Empty state -->
      <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center py-12">
        <UIcon class="size-16 text-neutral-300" name="i-heroicons-folder-open" />
        <p class="mt-4 text-neutral-500">
          {{ searchQuery ? 'Không tìm thấy file nào' : 'Folder trống' }}
        </p>
        <UButton v-if="!searchQuery" class="mt-4" variant="outline" @click="showUploadModal = true">
          Upload file đầu tiên
        </UButton>
      </div>

      <!-- Grid view -->
      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
        <div
          v-for="item in items"
          :key="item.id"
          class="group relative cursor-pointer rounded-xl bg-neutral-50 p-3 transition-all hover:bg-neutral-100 hover:shadow-sm dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
          @dblclick="item.type === 'folder' ? navigateToFolder(item.id) : openPreview(item)"
        >
          <!-- Folder -->
          <template v-if="item.type === 'folder'">
            <div class="flex aspect-square items-center justify-center">
              <UIcon class="size-14 text-amber-400" name="i-heroicons-folder-solid" />
            </div>
            <p class="mt-1 truncate text-center text-sm font-medium">{{ item.name }}</p>
            <p class="text-center text-xs text-neutral-400">{{ item._count?.files || 0 }} file</p>
          </template>

          <!-- File -->
          <template v-else>
            <!-- Thumbnail for images -->
            <div
              class="flex aspect-square items-center justify-center overflow-hidden rounded-lg dark:bg-neutral-700/50"
            >
              <img
                v-if="item.thumbnailUrl"
                :alt="item.name"
                :src="item.thumbnailUrl"
                class="h-full w-full object-cover"
              />
              <UIcon v-else :name="getFileIcon(item.mimeType!)" class="size-10 text-neutral-400" />
            </div>

            <p class="mt-2 truncate text-center text-xs font-medium">{{ item.name }}</p>
            <p class="text-center text-[10px] text-neutral-400">{{ bytesToSize(item.size!) }}</p>
          </template>

          <!-- Actions dropdown -->
          <div class="absolute top-1.5 right-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <UDropdownMenu
              :items="[
                item.type === 'folder'
                  ? [
                      { label: 'Mở', icon: 'i-heroicons-folder-open', onSelect: () => navigateToFolder(item.id) },
                      { label: 'Đổi tên', icon: 'i-heroicons-pencil', onSelect: () => openRenameModal(item) },
                      { label: 'Xóa', icon: 'i-heroicons-trash', onSelect: () => openDeleteModal(item) },
                    ]
                  : [
                      { label: 'Xem', icon: 'i-heroicons-eye', onSelect: () => openPreview(item) },
                      { label: 'Copy URL', icon: 'i-heroicons-clipboard', onSelect: () => copyUrl(item.url!) },
                      { label: 'Xóa', icon: 'i-heroicons-trash', onSelect: () => openDeleteModal(item) },
                    ],
              ]"
            >
              <UButton
                class="bg-white/80 backdrop-blur dark:bg-neutral-900/80"
                color="neutral"
                icon="i-heroicons-ellipsis-horizontal"
                size="xs"
                variant="ghost"
              />
            </UDropdownMenu>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Folder Modal -->
    <UModal v-model:open="showCreateFolderModal" title="Tạo folder mới">
      <template #body>
        <UFormField label="Tên folder" required>
          <UInput v-model="newFolderName" class="w-full" placeholder="Nhập tên folder..." />
        </UFormField>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" label="Hủy" variant="ghost" @click="showCreateFolderModal = false" />
          <UButton
            :disabled="!newFolderName.trim()"
            :loading="isCreatingFolder"
            label="Tạo folder"
            @click="createFolder"
          />
        </div>
      </template>
    </UModal>

    <!-- Upload Modal -->
    <UModal v-model:open="showUploadModal" title="Upload file">
      <template #body>
        <div class="space-y-4">
          <div
            class="hover:border-primary-400 hover:bg-primary-50/50 dark:hover:border-primary-500 dark:hover:bg-primary-900/20 flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 transition-colors dark:border-neutral-600 dark:bg-neutral-800/50"
            @dragover.prevent
            @drop.prevent="
              e => {
                if (e.dataTransfer?.files) uploadFiles = Array.from(e.dataTransfer.files)
              }
            "
          >
            <div class="bg-primary-100 dark:bg-primary-900/50 rounded-full p-3">
              <UIcon class="text-primary-500 size-8" name="i-heroicons-cloud-arrow-up" />
            </div>
            <p class="mt-3 font-medium text-neutral-700 dark:text-neutral-300">Kéo thả file vào đây</p>
            <p class="text-sm text-neutral-500">hoặc</p>
            <label class="mt-2 cursor-pointer">
              <input
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                class="hidden"
                multiple
                type="file"
                @change="handleFileSelect"
              />
              <UButton as="span" size="sm">Chọn file</UButton>
            </label>
            <p class="mt-3 text-xs text-neutral-400">JPG, PNG, WebP, GIF, MP4, WebM, PDF, DOC, XLS</p>
          </div>

          <!-- Selected files -->
          <div v-if="uploadFiles.length > 0">
            <p class="mb-2 text-sm font-medium">{{ uploadFiles.length }} file đã chọn</p>
            <div class="max-h-32 space-y-1 overflow-y-auto">
              <div
                v-for="(file, index) in uploadFiles"
                :key="index"
                class="flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800"
              >
                <span class="truncate">{{ file.name }}</span>
                <span class="ml-2 shrink-0 text-xs text-neutral-400">{{ bytesToSize(file.size) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            label="Hủy"
            variant="ghost"
            @click="
              () => {
                showUploadModal = false
                uploadFiles = []
              }
            "
          />
          <UButton
            :disabled="uploadFiles.length === 0"
            :loading="isUploading"
            label="Upload"
            @click="uploadSelectedFiles"
          />
        </div>
      </template>
    </UModal>

    <!-- Rename Folder Modal -->
    <UModal v-model:open="showRenameFolderModal" title="Đổi tên folder">
      <template #body>
        <UFormField label="Tên mới" required>
          <UInput v-model="newName" class="w-full" />
        </UFormField>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" label="Hủy" variant="ghost" @click="showRenameFolderModal = false" />
          <UButton :disabled="!newName.trim()" :loading="isRenaming" label="Lưu" @click="renameFolder" />
        </div>
      </template>
    </UModal>

    <!-- Preview Modal -->
    <UModal v-model:open="showPreviewModal" :title="previewItem?.name || 'Preview'" :ui="{ content: 'max-w-4xl' }">
      <template #body>
        <div v-if="previewItem" class="space-y-4">
          <div class="flex flex-col items-center">
            <img
              v-if="isImage(previewItem.mimeType!)"
              :alt="previewItem.name"
              :src="previewItem.url"
              class="max-h-[60vh] rounded-lg object-contain"
            />
            <video
              v-else-if="isVideo(previewItem.mimeType!)"
              :src="previewItem.url"
              class="max-h-[60vh] rounded-lg"
              controls
            />
            <div v-else class="py-8 text-center">
              <UIcon :name="getFileIcon(previewItem.mimeType!)" class="size-24 text-neutral-400" />
              <p class="mt-4 text-neutral-600 dark:text-neutral-400">Không thể xem trước file này</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-800/50">
            <div>
              <span class="text-neutral-500 dark:text-neutral-400">Kích thước:</span>
              <span class="ml-2 font-medium">{{ bytesToSize(previewItem.size!) }}</span>
            </div>
            <div v-if="previewItem.width && previewItem.height">
              <span class="text-neutral-500 dark:text-neutral-400">Kích thước ảnh:</span>
              <span class="ml-2 font-medium">{{ previewItem.width }} × {{ previewItem.height }}</span>
            </div>
            <div>
              <span class="text-neutral-500 dark:text-neutral-400">Loại file:</span>
              <span class="ml-2 font-medium">{{ previewItem.mimeType }}</span>
            </div>
            <div>
              <span class="text-neutral-500 dark:text-neutral-400">Ngày upload:</span>
              <span class="ml-2 font-medium">{{ formatDate(previewItem.createdAt) }}</span>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div v-if="previewItem" class="flex justify-end gap-2">
          <UButton
            color="neutral"
            icon="i-heroicons-clipboard"
            label="Copy URL"
            variant="outline"
            @click="copyUrl(previewItem!.url!)"
          />
          <UButton :href="previewItem.url" icon="i-heroicons-arrow-down-tray" label="Download" target="_blank" />
        </div>
      </template>
    </UModal>

    <!-- Media In Use Warning Modal -->
    <UModal v-model:open="showInUseModal" title="File đang được sử dụng">
      <template #header>
        <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <UIcon class="size-5" name="i-heroicons-exclamation-triangle" />
          <span class="font-semibold">File đang được sử dụng</span>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-neutral-600 dark:text-neutral-400">File này đang được sử dụng tại các vị trí sau:</p>
          <ul class="max-h-48 space-y-2 overflow-y-auto">
            <li
              v-for="usage in mediaUsages"
              :key="usage.id"
              class="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2.5 text-sm dark:bg-neutral-800/70"
            >
              <span class="font-medium text-neutral-500 dark:text-neutral-400">{{ usage.type }}:</span>
              <span>{{ usage.name }}</span>
            </li>
          </ul>
          <div class="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            <UIcon class="mr-1.5 inline-block size-4" name="i-heroicons-exclamation-triangle" />
            Nếu xóa, các vị trí trên sẽ bị mất ảnh. Bạn có chắc muốn tiếp tục?
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" label="Hủy" variant="ghost" @click="showInUseModal = false" />
          <UButton :loading="isDeletingForce" color="error" label="Xóa anyway" @click="forceDeleteMedia" />
        </div>
      </template>
    </UModal>

    <!-- Delete Modal -->
    <DeleteConfirmModal
      v-model:open="deleteModal"
      :description="
        itemToDelete?.type === 'folder'
          ? 'Folder và tất cả nội dung bên trong sẽ bị xóa vĩnh viễn.'
          : 'File sẽ bị xóa vĩnh viễn.'
      "
      :item-name="itemToDelete?.name"
      :loading="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>
