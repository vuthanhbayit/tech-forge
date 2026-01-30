/**
 * Category tree helpers
 */

/**
 * Get all descendant IDs of a category (children, grandchildren, etc.)
 * Used to prevent circular references when selecting parent category
 */
export async function getDescendantIds(categoryId: string): Promise<string[]> {
  const descendants: string[] = []

  async function collectChildren(parentId: string) {
    const children = await prisma.category.findMany({
      where: { parentId },
      select: { id: true },
    })

    for (const child of children) {
      descendants.push(child.id)
      await collectChildren(child.id)
    }
  }

  await collectChildren(categoryId)
  return descendants
}
