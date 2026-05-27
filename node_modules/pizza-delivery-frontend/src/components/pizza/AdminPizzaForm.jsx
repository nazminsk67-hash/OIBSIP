import { useEffect, useMemo, useState } from 'react'
import { formatPrice } from '../../utils/helpers'
import { uploadImageToCloudinary } from '../../utils/cloudinary'

const defaultSize = { name: 'Regular', price: 0 }
const emptyTopping = { name: '', extraPrice: 0 }

export default function AdminPizzaForm({ pizza, onSubmit, onCancel, submitting }) {
  const [name, setName] = useState(pizza?.name || '')
  const [description, setDescription] = useState(pizza?.description || '')
  const [image, setImage] = useState(pizza?.image || '')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(pizza?.image || '')
  const [isUploading, setIsUploading] = useState(false)
  const [category, setCategory] = useState(pizza?.category || 'classic')
  const [basePrice, setBasePrice] = useState(pizza?.basePrice ?? pizza?.price ?? 0)
  const [sizes, setSizes] = useState(pizza?.sizes?.length ? pizza.sizes : [defaultSize])
  const [toppings, setToppings] = useState(pizza?.toppings?.length ? pizza.toppings.map((t) => ({ name: t.name, extraPrice: t.extraPrice })) : [emptyTopping])
  const [isAvailable, setIsAvailable] = useState(pizza?.isAvailable ?? true)
  const [error, setError] = useState('')

  useEffect(() => {
    setName(pizza?.name || '')
    setDescription(pizza?.description || '')
    setImage(pizza?.image || '')
    setPreviewUrl(pizza?.image || '')
    setFile(null)
    setCategory(pizza?.category || 'classic')
    setBasePrice(pizza?.basePrice ?? pizza?.price ?? 0)
    setSizes(pizza?.sizes?.length ? pizza.sizes : [defaultSize])
    setToppings(pizza?.toppings?.length ? pizza.toppings.map((t) => ({ name: t.name, extraPrice: t.extraPrice })) : [emptyTopping])
    setIsAvailable(pizza?.isAvailable ?? true)
    setError('')
  }, [pizza])

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const validSizes = useMemo(
    () => sizes.filter((item) => item.name.trim()),
    [sizes]
  )

  const handleAddSize = () => setSizes([...sizes, { name: '', price: 0 }])
  const handleRemoveSize = (index) => setSizes(sizes.filter((_, idx) => idx !== index))
  const handleSizeChange = (index, field, value) => {
    const next = [...sizes]
    next[index] = {
      ...next[index],
      [field]: field === 'price' ? Number(value) : value,
    }
    setSizes(next)
  }

  const handleAddTopping = () => setToppings([...toppings, emptyTopping])
  const handleRemoveTopping = (index) => setToppings(toppings.filter((_, idx) => idx !== index))
  const handleToppingChange = (index, field, value) => {
    const next = [...toppings]
    next[index] = {
      ...next[index],
      [field]: field === 'extraPrice' ? Number(value) : value,
    }
    setToppings(next)
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Pizza name is required')
      return
    }

    if (validSizes.length === 0) {
      setError('Add at least one size')
      return
    }

    let imageUrl = image.trim()

    if (file) {
      setIsUploading(true)
      try {
        const uploadResult = await uploadImageToCloudinary(file)
        imageUrl = uploadResult.secure_url || uploadResult.url || imageUrl
      } catch (err) {
        setError(err.message || 'Image upload failed')
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      image: imageUrl,
      category: category.trim() || 'classic',
      basePrice: Number(basePrice) || 0,
      sizes: validSizes,
      toppings: toppings.filter((item) => item.name.trim()),
      isAvailable,
    })
  }

  return (
    <form onSubmit={submitForm} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-900">{pizza ? 'Edit pizza' : 'Add new pizza'}</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {isAvailable ? 'Available' : 'Hidden'}
          </span>
        </div>
        <p className="text-sm text-slate-500">Manage pizza details, image URL, pricing and toppings in one place.</p>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Pizza name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
            placeholder="Margherita"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
            placeholder="Veg, Non-Veg, Special"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
          placeholder="Describe what makes this pizza special."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Image URL</span>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
            placeholder="https://..."
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Base price</span>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
          />
        </label>
      </div>
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Upload image</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:hover:bg-primary-700"
        />
        <p className="text-xs text-slate-500">Choose a local image to upload, or use the URL above.</p>
      </label>

      {previewUrl && (
        <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Preview</p>
          <img src={previewUrl} alt="Pizza preview" className="h-56 w-full rounded-3xl object-cover" />
        </div>
      )}

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Sizes</h4>
            <p className="text-xs text-slate-500">Add size options with prices.</p>
          </div>
          <button
            type="button"
            onClick={handleAddSize}
            className="rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
          >
            + Add size
          </button>
        </div>

        <div className="space-y-3">
          {sizes.map((item, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1.4fr_1fr_auto]">
              <input
                value={item.name}
                onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500"
                placeholder="Size name"
              />
              <input
                type="number"
                value={item.price}
                onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500"
                placeholder="Price"
              />
              <button
                type="button"
                onClick={() => handleRemoveSize(index)}
                className="rounded-full bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-200"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Toppings</h4>
            <p className="text-xs text-slate-500">Optional extra toppings for this pizza.</p>
          </div>
          <button
            type="button"
            onClick={handleAddTopping}
            className="rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
          >
            + Add topping
          </button>
        </div>

        <div className="space-y-3">
          {toppings.map((item, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1.4fr_1fr_auto]">
              <input
                value={item.name}
                onChange={(e) => handleToppingChange(index, 'name', e.target.value)}
                className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500"
                placeholder="Topping name"
              />
              <input
                type="number"
                value={item.extraPrice}
                onChange={(e) => handleToppingChange(index, 'extraPrice', e.target.value)}
                className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500"
                placeholder="Extra price"
              />
              <button
                type="button"
                onClick={() => handleRemoveTopping(index)}
                className="rounded-full bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-200"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
        <input
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-slate-700">Available for online ordering</span>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? 'Uploading image...' : pizza ? 'Update pizza' : 'Create pizza'}
        </button>
      </div>
    </form>
  )
}
