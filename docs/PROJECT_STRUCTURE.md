# Project Structure

```
tech-forge/
├── app/                          # Nuxt app (frontend)
│   ├── assets/css/main.css       # Tailwind + Nuxt UI imports
│   ├── composables/
│   │   └── useAuth.ts            # Auth composable
│   ├── layouts/
│   │   ├── default.vue           # Store layout
│   │   └── admin.vue             # Admin dashboard layout
│   ├── middleware/
│   │   ├── auth.ts               # Require login
│   │   ├── admin.ts              # Require admin role
│   │   └── guest.ts              # Only for guests
│   ├── pages/
│   │   ├── index.vue
│   │   ├── login.vue
│   │   ├── register.vue
│   │   └── admin/
│   │       ├── index.vue         # Dashboard
│   │       ├── categories/       # Categories management
│   │       ├── users/            # Users management
│   │       ├── roles/            # Roles management
│   │       └── settings/         # Settings management
│   └── app.vue
│
├── server/                       # Nitro server (backend)
│   ├── api/
│   │   ├── auth/                 # Auth endpoints
│   │   ├── settings/             # Public settings
│   │   └── admin/
│   │       ├── categories/       # Categories CRUD
│   │       ├── users/            # Users CRUD
│   │       ├── roles/            # Roles CRUD
│   │       ├── permissions/      # Permissions list
│   │       └── settings/         # Settings CRUD
│   └── utils/
│       ├── prisma.ts             # Prisma client singleton
│       ├── password.ts           # Password hashing (scrypt)
│       ├── session.ts            # Session management
│       ├── slug.ts               # Slug generation
│       └── id.ts                 # Prefixed ID generation
│
├── shared/                       # Shared code (server + client) - DRY
│   ├── types/                    # TypeScript types (không define inline)
│   │   ├── index.ts              # Re-export all types
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── role.ts
│   │   ├── category.ts
│   │   ├── settings.ts
│   │   ├── address.ts
│   │   ├── permission.ts
│   │   └── common.ts
│   └── utils/                    # Shared utilities (server + prisma)
│       ├── index.ts              # Re-export all utils
│       ├── id.ts                 # Prefixed ID generation
│       └── password.ts           # Password hashing (scrypt)
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── prisma.config.ts          # Prisma 7 config
│   ├── seed-permissions.ts       # Seed 84 permissions, 7 roles
│   ├── seed-admin.ts             # Seed super admin user
│   └── tsconfig.json             # TypeScript config for prisma/
│
├── docs/                         # Documentation
│   ├── API_ENDPOINTS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── PERMISSION_SYSTEM.md
│   └── PROJECT_STRUCTURE.md
│
├── nuxt.config.ts
├── eslint.config.mjs
├── .prettierrc
├── docker-compose.yml
├── package.json
└── CLAUDE.md                     # AI instructions
```

## Important Files

### Configuration
| File | Mô tả |
|------|-------|
| `nuxt.config.ts` | Nuxt configuration |
| `prisma/schema.prisma` | Database schema |
| `prisma/prisma.config.ts` | Prisma 7 configuration |
| `eslint.config.mjs` | ESLint configuration |
| `.prettierrc` | Prettier configuration |
| `docker-compose.yml` | PostgreSQL Docker setup |

### Server Utils (auto-imported)
| File | Mô tả |
|------|-------|
| `server/utils/prisma.ts` | Prisma client singleton |
| `server/utils/session.ts` | Session management (`getSessionUser`) |
| `server/utils/password.ts` | Password hashing (scrypt) |
| `server/utils/slug.ts` | Slug generation (Vietnamese support) |
| `server/utils/id.ts` | Prefixed ID generation (`generateId`) |

### App
| File | Mô tả |
|------|-------|
| `app/composables/useAuth.ts` | Auth composable |
| `app/layouts/admin.vue` | Admin dashboard layout |
| `app/assets/css/main.css` | Global CSS với Tailwind |

### Prisma
| File | Mô tả |
|------|-------|
| `prisma/seed-permissions.ts` | Seed 84 permissions, 7 roles |
| `prisma/seed-admin.ts` | Seed super admin user |

## Admin Page Template

```vue
<template>
  <div class="flex h-full min-h-0 flex-col">
    <UDashboardNavbar title="Page Title">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
    </UDashboardNavbar>

    <div class="min-h-0 flex-1 overflow-y-auto p-6">
      <!-- Content here -->
    </div>
  </div>
</template>
```

**Lưu ý scroll**: Cần `h-full min-h-0` ở root và `min-h-0 flex-1 overflow-y-auto` ở content area
