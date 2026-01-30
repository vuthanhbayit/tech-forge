// Admin Layer Configuration
export default defineNuxtConfig({
  // Admin routes are SPA (no SSR)
  routeRules: {
    '/admin/**': { ssr: false },
  },
})
