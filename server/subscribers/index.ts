/**
 * Subscriber Registry
 *
 * Import và đăng ký tất cả subscribers ở đây.
 * File này được gọi từ Nitro plugin khi server start.
 */

import { serverEvents } from '../utils/events'

export function registerSubscribers() {
  if (serverEvents.initialized) return

  // ─────────────────────────────────────────────────────────────
  // Category Subscribers
  // ─────────────────────────────────────────────────────────────
  serverEvents.on('category:created', payload => {
    console.log(`[Event] Category created: ${payload.id} - ${payload.name}`)
  })

  serverEvents.on('category:updated', payload => {
    console.log(`[Event] Category updated: ${payload.id}`)
    // TODO: Clear category cache
    // TODO: Revalidate ISR pages
  })

  serverEvents.on('category:deleted', payload => {
    console.log(`[Event] Category deleted: ${payload.id}`)
  })

  // ─────────────────────────────────────────────────────────────
  // Product Subscribers
  // ─────────────────────────────────────────────────────────────
  serverEvents.on('product:created', payload => {
    console.log(`[Event] Product created: ${payload.id} - ${payload.name}`)
  })

  serverEvents.on('product:updated', payload => {
    console.log(`[Event] Product updated: ${payload.id}`)
    // TODO: Update combo prices if needed
    // TODO: Clear product cache
  })

  serverEvents.on('product:price:changed', payload => {
    console.log(`[Event] Product price changed: ${payload.sku} - ${payload.oldPrice} → ${payload.newPrice}`)
    // TODO: Find and update related combos
    // TODO: Notify subscribers về giảm giá
  })

  serverEvents.on('product:stock:changed', payload => {
    console.log(`[Event] Stock changed: ${payload.sku} - ${payload.oldQty} → ${payload.newQty}`)
    // TODO: Check low stock alert
    // TODO: Update combo availability
  })

  // ─────────────────────────────────────────────────────────────
  // User Subscribers
  // ─────────────────────────────────────────────────────────────
  serverEvents.on('user:created', payload => {
    console.log(`[Event] User created: ${payload.id} - ${payload.email}`)
    // TODO: Send welcome email
  })

  serverEvents.on('user:login', payload => {
    console.log(`[Event] User logged in: ${payload.email}`)
  })

  // ─────────────────────────────────────────────────────────────
  // Order Subscribers
  // ─────────────────────────────────────────────────────────────
  serverEvents.on('order:created', payload => {
    console.log(`[Event] Order created: ${payload.id} - Total: ${payload.total}`)
    // TODO: Send order confirmation email
    // TODO: Notify admin
  })

  serverEvents.on('order:paid', payload => {
    console.log(`[Event] Order paid: ${payload.id} via ${payload.paymentMethod}`)
    // TODO: Update inventory
    // TODO: Trigger fulfillment
  })

  serverEvents.on('order:shipped', payload => {
    console.log(`[Event] Order shipped: ${payload.id} - Tracking: ${payload.trackingNumber}`)
    // TODO: Send shipping notification
  })

  // ─────────────────────────────────────────────────────────────
  // Settings Subscribers
  // ─────────────────────────────────────────────────────────────
  serverEvents.on('settings:updated', payload => {
    console.log(`[Event] Settings updated: ${payload.key}`)
    // TODO: Clear settings cache
  })

  serverEvents.setInitialized()
  console.log('[Subscribers] All subscribers registered')
}
