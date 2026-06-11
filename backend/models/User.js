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

    favorites: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza' },
    ],

    // ── Email verification ──────────────────────────────────────
    emailVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken:   { type: String, select: false },
    emailVerificationExpires: { type: Date,   select: false },
    // Aliases (additive) — kept in sync with fields above
    isVerified: { type: Boolean, default: false },
    verificationToken:        { type: String, select: false },
    verificationTokenExpires: { type: Date,   select: false },
    // Retained after verify so repeat link clicks resolve to "already verified"
    lastVerifiedTokenHash: { type: String, select: false },
    welcomeEmailSent: { type: Boolean, default: false },

    rewardPoints: {
      type: Number,
      default: 0,
      min: [0, 'Reward points cannot be negative'],
    },

    // Loyalty tier stats (additive)
    totalOrders: { type: Number, default: 0, min: 0 },
    totalSpent:  { type: Number, default: 0, min: 0 },

    // ── Password reset ──────────────────────────────────────────
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },
  },
  { timestamps: true }
)

// Keep verification field aliases in sync (backward compatible)
userSchema.pre('save', function syncVerificationFields(next) {
  if (
    this.isModified('emailVerified') ||
    this.isModified('isEmailVerified') ||
    this.isModified('isVerified')
  ) {
    const verified = Boolean(
      this.emailVerified || this.isEmailVerified || this.isVerified
    )
    this.emailVerified = verified
    this.isEmailVerified = verified
    this.isVerified = verified
  }
  if (this.isModified('emailVerificationToken') || this.isModified('verificationToken')) {
    const token = this.emailVerificationToken ?? this.verificationToken
    this.emailVerificationToken = token
    this.verificationToken = token
  }
  if (this.isModified('emailVerificationExpires') || this.isModified('verificationTokenExpires')) {
    const expires = this.emailVerificationExpires ?? this.verificationTokenExpires
    this.emailVerificationExpires = expires
    this.verificationTokenExpires = expires
  }
  next()
})

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

userSchema.methods.isAccountVerified = function () {
  return Boolean(this.emailVerified || this.isEmailVerified || this.isVerified)
}

userSchema.methods.markEmailVerified = function (hashedToken) {
  this.emailVerified = true
  this.isEmailVerified = true
  this.isVerified = true
  if (hashedToken) {
    this.lastVerifiedTokenHash = hashedToken
  }
  this.emailVerificationToken = undefined
  this.emailVerificationExpires = undefined
  this.verificationToken = undefined
  this.verificationTokenExpires = undefined
}

userSchema.methods.isVerificationTokenExpired = function () {
  const now = Date.now()
  const expires = this.emailVerificationExpires ?? this.verificationTokenExpires
  return !expires || expires <= now
}

userSchema.statics.findByVerificationToken = function (hashedToken) {
  const now = Date.now()
  return this.findOne({
    $or: [
      { emailVerificationToken: hashedToken, emailVerificationExpires: { $gt: now } },
      { verificationToken: hashedToken, verificationTokenExpires: { $gt: now } },
    ],
  }).select(
    '+emailVerificationToken +emailVerificationExpires +verificationToken +verificationTokenExpires'
  )
}

userSchema.statics.findByVerificationTokenHash = function (hashedToken) {
  return this.findOne({
    $or: [
      { emailVerificationToken: hashedToken },
      { verificationToken: hashedToken },
    ],
  }).select(
    '+emailVerificationToken +emailVerificationExpires +verificationToken +verificationTokenExpires'
  )
}

// Generate a hashed token (stored in DB), return the raw token (sent in email)
userSchema.methods.createEmailVerificationToken = function () {
  this.emailVerified = false
  this.isEmailVerified = false
  this.isVerified = false
  const raw = crypto.randomBytes(32).toString('hex')
  const hashed = crypto.createHash('sha256').update(raw).digest('hex')
  const expires = Date.now() + 24 * 60 * 60 * 1000  // 24 h
  this.emailVerificationToken = hashed
  this.emailVerificationExpires = expires
  this.verificationToken = hashed
  this.verificationTokenExpires = expires
  this.lastVerifiedTokenHash = undefined
  return raw
}

userSchema.statics.findByConsumedVerificationToken = function (hashedToken) {
  return this.findOne({
    lastVerifiedTokenHash: hashedToken,
    $or: [{ emailVerified: true }, { isEmailVerified: true }],
  })
}

userSchema.methods.createPasswordResetToken = function () {
  const raw    = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken   = crypto.createHash('sha256').update(raw).digest('hex')
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000  // 1 h
  return raw
}

const User = mongoose.model('User', userSchema)
export default User
