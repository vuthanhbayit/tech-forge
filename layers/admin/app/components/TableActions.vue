<script setup lang="ts">
interface Props {
  editLink?: string
  deleteDisabled?: boolean
  deleteLoading?: boolean
  showEdit?: boolean
  showDelete?: boolean
}

withDefaults(defineProps<Props>(), {
  editLink: undefined,
  deleteDisabled: false,
  deleteLoading: false,
  showEdit: true,
  showDelete: true,
})

const emit = defineEmits<{
  delete: []
}>()
</script>

<template>
  <div class="flex justify-end gap-2">
    <UButton
      v-if="showEdit && editLink"
      :to="editLink"
      color="neutral"
      icon="i-heroicons-pencil-square"
      size="xs"
      variant="ghost"
    />
    <UButton
      v-if="showDelete"
      :disabled="deleteDisabled"
      :loading="deleteLoading"
      color="error"
      icon="i-heroicons-trash"
      size="xs"
      variant="ghost"
      @click="emit('delete')"
    />
  </div>
</template>
