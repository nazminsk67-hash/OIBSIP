import mongoose from 'mongoose'
import bcrypt    from 'bcryptjs'
import crypto    from 'crypto'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // ── Email verification ──────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken:   { type: String, select: false },
    emailVerificationExpires: { type: Date,   select: false },

    // ── Password reset ──────────────────────────────────────────
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },
  },
  { timestamps: true }
)

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare plain password with hashed
userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password)
}

// Generate a hashed token (stored in DB), return the raw token (sent in email)
userSchema.methods.createEmailVerificationToken = function () {
  const raw    = crypto.randomBytes(32).toString('hex')
  this.emailVerificationToken   = crypto.createHash('sha256').update(raw).digest('hex')
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000  // 24 h
  return raw
}

userSchema.methods.createPasswordResetToken = function () {
  const raw    = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken   = crypto.createHash('sha256').update(raw).digest('hex')
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000  // 1 h
  return raw
}

const User = mongoose.model('User', userSchema)
export default User
