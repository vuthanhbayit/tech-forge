<script setup lang="ts">
interface Props {
  title: string
  addLabel?: string
  addLink?: string
}

withDefaults(defineProps<Props>(), {
  addLabel: undefined,
  addLink: undefined,
})
</script>

<template>
  <UDashboardNavbar :title="title">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>
    <template v-if="addLabel && addLink" #right>
      <UButton :label="addLabel" :to="addLink" icon="i-heroicons-plus" />
    </template>
  </UDashboardNavbar>
</template>
