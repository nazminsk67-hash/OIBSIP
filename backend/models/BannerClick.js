import mongoose from 'mongoose'

const bannerClickSchema = new mongoose.Schema(
  {
    banner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Banner',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true }
)

const BannerClick = mongoose.model('BannerClick', bannerClickSchema)
export default BannerClick
