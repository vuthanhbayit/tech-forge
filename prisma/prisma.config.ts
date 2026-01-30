import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

config({ path: path.join(__dirname, '..', '.env') })

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),

  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
