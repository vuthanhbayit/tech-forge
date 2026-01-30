# Project Structure

```
tech-forge/
├── app/                          # Nuxt app (frontend)
│   ├── assets/css/main.css       # Tailwind + Nuxt UI imports
│   ├── composables/
│   │   └── useAuth.ts            # Auth composable
│   ├── layouts/
│   │   └── default.vue           # Store layout
│   ├── middleware/
│   │   ├── auth.ts               # Require login
│   │   └── guest.ts              # Only for guests
│   ├── pages/
│   │   ├── index.vue
│   │   ├── login.vue
│   │   ├── register.vue
│   │   └── products/
│   └── app.vue
│
├── layers/                       # Nuxt Layers (modular architecture)
│   └── admin/                    # Admin module layer
│       ├── nuxt.config.ts        # Layer config (SPA mode)
│       ├── app/
│       │   ├── layouts/
│       │   │   └── admin.vue     # Admin dashboard layout
│       │   ├── middleware/
│       │   │   └── admin.ts      # Require admin role
│       │   └── pages/admin/
│       │       ├── index.vue     # Dashboard
│       │       ├── categories/   # Categories management
│       │       ├── users/        # Users management
│       │       ├── roles/        # Roles management
│       │       └── settings/     # Settings management
│       └── server/api/admin/
│           ├── categories/       # Categories CRUD
│           ├── users/            # Users CRUD
│           ├── roles/            # Roles CRUD
│           ├── permissions/      # Permissions list
│           └── settings/         # Settings CRUD
│
├── server/                       # Nitro server (backend)
│   ├── api/
│   │   ├── auth/                 # Auth endpoints
│   │   └── settings/             # Public settings
│   ├── plugins/
│   │   └── events.ts             # Event system initialization
│   ├── subscribers/              # Event subscribers
│   │   ├── index.ts
│   │   └── cache.ts
│   └── utils/
│       ├── prisma.ts             # Prisma client singleton
│       ├── session.ts            # Session management
│       ├── permission.ts         # Permission checking
│       ├── slug.ts               # Slug generation
│       └── events.ts             # Event system utilities
│
├── shared/                       # Shared code (server + client) - DRY
│   ├── types/                    # TypeScript types
│   │   ├── index.ts              # Re-export all types
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── role.ts
│   │   ├── category.ts
│   │   ├── settings.ts
│   │   ├── address.ts
│   │   ├── permission.ts
│   │   └── common.ts
│   └── utils/                    # Shared utilities
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
├── nuxt.config.ts                # Main Nuxt config (extends layers)
├── eslint.config.mjs
├── .prettierrc
├── docker-compose.yml
├── package.json
└── CLAUDE.md                     # AI instructions
```

## Nuxt Layers Architecture

Project sử dụng Nuxt Layers để modular hóa code:

| Layer | Mô tả |
|-------|-------|
| `layers/admin` | Admin dashboard module (pages, API, layout) |

### Tại sao dùng Layers?
- **Separation of concerns**: Admin code tách biệt khỏi storefront
- **Reusability**: Có thể reuse layer trong project khác
- **Maintainability**: Dễ maintain và scale từng module
- **Team collaboration**: Team có thể làm việc độc lập trên từng layer

### Cách thêm Layer mới
```bash
mkdir -p layers/new-layer/{app,server}
```


## Important Files

### Configuration
| File | Mô tả |
|------|-------|
| `nuxt.config.ts` | Main Nuxt config (extends layers) |
| `layers/admin/nuxt.config.ts` | Admin layer config (SPA mode) |
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
| `server/utils/permission.ts` | Permission checking (`requirePermission`) |
| `server/utils/slug.ts` | Slug generation (Vietnamese support) |
| `server/utils/events.ts` | Event system utilities |

### App
| File | Mô tả |
|------|-------|
| `app/composables/useAuth.ts` | Auth composable |
| `layers/admin/app/layouts/admin.vue` | Admin dashboard layout |
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
