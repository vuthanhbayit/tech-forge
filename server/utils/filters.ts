/**
 * Query filter helpers for Prisma
 * Used to create consistent filtering across API routes
 */

/**
 * Filter for non-deleted records (soft delete)
 */
export function withoutDeleted() {
  return { deletedAt: null }
}

/**
 * Filter for active records
 */
export function onlyActive() {
  return { isActive: true }
}

/**
 * Combine soft delete and active filters
 */
export function activeAndNotDeleted() {
  return {
    deletedAt: null,
    isActive: true,
  }
}

/**
 * Pagination helper - returns skip and take for Prisma
 */
export function paginate(page: number, limit: number) {
  const safePage = Math.max(1, page)
  const safeLimit = Math.min(Math.max(1, limit), 100)
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  }
}

/**
 * Build pagination info for response
 */
export function buildPaginationInfo(page: number, limit: number, total: number) {
  const safePage = Math.max(1, page)
  const safeLimit = Math.min(Math.max(1, limit), 100)
  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
  }
}

/**
 * Search filter for text fields (case insensitive)
 */
export function searchFilter(search: string, fields: string[]) {
  if (!search?.trim()) return {}

  return {
    OR: fields.map(field => ({
      [field]: { contains: search.trim(), mode: 'insensitive' as const },
    })),
  }
}
