// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

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

  // Runtime config
  runtimeConfig: {
    // S3 configuration (private - server only)
    s3: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || 'ap-southeast-1',
      endpoint: process.env.S3_ENDPOINT || '', // For S3-compatible services
      cdnUrl: process.env.S3_CDN_URL || '', // CDN URL for serving files
    },
  },
})
