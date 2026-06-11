import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { bannerApi } from '../../api/bannerApi'
import { notifyNewBanner } from '../../utils/marketingNotifications'

const initialForm = {
  title: '',
  subtitle: '',
  ctaText: '',
  ctaLink: '',
  imageUrl: '',
  active: true,
}

export default function AdminBanners() {
  const dispatch = useDispatch()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editingBanner, setEditingBanner] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const response = await bannerApi.getBanners()
      setBanners(response.data)
    } catch (err) {
      toast.error('Unable to load banners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const activeBannerCount = useMemo(() => banners.filter((b) => b.active).length, [banners])

  const openForm = (banner = null) => {
    if (banner) {
      setEditingBanner(banner)
      setForm({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        ctaText: banner.ctaText || '',
        ctaLink: banner.ctaLink || '',
        imageUrl: banner.imageUrl || '',
        active: banner.active,
      })
    } else {
      setEditingBanner(null)
      setForm(initialForm)
    }
    setImageFile(null)
    setShowForm(true)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      setImageFile(file)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Banner title is required')
      return
    }

    setSaving(true)
    try {
      let imageUrl = form.imageUrl

      // If new image selected, upload to Cloudinary via base64
      if (imageFile) {
        setUploading(true)
        const reader = new FileReader()
        reader.onload = async (event) => {
          const base64 = event.target?.result
          try {
            // For now, use a placeholder image service or Cloudinary direct upload
            // In production, send to backend to upload to Cloudinary
            imageUrl = base64 // temporary - use actual Cloudinary upload
            const payload = {
              title: form.title.trim(),
              subtitle: form.subtitle.trim(),
              ctaText: form.ctaText.trim(),
              ctaLink: form.ctaLink.trim(),
              imageUrl,
              active: Boolean(form.active),
            }

            if (editingBanner) {
              const response = await bannerApi.updateBanner(editingBanner._id, payload)
              setBanners((prev) => prev.map((b) => (b._id === response.data._id ? response.data : b)))
              toast.success('Banner updated successfully')
            } else {
              const response = await bannerApi.createBanner(payload)
              setBanners((prev) => [response.data, ...prev])
              if (payload.active) notifyNewBanner(dispatch, response.data.title || payload.title)
              toast.success('Banner created successfully')
            }

            setShowForm(false)
            setEditingBanner(null)
            setForm(initialForm)
            setImageFile(null)
          } catch (err) {
            toast.error(err.response?.data?.message || 'Unable to upload image')
          } finally {
            setUploading(false)
          }
        }
        reader.readAsDataURL(imageFile)
      } else {
        // No new image
        const payload = {
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          ctaText: form.ctaText.trim(),
          ctaLink: form.ctaLink.trim(),
          imageUrl,
          active: Boolean(form.active),
        }

        if (editingBanner) {
          const response = await bannerApi.updateBanner(editingBanner._id, payload)
          setBanners((prev) => prev.map((b) => (b._id === response.data._id ? response.data : b)))
          toast.success('Banner updated successfully')
        } else {
          const response = await bannerApi.createBanner(payload)
          setBanners((prev) => [response.data, ...prev])
          if (payload.active) notifyNewBanner(dispatch, response.data.title || payload.title)
          toast.success('Banner created successfully')
        }

        setShowForm(false)
        setEditingBanner(null)
        setForm(initialForm)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save banner')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (banner) => {
    if (!window.confirm(`Delete banner "${banner.title}"?`)) return
    try {
      await bannerApi.deleteBanner(banner._id)
      setBanners((prev) => prev.filter((b) => b._id !== banner._id))
      toast.success('Banner deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete banner')
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-primary-600">Marketing</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Banner management</h1>
          <p className="mt-2 text-slate-600">Create and manage promotional banners displayed on the homepage.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => openForm(null)}>
          New banner
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Total banners</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{banners.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Active</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-700">{activeBannerCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Inactive</p>
          <p className="mt-3 text-3xl font-semibold text-slate-400">{banners.length - activeBannerCount}</p>
        </div>
      </div>

      {showForm && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              {editingBanner ? 'Edit banner' : 'Create new banner'}
            </h2>
            <button
              type="button"
              className="text-sm font-semibold text-slate-600"
              onClick={() => {
                setShowForm(false)
                setEditingBanner(null)
              }}
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSave} className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>Banner title</span>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Summer Sale"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Subtitle</span>
              <input
                value={form.subtitle}
                onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                placeholder="e.g., Get 30% off"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>CTA Button Text</span>
              <input
                value={form.ctaText}
                onChange={(e) => setForm((prev) => ({ ...prev, ctaText: e.target.value }))}
                placeholder="e.g., Shop Now"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>CTA Link</span>
              <input
                value={form.ctaLink}
                onChange={(e) => setForm((prev) => ({ ...prev, ctaLink: e.target.value }))}
                placeholder="e.g., /pizzas"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500"
              />
            </label>
            <label className="space-y-2 text-sm lg:col-span-2">
              <span>Banner image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />
              {form.imageUrl && !imageFile && (
                <p className="text-xs text-slate-500">Current: {form.imageUrl.substring(0, 50)}...</p>
              )}
              {imageFile && <p className="text-xs text-emerald-600">New image selected: {imageFile.name}</p>}
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm lg:col-span-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
              />
              <span>Active</span>
            </label>
            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving || uploading ? 'Saving…' : editingBanner ? 'Update banner' : 'Create banner'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {banners.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="text-sm text-slate-500">No banners yet. Create your first promotional banner.</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                {banner.imageUrl && (
                  <img src={banner.imageUrl} alt={banner.title} className="h-32 w-48 rounded-2xl object-cover" />
                )}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{banner.title}</h3>
                      {banner.subtitle && <p className="text-sm text-slate-600">{banner.subtitle}</p>}
                      {banner.ctaText && (
                        <div className="mt-3 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                          {banner.ctaText}
                        </div>
                      )}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${banner.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" className="btn-secondary" onClick={() => openForm(banner)}>
                      Edit
                    </button>
                    <button type="button" className="btn-danger" onClick={() => handleDelete(banner)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
