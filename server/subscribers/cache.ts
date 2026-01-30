/**
 * Cache Invalidation Subscriber
 *
 * Handles cache clearing when data changes
 */

import { serverEvents } from '../utils/events'

// Simple in-memory cache store (có thể thay bằng Redis)
const cache = new Map<string, { data: unknown; expiry: number }>()

export function setupCacheSubscribers() {
  // Category cache
  serverEvents.on('category:created', () => {
    invalidatePattern('categories:*')
  })

  serverEvents.on('category:updated', payload => {
    invalidatePattern('categories:*')
    invalidate(`category:${payload.id}`)
  })

  serverEvents.on('category:deleted', payload => {
    invalidatePattern('categories:*')
    invalidate(`category:${payload.id}`)
  })

  // Product cache
  serverEvents.on('product:created', payload => {
    invalidatePattern('products:*')
    if (payload.categoryId) {
      invalidate(`category:${payload.categoryId}:products`)
    }
  })

  serverEvents.on('product:updated', payload => {
    invalidate(`product:${payload.id}`)
    invalidatePattern('products:list:*')
  })

  serverEvents.on('product:deleted', payload => {
    invalidate(`product:${payload.id}`)
    invalidatePattern('products:*')
  })

  // User cache
  serverEvents.on('user:updated', payload => {
    invalidate(`user:${payload.id}`)
  })

  serverEvents.on('role:updated', () => {
    // Role change affects user permissions cache
    invalidatePattern('user:*:permissions')
  })

  // Settings cache
  serverEvents.on('settings:updated', payload => {
    invalidate(`settings:${payload.key}`)
    invalidatePattern('settings:*')
  })

  // Manual cache invalidation
  serverEvents.on('cache:invalidate', payload => {
    payload.keys.forEach(key => invalidate(key))
  })

  serverEvents.on('cache:invalidate:pattern', payload => {
    invalidatePattern(payload.pattern)
  })

  serverEvents.on('cache:clear:all', () => {
    cache.clear()
    console.log('[Cache] Cleared all cache')
  })

  console.log('[Subscribers] Cache subscribers registered')
}

// Cache utilities (export để sử dụng trong API routes)
export function getCache<T>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null

  if (Date.now() > item.expiry) {
    cache.delete(key)
    return null
  }

  return item.data as T
}

export function setCache<T>(key: string, data: T, ttlSeconds = 300): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  })
}

export function invalidate(key: string): boolean {
  const deleted = cache.delete(key)
  if (deleted) {
    console.log(`[Cache] Invalidated: ${key}`)
  }
  return deleted
}

export function invalidatePattern(pattern: string): number {
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
  let count = 0

  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key)
      count++
    }
  }

  if (count > 0) {
    console.log(`[Cache] Invalidated ${count} keys matching: ${pattern}`)
  }

  return count
}
