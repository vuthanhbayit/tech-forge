// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

  // Admin routes are SPA (no SSR)
  routeRules: {
    '/admin/**': { ssr: false },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  // Enable strict template type checking
  typescript: {
    strict: true,
    typeCheck: true,
  },
})
