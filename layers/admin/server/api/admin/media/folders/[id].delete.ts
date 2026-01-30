/**
 * DELETE /api/admin/media/folders/:id
 * Delete folder (must be empty or cascade delete)
 */
export default defineEventHandler(async event => {
  await requirePermission(event, 'media', 'DELETE')

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw validationError('ID là bắt buộc')
  }

  const query = getQuery(event)
  const force = query.force === 'true'

  const folder = await prisma.mediaFolder.findUnique({
    where: { id },
    include: {
      _count: {
        select: { children: true, files: true },
      },
    },
  })

  if (!folder) {
    throw notFoundError('folder')
  }

  // Check if folder has contents
  const hasContents = folder._count.children > 0 || folder._count.files > 0

  if (hasContents && !force) {
    throw validationError('Folder không trống. Sử dụng ?force=true để xóa cùng với tất cả nội dung bên trong')
  }

  if (force && hasContents) {
    // Get all descendant folders
    const descendantIds = await getDescendantFolderIds(id)

    // Get all files in this folder and descendants
    const allFolderIds = [id, ...descendantIds]
    const files = await prisma.media.findMany({
      where: { folderId: { in: allFolderIds } },
      select: { url: true, thumbnailUrl: true },
    })

    // Delete from S3
    const urlsToDelete: string[] = []
    for (const file of files) {
      urlsToDelete.push(file.url)
      if (file.thumbnailUrl) {
        urlsToDelete.push(file.thumbnailUrl)
      }
    }

    if (urlsToDelete.length > 0) {
      try {
        await deleteMultipleFromS3(urlsToDelete)
      } catch (error) {
        console.error('Failed to delete some files from S3:', error)
      }
    }

    // Delete files from database
    await prisma.media.deleteMany({
      where: { folderId: { in: allFolderIds } },
    })

    // Delete descendant folders (in reverse order - deepest first)
    for (const fId of descendantIds.reverse()) {
      await prisma.mediaFolder.delete({ where: { id: fId } })
    }
  }

  // Delete the folder itself
  await prisma.mediaFolder.delete({
    where: { id },
  })

  return { success: true }
})

/**
 * Get all descendant folder IDs using breadth-first search
 * Prevents infinite loops and N+1 queries
 */
async function getDescendantFolderIds(parentId: string): Promise<string[]> {
  const allIds: string[] = []
  const visited = new Set<string>()
  let currentLevel = [parentId]
  const MAX_DEPTH = 50
  let depth = 0

  while (currentLevel.length > 0 && depth < MAX_DEPTH) {
    // Get all children of current level in one query
    const children = await prisma.mediaFolder.findMany({
      where: {
        parentId: { in: currentLevel },
        id: { notIn: Array.from(visited) }, // Prevent cycles
      },
      select: { id: true },
    })

    const childIds = children.map(c => c.id)
    for (const id of childIds) {
      if (!visited.has(id)) {
        visited.add(id)
        allIds.push(id)
      }
    }

    currentLevel = childIds
    depth++
  }

  return allIds
}
