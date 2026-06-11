import mongoose from 'mongoose'

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    minimumStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['in-stock', 'low-stock', 'out-of-stock'],
      default: 'in-stock',
    },
  },
  {
    timestamps: true,
  }
)

inventorySchema.pre('save', function (next) {
  if (this.stock <= 0) {
    this.status = 'out-of-stock'
  } else if (this.stock <= this.minimumStock) {
    this.status = 'low-stock'
  } else {
    this.status = 'in-stock'
  }
  next()
})

inventorySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate()
  if (update == null) return next()

  const stock = typeof update.stock !== 'undefined' ? update.stock : update.$set?.stock
  const minimumStock = typeof update.minimumStock !== 'undefined' ? update.minimumStock : update.$set?.minimumStock

  if (typeof stock !== 'undefined' || typeof minimumStock !== 'undefined') {
    const currentStock = typeof stock !== 'undefined' ? stock : this._update.$set?.stock
    const currentMin = typeof minimumStock !== 'undefined' ? minimumStock : this._update.$set?.minimumStock

    if (typeof currentStock === 'number' && typeof currentMin === 'number') {
      if (currentStock <= 0) {
        update.status = 'out-of-stock'
      } else if (currentStock <= currentMin) {
        update.status = 'low-stock'
      } else {
        update.status = 'in-stock'
      }
    }
  }

  next()
})

const Inventory = mongoose.model('Inventory', inventorySchema)
export default Inventory
