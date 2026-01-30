import { EventEmitter } from 'node:events'

/**
 * Server-side Event System
 *
 * Sử dụng:
 * ```ts
 * // Emit event trong API route
 * serverEvents.emit('category:updated', { id: 'cat_123', name: 'New Name' })
 *
 * // Subscribe trong server/subscribers/
 * serverEvents.on('category:updated', async (payload) => {
 *   await clearCategoryCache(payload.id)
 * })
 * ```
 */

// Base payload với metadata
interface BasePayload {
  _meta?: {
    userId?: string
    timestamp?: Date
    ip?: string
  }
}

// Event payload types
export interface EventPayloads {
  // Category events
  'category:created': BasePayload & { id: string; name: string; slug: string }
  'category:updated': BasePayload & { id: string; changes?: Record<string, unknown> }
  'category:deleted': BasePayload & { id: string }

  // Product events
  'product:created': BasePayload & { id: string; name: string; sku: string; categoryId?: string }
  'product:updated': BasePayload & { id: string; changes?: Record<string, unknown> }
  'product:deleted': BasePayload & { id: string }
  'product:price:changed': BasePayload & { id: string; sku: string; oldPrice: number; newPrice: number }
  'product:stock:changed': BasePayload & { id: string; sku: string; oldQty: number; newQty: number }

  // User events
  'user:created': BasePayload & { id: string; email: string }
  'user:updated': BasePayload & { id: string; changes?: Record<string, unknown> }
  'user:deleted': BasePayload & { id: string }
  'user:login': BasePayload & { id: string; email: string }
  'user:logout': BasePayload & { id: string }

  // Role events
  'role:created': BasePayload & { id: string; name: string }
  'role:updated': BasePayload & { id: string; changes?: Record<string, unknown> }
  'role:deleted': BasePayload & { id: string }

  // Order events
  'order:created': BasePayload & { id: string; userId: string; total: number }
  'order:updated': BasePayload & { id: string; status?: string }
  'order:cancelled': BasePayload & { id: string; reason?: string }
  'order:paid': BasePayload & { id: string; paymentMethod: string }
  'order:shipped': BasePayload & { id: string; trackingNumber?: string }

  // Settings events
  'settings:updated': BasePayload & { key: string; value: unknown }

  // Cache events
  'cache:invalidate': { keys: string[] }
  'cache:invalidate:pattern': { pattern: string }
  'cache:clear:all': Record<string, never>
}

export type EventName = keyof EventPayloads

class ServerEventEmitter {
  private emitter = new EventEmitter()
  private _initialized = false

  constructor() {
    // Tăng limit listeners để tránh warning
    this.emitter.setMaxListeners(50)
  }

  get initialized() {
    return this._initialized
  }

  setInitialized() {
    this._initialized = true
  }

  /**
   * Subscribe to an event
   */
  on<E extends EventName>(event: E, listener: (payload: EventPayloads[E]) => void | Promise<void>): this {
    this.emitter.on(event, listener as (...args: unknown[]) => void)
    return this
  }

  /**
   * Subscribe to an event once
   */
  once<E extends EventName>(event: E, listener: (payload: EventPayloads[E]) => void | Promise<void>): this {
    this.emitter.once(event, listener as (...args: unknown[]) => void)
    return this
  }

  /**
   * Unsubscribe from an event
   */
  off<E extends EventName>(event: E, listener: (payload: EventPayloads[E]) => void | Promise<void>): this {
    this.emitter.off(event, listener as (...args: unknown[]) => void)
    return this
  }

  /**
   * Emit an event (fire and forget)
   */
  emit<E extends EventName>(event: E, payload: EventPayloads[E]): boolean {
    // Add timestamp for events with _meta
    if (typeof payload === 'object' && payload !== null && '_meta' in payload) {
      const p = payload as BasePayload
      p._meta = { ...p._meta, timestamp: new Date() }
    }
    return this.emitter.emit(event, payload)
  }

  /**
   * Emit event và đợi tất cả listeners xử lý xong
   */
  async emitAsync<E extends EventName>(event: E, payload: EventPayloads[E]): Promise<void> {
    const listeners = this.emitter.listeners(event) as Array<(payload: EventPayloads[E]) => void | Promise<void>>

    // Add timestamp for events with _meta
    if (typeof payload === 'object' && payload !== null && '_meta' in payload) {
      const p = payload as BasePayload
      p._meta = { ...p._meta, timestamp: new Date() }
    }

    await Promise.all(listeners.map(listener => listener(payload)))
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: EventName): number {
    return this.emitter.listenerCount(event)
  }
}

// Singleton instance - auto-imported trong server/
export const serverEvents = new ServerEventEmitter()
