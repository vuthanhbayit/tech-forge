<script setup lang="ts">
interface Props {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
}

withDefaults(defineProps<Props>(), {
  activeLabel: 'Hoạt động',
  inactiveLabel: 'Vô hiệu hóa',
})
</script>

<template>
  <UBadge :color="active ? 'success' : 'neutral'" variant="subtle">
    {{ active ? activeLabel : inactiveLabel }}
  </UBadge>
</template>
