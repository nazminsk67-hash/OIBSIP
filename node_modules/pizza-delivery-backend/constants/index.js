/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
}

/**
 * API Error Messages
 */
export const ERROR_MESSAGES = {
  // Auth
  AUTH_REQUIRED: 'Authentication required',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',

  // User
  USER_NOT_FOUND: 'User not found',
  EMAIL_IN_USE: 'Email already in use',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'Please verify your email first',

  // Validation
  INVALID_INPUT: 'Invalid input data',
  MISSING_FIELDS: 'Missing required fields',
  VALIDATION_ERROR: 'Validation failed',

  // Server
  INTERNAL_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  ROUTE_NOT_FOUND: 'Route not found',
}

/**
 * API Success Messages
 */
export const SUCCESS_MESSAGES = {
  // Auth
  REGISTERED: 'Registration successful. Please verify your email.',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  PASSWORD_RESET: 'Password reset successfully',

  // General
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  FETCHED: 'Fetched successfully',
}

/**
 * User Roles
 */
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
}

/**
 * Order Status
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

/**
 * Payment Status
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

/**
 * App Configuration
 */
export const APP_CONFIG = {
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  EMAIL_VERIFICATION_EXPIRES: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET_EXPIRES: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME: 15 * 60 * 1000, // 15 minutes
}
