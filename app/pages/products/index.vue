<script setup lang="ts">
useSeoMeta({
  title: 'Sản phẩm - TechForge',
  description: 'Khám phá các sản phẩm máy tính, linh kiện và phụ kiện công nghệ tại TechForge',
})
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-3xl font-bold">Sản phẩm</h1>
      <div class="flex items-center gap-4">
        <UInput placeholder="Tìm kiếm..." icon="i-heroicons-magnifying-glass" />
        <USelect :items="['Mới nhất', 'Giá thấp đến cao', 'Giá cao đến thấp', 'Bán chạy']" placeholder="Sắp xếp" />
      </div>
    </div>

    <div class="grid grid-cols-12 gap-8">
      <!-- Sidebar filters -->
      <aside class="col-span-3">
        <UCard>
          <template #header>
            <h3 class="font-semibold">Bộ lọc</h3>
          </template>

          <div class="space-y-4">
            <div>
              <p class="mb-2 font-medium">Danh mục</p>
              <div class="space-y-2">
                <UCheckbox label="PC Gaming" />
                <UCheckbox label="Laptop" />
                <UCheckbox label="Linh kiện" />
                <UCheckbox label="Phụ kiện" />
              </div>
            </div>

            <UDivider />

            <div>
              <p class="mb-2 font-medium">Khoảng giá</p>
              <div class="space-y-2">
                <UCheckbox label="Dưới 5 triệu" />
                <UCheckbox label="5 - 10 triệu" />
                <UCheckbox label="10 - 20 triệu" />
                <UCheckbox label="Trên 20 triệu" />
              </div>
            </div>

            <UDivider />

            <div>
              <p class="mb-2 font-medium">Thương hiệu</p>
              <div class="space-y-2">
                <UCheckbox label="ASUS" />
                <UCheckbox label="MSI" />
                <UCheckbox label="Gigabyte" />
                <UCheckbox label="Intel" />
                <UCheckbox label="AMD" />
              </div>
            </div>
          </div>
        </UCard>
      </aside>

      <!-- Product grid -->
      <div class="col-span-9">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UCard v-for="i in 12" :key="i" class="transition-shadow hover:shadow-lg">
            <template #header>
              <div class="bg-muted aspect-square rounded-t-lg" />
            </template>
            <NuxtLink :to="`/products/product-${i}`" class="hover:text-primary font-medium">Sản phẩm {{ i }}</NuxtLink>
            <p class="text-muted mt-1 text-sm">Mô tả ngắn về sản phẩm</p>
            <template #footer>
              <div class="flex items-center justify-between">
                <span class="text-primary text-lg font-bold">{{ (i * 1000000).toLocaleString('vi-VN') }}đ</span>
                <UButton icon="i-heroicons-shopping-cart" size="sm" />
              </div>
            </template>
          </UCard>
        </div>

        <!-- Pagination -->
        <div class="mt-8 flex justify-center">
          <UPagination :total="100" :page-count="10" />
        </div>
      </div>
    </div>
  </UContainer>
</template>
