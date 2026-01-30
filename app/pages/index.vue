<script setup lang="ts">
useSeoMeta({
  title: 'TechForge - Máy tính & Phụ kiện công nghệ',
  description: 'Chuyên cung cấp máy tính, linh kiện và phụ kiện công nghệ chính hãng tại Việt Nam',
})
</script>

<template>
  <UContainer>
    <!-- Hero Section -->
    <section class="py-16 text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">Xây dựng PC trong mơ của bạn</h1>
      <p class="text-muted mt-6 text-lg">
        Chuyên cung cấp máy tính, linh kiện và phụ kiện công nghệ chính hãng. Tư vấn miễn phí, bảo hành tận tâm.
      </p>
      <div class="mt-10 flex items-center justify-center gap-4">
        <UButton label="Xem sản phẩm" size="lg" to="/products" />
        <UButton label="Tư vấn miễn phí" size="lg" color="neutral" variant="outline" />
      </div>
    </section>

    <!-- Categories -->
    <section class="py-12">
      <h2 class="mb-8 text-2xl font-bold">Danh mục sản phẩm</h2>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <UCard v-for="i in 4" :key="i" class="text-center transition-shadow hover:shadow-lg">
          <template #header>
            <div class="flex justify-center py-4">
              <UIcon name="i-heroicons-computer-desktop" class="text-primary size-12" />
            </div>
          </template>
          <p class="font-medium">Danh mục {{ i }}</p>
        </UCard>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-12">
      <h2 class="mb-8 text-2xl font-bold">Sản phẩm nổi bật</h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        <UCard v-for="i in 8" :key="i" class="transition-shadow hover:shadow-lg">
          <template #header>
            <div class="bg-muted aspect-square rounded-t-lg" />
          </template>
          <p class="font-medium">Sản phẩm {{ i }}</p>
          <p class="text-muted text-sm">Mô tả ngắn sản phẩm</p>
          <template #footer>
            <div class="flex items-center justify-between">
              <span class="text-primary text-lg font-bold">{{ (i * 1000000).toLocaleString('vi-VN') }}đ</span>
              <UButton icon="i-heroicons-shopping-cart" size="sm" />
            </div>
          </template>
        </UCard>
      </div>
    </section>
  </UContainer>
</template>
