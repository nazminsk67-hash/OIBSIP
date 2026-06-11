import React, { useEffect, useState } from 'react'
import { bannerApi } from '../../api/bannerApi'

export default function HomepageBanner() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response = await bannerApi.getActiveBanners()
        setBanners(response.data || [])
      } catch (err) {
        console.error('Failed to load banners:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBanners()
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [banners.length])

  const handleBannerClick = async (banner) => {
    try {
      await bannerApi.trackClick(banner._id)
      if (banner.ctaLink) {
        window.location.href = banner.ctaLink
      }
    } catch (err) {
      console.error('Failed to track banner click:', err)
    }
  }

  if (loading) {
    return (
      <div className="h-64 md:h-96 lg:h-[500px] rounded-[2rem] bg-slate-200 animate-pulse" />
    )
  }

  if (!banners.length) {
    return null
  }

  const currentBanner = banners[currentIndex]

  return (
    <div className="space-y-4">
      <div
        className="relative h-64 md:h-96 lg:h-[500px] rounded-[2rem] overflow-hidden cursor-pointer group"
        onClick={() => handleBannerClick(currentBanner)}
      >
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">{currentBanner.title}</h2>
          {currentBanner.subtitle && (
            <p className="text-sm md:text-lg mb-4 text-white/90">{currentBanner.subtitle}</p>
          )}
          {currentBanner.ctaText && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleBannerClick(currentBanner)
              }}
              className="px-6 py-2 md:px-8 md:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
            >
              {currentBanner.ctaText}
            </button>
          )}
        </div>
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition ${
                idx === currentIndex ? 'bg-orange-500 w-6' : 'bg-slate-300'
              }`}
              aria-label={`Go to banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
