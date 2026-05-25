/**
 * AsyncHandler – wraps async route handlers to catch errors
 * This eliminates the need for try-catch in every route handler
 * 
 * Usage:
 * router.post('/users', asyncHandler(async (req, res, next) => {
 *   const user = await User.create(req.body)
 *   res.json(user)
 * }))
 */

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler
