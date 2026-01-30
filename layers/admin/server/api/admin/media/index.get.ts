/**
 * GET /api/admin/media
 * List media files and folders with File Explorer style
 */
import type { MediaItem, MediaFolderBreadcrumb, MediaListResponse } from '#shared/types'

export default defineEventHandler(async event => {
  await requirePermission(event, 'media', 'READ')

  const query = getQuery(event)
  const folderId = (query.folderId as string) || null
  const search = (query.search as string) || ''
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  const skip = (page - 1) * limit

  // Build where clause
  const folderWhere: Record<string, unknown> = {}
  const fileWhere: Record<string, unknown> = {}

  if (search) {
    // When searching, search all folders/files
    folderWhere.name = { contains: search, mode: 'insensitive' }
    fileWhere.OR = [
      { filename: { contains: search, mode: 'insensitive' } },
      { originalName: { contains: search, mode: 'insensitive' } },
    ]
  } else {
    // When browsing, show items in current folder
    folderWhere.parentId = folderId
    fileWhere.folderId = folderId
  }

  // Get folders and files in parallel
  const [folders, files, folderCount, fileCount] = await Promise.all([
    // Get folders
    prisma.mediaFolder.findMany({
      where: folderWhere,
      include: {
        _count: {
          select: { children: true, files: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    // Get files (with pagination)
    prisma.media.findMany({
      where: fileWhere,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    // Count folders
    prisma.mediaFolder.count({ where: folderWhere }),
    // Count files
    prisma.media.count({ where: fileWhere }),
  ])

  // Build breadcrumbs with protection against circular references
  const breadcrumbs: MediaFolderBreadcrumb[] = []
  if (folderId && !search) {
    const visited = new Set<string>()
    const MAX_DEPTH = 50
    let currentId: string | null = folderId
    let depth = 0

    while (currentId && depth < MAX_DEPTH) {
      if (visited.has(currentId)) break // Prevent infinite loop
      visited.add(currentId)

      const folderItem: { id: string; name: string; parentId: string | null } | null =
        await prisma.mediaFolder.findUnique({
          where: { id: currentId },
          select: { id: true, name: true, parentId: true },
        })
      if (folderItem) {
        breadcrumbs.unshift({ id: folderItem.id, name: folderItem.name })
        currentId = folderItem.parentId
      } else {
        break
      }
      depth++
    }
  }

  // Combine folders and files into items
  const items: MediaItem[] = [
    // Folders first
    ...folders.map(f => ({
      type: 'folder' as const,
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      _count: f._count,
      createdAt: f.createdAt.toISOString(),
    })),
    // Then files
    ...files.map(f => ({
      type: 'file' as const,
      id: f.id,
      name: f.originalName,
      mimeType: f.mimeType,
      size: f.size,
      url: f.url,
      thumbnailUrl: f.thumbnailUrl,
      width: f.width,
      height: f.height,
      createdAt: f.createdAt.toISOString(),
    })),
  ]

  const total = folderCount + fileCount
  const totalPages = Math.ceil(total / limit)

  return {
    items,
    breadcrumbs,
    total,
    page,
    limit,
    totalPages,
  } satisfies MediaListResponse
})
