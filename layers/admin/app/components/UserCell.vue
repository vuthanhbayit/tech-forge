<script setup lang="ts">
interface Props {
  firstName?: string | null
  lastName?: string | null
  email: string
  phone?: string | null
  avatar?: string | null
}

const props = defineProps<Props>()

const fullName = computed(() => {
  const parts = [props.firstName, props.lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : props.email
})
</script>

<template>
  <div class="flex items-center gap-3">
    <UAvatar :alt="fullName" :src="avatar ?? undefined" size="sm" />
    <div>
      <div class="font-medium">{{ fullName }}</div>
      <div class="text-muted text-sm">{{ email }}</div>
      <div v-if="phone" class="text-muted text-xs">{{ phone }}</div>
    </div>
  </div>
</template>
