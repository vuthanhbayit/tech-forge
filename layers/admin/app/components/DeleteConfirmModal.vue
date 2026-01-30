<script setup lang="ts">
interface Props {
  open: boolean
  title?: string
  description?: string
  itemName?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Xác nhận xóa',
  description: '',
  itemName: '',
  loading: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ title }}</h3>
        </template>

        <p v-if="itemName">
          Bạn có chắc muốn xóa
          <strong>{{ itemName }}</strong>
          ?
        </p>
        <p v-if="description" class="text-muted mt-2 text-sm">{{ description }}</p>
        <slot />

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="neutral" label="Hủy" variant="outline" @click="isOpen = false" />
            <UButton :loading="loading" color="error" label="Xóa" @click="emit('confirm')" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
