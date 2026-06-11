/**
 * Debounce utility for optimizing performance
 */
export function debounce(func, delay = 300) {
  let timeoutId
  return function debounced(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Throttle utility for rate-limiting function calls
 */
export function throttle(func, delay = 300) {
  let lastCall = 0
  return function throttled(...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

export default { debounce, throttle }
