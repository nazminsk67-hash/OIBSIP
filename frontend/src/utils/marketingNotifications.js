import { addNotification } from '../redux/notificationSlice'

const BROADCAST_KEY = 'pd_marketing_broadcast_v1'
const SEEN_KEY = 'pd_marketing_seen_v1'

const readBroadcasts = () => {
  try {
    return JSON.parse(localStorage.getItem(BROADCAST_KEY) || '[]')
  } catch {
    return []
  }
}

const writeBroadcasts = (items) => {
  localStorage.setItem(BROADCAST_KEY, JSON.stringify(items.slice(0, 100)))
}

/** Admin-side: publish a marketing update visible to users on this origin. */
export function publishMarketingBroadcast({ title, message, type = 'promo' }) {
  const items = readBroadcasts()
  const entry = {
    id: `broadcast_${Date.now()}`,
    type,
    title,
    message,
    createdAt: new Date().toISOString(),
  }
  items.unshift(entry)
  writeBroadcasts(items)
  return entry
}

/** User-side: import unpublished broadcasts into Redux notifications. */
export function syncMarketingBroadcasts(dispatch) {
  const broadcasts = readBroadcasts()
  if (!broadcasts.length) return

  let seen = []
  try {
    seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
  } catch {
    seen = []
  }

  const seenSet = new Set(seen)
  const fresh = broadcasts.filter((b) => !seenSet.has(b.id))

  fresh.forEach((b) => {
    dispatch(
      addNotification({
        type: b.type || 'promo',
        title: b.title,
        message: b.message,
        audience: 'user',
      })
    )
    seenSet.add(b.id)
  })

  if (fresh.length) {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seenSet].slice(-200)))
  }
}

export function notifyNewPizza(dispatch, pizzaName) {
  publishMarketingBroadcast({
    title: 'Fresh from the oven 🍕',
    message: `Try our new ${pizzaName} today.`,
    type: 'promo',
  })
}

export function notifyNewCoupon(dispatch, code, discountText) {
  publishMarketingBroadcast({
    title: 'Limited time offer! 🏷️',
    message: `Use ${code} and ${discountText || 'save on your order'}.`,
    type: 'promo',
  })
}

export function notifyCouponActivated(dispatch, code) {
  publishMarketingBroadcast({
    title: 'Coupon is live!',
    message: `${code} is now active — order before it expires.`,
    type: 'promo',
  })
}

export function notifyNewBanner(dispatch, title) {
  publishMarketingBroadcast({
    title: 'Weekend special is live ✨',
    message: title || 'Check out our latest promotion on the homepage.',
    type: 'promo',
  })
}

const DEFAULT_MARKETING = [
  {
    title: 'Welcome to PizzaHub 🍕',
    message: 'Browse the menu and build your perfect pizza in minutes.',
    type: 'promo',
  },
  {
    title: 'Reward points are waiting 🎁',
    message: 'Order today and redeem points on your next checkout.',
    type: 'promo',
  },
  {
    title: 'Weekend special is live',
    message: 'Explore new additions in your favourite pizza categories.',
    type: 'promo',
  },
]

export function seedDefaultMarketingNotifications(dispatch, existingCount) {
  if (existingCount > 0) return
  DEFAULT_MARKETING.forEach((item) => {
    dispatch(addNotification({ ...item, audience: 'user' }))
  })
}
