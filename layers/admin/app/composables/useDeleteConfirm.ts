/**
 * Composable for delete confirmation modal
 */
export function useDeleteConfirm<T>() {
  const isOpen = ref(false)
  const itemToDelete = ref<T | null>(null) as Ref<T | null>
  const isDeleting = ref(false)

  function openModal(item: T) {
    itemToDelete.value = item
    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
    itemToDelete.value = null
  }

  async function confirmDelete(deleteFn: () => Promise<void>) {
    if (!itemToDelete.value) return

    isDeleting.value = true
    try {
      await deleteFn()
      closeModal()
    } finally {
      isDeleting.value = false
    }
  }

  return {
    isOpen,
    itemToDelete,
    isDeleting,
    openModal,
    closeModal,
    confirmDelete,
  }
}
