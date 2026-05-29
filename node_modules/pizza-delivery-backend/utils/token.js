import jwt from 'jsonwebtoken'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

/**
 * Create a JWT and attach the user object to the response.
 */
export const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  // Strip sensitive fields
  user.password = undefined

  res.status(statusCode).json({
    token,
    user: {
      _id:             user._id,
      name:            user.name,
      email:           user.email,
      role:            user.role,
      isEmailVerified: user.isEmailVerified,
    },
  })
}

export default signToken
