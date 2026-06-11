import mongoose from 'mongoose'

const deliveryAssignmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    deliveryPerson: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'pickup', 'enroute', 'delivered', 'cancelled'],
      default: 'assigned',
    },
    notes: {
      type: String,
      trim: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

const DeliveryAssignment = mongoose.model('DeliveryAssignment', deliveryAssignmentSchema)
export default DeliveryAssignment
