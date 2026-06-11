import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllOrders, selectOrders } from '../../redux/orderSlice'
import { formatPrice } from '../../utils/helpers'
import useRecharts from '../../hooks/useRecharts'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'
import { couponApi } from '../../api/couponApi'
import { bannerApi } from '../../api/bannerApi'
import { rewardApi } from '../../api/rewardApi'

export default function MarketingAnalytics() {
  const dispatch = useDispatch()
  const orders = useSelector(selectOrders)
  const recharts = useRecharts()
  const [coupons, setCoupons] = useState([])
  const [bannerStats, setBannerStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [couponsRes, bannerStatsRes] = await Promise.all([
          couponApi.getCoupons(),
          bannerApi.getBannerStats?.() || Promise.resolve({ data: [] }),
        ]).catch(() => [{ data: [] }, { data: [] }])

        setCoupons(couponsRes.data || [])
        setBannerStats(bannerStatsRes.data || [])
        dispatch(fetchAllOrders())
      } catch (err) {
        console.error('Failed to load marketing data:', err)
        toast.error('Failed to load marketing analytics')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [dispatch])

  const marketingStats = useMemo(() => {
    const activeCoupons = coupons.filter((c) => c.active)
    const couponUsage = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0)
    const couponRevenue = orders
      .filter((o) => o.couponApplied)
      .reduce((sum, o) => sum + (o.discountApplied || 0), 0)

    const totalCouponIssued = coupons.length
    const couponConversionRate =
      totalCouponIssued > 0 ? ((couponUsage / totalCouponIssued) * 100).toFixed(1) : 0

    const bannerClicks = bannerStats.reduce((sum, b) => sum + (b.clicks || 0), 0)
    const activeBanners = bannerStats.filter((b) => b.banner?.active).length

    const rewardTransactions = orders
      .flatMap((o) => o.rewardTransactions || [])
      .filter((t) => t.type === 'redeem')
    const rewardRedemptions = rewardTransactions.length
    const rewardRedemptionValue = rewardTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

    // Daily coupon usage trend
    const days = [...Array(7)].map((_, idx) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - idx))
      return date.toISOString().slice(0, 10)
    })

    const couponDaily = days.map((date) => {
      const dayOrders = orders.filter(
        (o) => o.createdAt?.slice(0, 10) === date && o.couponApplied
      )
      return {
        date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        usage: dayOrders.length,
        discount: dayOrders.reduce((sum, o) => sum + (o.discountApplied || 0), 0),
      }
    })

    // Banner engagement trend
    const bannerDaily = days.map((date) => {
      const dayOrders = orders.filter(
        (o) => o.createdAt?.slice(0, 10) === date && o.bannerSource
      )
      return {
        date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        clicks: dayOrders.length,
      }
    })

    // Reward redemption trend
    const rewardDaily = days.map((date) => {
      const dayTransactions = rewardTransactions.filter(
        (t) => t.createdAt?.slice(0, 10) === date
      )
      return {
        date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        redemptions: dayTransactions.length,
        value: dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
      }
    })

    return {
      totalCouponIssued,
      couponUsage,
      couponConversionRate,
      activeCoupons: activeCoupons.length,
      bannerClicks,
      activeBanners,
      rewardRedemptions,
      rewardRedemptionValue,
      couponRevenue,
      couponDaily,
      bannerDaily,
      rewardDaily,
      topCoupons: coupons
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, 5),
      topBanners: bannerStats.slice(0, 5),
    }
  }, [orders, coupons, bannerStats])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--accent-primary)' }}>
          Marketing Analytics
        </p>
        <h1 className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Campaign Performance
        </h1>
        <p style={{ color: 'var(--text-tertiary)' }}>
          Track coupon usage, banner engagement, and reward redemptions
        </p>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid">
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>
            Coupons Issued
          </p>
          <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {marketingStats.totalCouponIssued}
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {marketingStats.activeCoupons} active
          </p>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>
            Coupons Redeemed
          </p>
          <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {marketingStats.couponUsage}
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {marketingStats.couponConversionRate}% conversion rate
          </p>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>
            Banner Clicks
          </p>
          <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {marketingStats.bannerClicks}
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {marketingStats.activeBanners} active banners
          </p>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>
            Reward Redemptions
          </p>
          <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {marketingStats.rewardRedemptions}
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {formatPrice(marketingStats.rewardRedemptionValue)} value
          </p>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>
            Coupon Discounts Given
          </p>
          <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {formatPrice(marketingStats.couponRevenue)}
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Total value redeemed
          </p>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--text-tertiary)' }}>
            Reward Points Redeemed
          </p>
          <p className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {formatPrice(marketingStats.rewardRedemptionValue)}
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Total value used
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        {recharts && (
          <>
            <div
              className="rounded-2xl border p-6"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Coupon Usage Trend (7 Days)
              </h2>
              <recharts.ResponsiveContainer width="100%" height={300}>
                <recharts.LineChart data={marketingStats.couponDaily}>
                  <recharts.CartesianGrid strokeDasharray="3 3" />
                  <recharts.XAxis dataKey="date" />
                  <recharts.YAxis />
                  <recharts.Tooltip />
                  <recharts.Legend />
                  <recharts.Line
                    type="monotone"
                    dataKey="usage"
                    stroke="#f97316"
                    name="Coupons Used"
                  />
                </recharts.LineChart>
              </recharts.ResponsiveContainer>
            </div>

            <div
              className="rounded-2xl border p-6"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Banner Engagement Trend (7 Days)
              </h2>
              <recharts.ResponsiveContainer width="100%" height={300}>
                <recharts.BarChart data={marketingStats.bannerDaily}>
                  <recharts.CartesianGrid strokeDasharray="3 3" />
                  <recharts.XAxis dataKey="date" />
                  <recharts.YAxis />
                  <recharts.Tooltip />
                  <recharts.Legend />
                  <recharts.Bar dataKey="clicks" fill="#8884d8" name="Banner Clicks" />
                </recharts.BarChart>
              </recharts.ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* Top Performers */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Top Coupons
          </h2>
          <div className="space-y-3">
            {marketingStats.topCoupons.length ? (
              marketingStats.topCoupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {coupon.code}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`} off
                    </p>
                  </div>
                  <span className="font-bold text-orange-500">{coupon.usageCount || 0}</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-tertiary)' }}>No coupons yet</p>
            )}
          </div>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Top Banners
          </h2>
          <div className="space-y-3">
            {marketingStats.topBanners.length ? (
              marketingStats.topBanners.map((banner) => (
                <div
                  key={banner._id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {banner.banner?.title || 'Unknown'}
                  </p>
                  <span className="font-bold text-blue-500">{banner.clicks || 0}</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-tertiary)' }}>No banners yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
