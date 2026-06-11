/**
 * Utility for standardized API responses
 * Usage: res.status(200).json(successResponse('User created', user))
 */

export const successResponse = (message, data = null, statusCode = 200) => ({
  success: true,
  message,
  data,
  statusCode,
})

export const errorResponse = (message, statusCode = 500, errors = null) => ({
  success: false,
  message,
  statusCode,
  ...(errors && { errors }),
})

/**
 * Send standardized success response
 * Usage: sendSuccess(res, 'User created', user, 201)
 */
export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  res.status(statusCode).json(successResponse(message, data))
}

/**
 * Send standardized error response
 * Usage: sendError(res, 'User not found', 404)
 */
export const sendError = (res, message, statusCode = 500, errors = null) => {
  res.status(statusCode).json(errorResponse(message, statusCode, errors))
}
