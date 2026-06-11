import Banner from '../models/Banner.js'
import BannerClick from '../models/BannerClick.js'

export const trackBannerClick = async (req, res, next) => {
  try {
    const { bannerId } = req.params
    const banner = await Banner.findById(bannerId)
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' })
    }

    await BannerClick.create({
      banner: bannerId,
      user: req.user?._id || null,
      userAgent: req.get('user-agent'),
    })

    res.json({ message: 'Click tracked' })
  } catch (err) {
    next(err)
  }
}

export const getBannerStats = async (_req, res, next) => {
  try {
    const stats = await BannerClick.aggregate([
      {
        $group: {
          _id: '$banner',
          clicks: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'banners',
          localField: '_id',
          foreignField: '_id',
          as: 'banner',
        },
      },
      { $unwind: { path: '$banner', preserveNullAndEmptyArrays: true } },
      { $sort: { clicks: -1 } },
    ])
    res.json(stats)
  } catch (err) {
    next(err)
  }
}

export const getActiveBanners = async (_req, res, next) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ sortOrder: 1, createdAt: -1 })
    res.json(banners)
  } catch (err) {
    next(err)
  }
}

export const getAllBanners = async (_req, res, next) => {
  try {
    const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 })
    res.json(banners)
  } catch (err) {
    next(err)
  }
}

export const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, imageUrl, active = true, sortOrder = 0, ctaText = '', ctaLink = '' } = req.body
    if (!title || !imageUrl) {
      return res.status(400).json({ message: 'Banner title and image URL are required' })
    }
    const banner = await Banner.create({
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      imageUrl: imageUrl.trim(),
      active,
      sortOrder: Number(sortOrder),
      createdBy: req.user._id,
      ctaText: ctaText?.trim() || '',
      ctaLink: ctaLink?.trim() || '',
    })
    res.status(201).json(banner)
  } catch (err) {
    next(err)
  }
}

export const updateBanner = async (req, res, next) => {
  try {
    const updates = req.body
    const banner = await Banner.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' })
    }
    res.json(banner)
  } catch (err) {
    next(err)
  }
}

export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id)
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' })
    }
    res.json({ message: 'Banner deleted successfully' })
  } catch (err) {
    next(err)
  }
}
