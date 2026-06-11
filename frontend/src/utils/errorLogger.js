/**
 * Centralized client-side error logging.
 * Extend with a remote service (Sentry, LogRocket, etc.) in production.
 */

const isDev = process.env.NODE_ENV !== 'production'

export function logError(error, context = {}) {
  const payload = {
    message: error?.message || String(error),
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    ...context,
  }

  if (isDev) {
    console.error('[errorLogger]', payload)
    return
  }

  console.error('[errorLogger]', payload.message, payload)

  // Hook for production observability (no-op until configured)
  if (typeof window !== 'undefined' && window.__PIZZA_ERROR_REPORTER__) {
    try {
      window.__PIZZA_ERROR_REPORTER__(payload)
    } catch {
      // Never throw from logger
    }
  }
}

export function logWarning(message, context = {}) {
  const payload = { message, timestamp: new Date().toISOString(), ...context }
  if (isDev) {
    console.warn('[errorLogger]', payload)
  } else {
    console.warn('[errorLogger]', message)
  }
}

export default { logError, logWarning }
