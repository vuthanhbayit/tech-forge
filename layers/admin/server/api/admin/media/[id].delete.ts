/**
 * DELETE /api/admin/media/:id
 * Delete media file from S3 and database
 */
export default defineEventHandler(async event => {
  await requirePermission(event, 'media', 'DELETE')

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw validationError('ID là bắt buộc')
  }

  const query = getQuery(event)
  const force = query.force === 'true'

  const media = await prisma.media.findUnique({
    where: { id },
  })

  if (!media) {
    throw notFoundError('media')
  }

  // Check if media is being used
  const usages = await checkMediaUsage(media.url)

  if (usages.length > 0 && !force) {
    throw createError({
      statusCode: 409,
      message: `File đang được sử dụng tại ${usages.length} nơi`,
      data: {
        code: 'MEDIA_IN_USE',
        usages,
      },
    })
  }

  // Delete from S3
  const urlsToDelete = [media.url]
  if (media.thumbnailUrl) {
    urlsToDelete.push(media.thumbnailUrl)
  }

  try {
    await deleteMultipleFromS3(urlsToDelete)
  } catch (error) {
    console.error('Failed to delete from S3:', error)
    // Continue with database deletion even if S3 delete fails
  }

  // Delete from database
  await prisma.media.delete({
    where: { id },
  })

  return { success: true }
})

/**
 * Check where media URL is being used
 */
async function checkMediaUsage(url: string): Promise<Array<{ type: string; id: string; name: string }>> {
  const usages: Array<{ type: string; id: string; name: string }> = []

  // Check Category images
  const categories = await prisma.category.findMany({
    where: { image: url },
    select: { id: true, name: true },
  })
  for (const cat of categories) {
    usages.push({ type: 'Danh mục', id: cat.id, name: cat.name })
  }

  // Check Product thumbnails
  const products = await prisma.product.findMany({
    where: { thumbnail: url },
    select: { id: true, title: true },
  })
  for (const prod of products) {
    usages.push({ type: 'Sản phẩm', id: prod.id, name: prod.title })
  }

  // Check ProductImage
  const productImages = await prisma.productImage.findMany({
    where: { url },
    select: { id: true, product: { select: { id: true, title: true } } },
  })
  for (const img of productImages) {
    usages.push({ type: 'Ảnh sản phẩm', id: img.product.id, name: img.product.title })
  }

  // Check BlogPost featured images
  const blogPosts = await prisma.blogPost.findMany({
    where: { featuredImage: url },
    select: { id: true, title: true },
  })
  for (const post of blogPosts) {
    usages.push({ type: 'Bài viết', id: post.id, name: post.title })
  }

  // Check User avatars
  const users = await prisma.user.findMany({
    where: { avatar: url },
    select: { id: true, email: true },
  })
  for (const user of users) {
    usages.push({ type: 'Avatar', id: user.id, name: user.email })
  }

  return usages
}
