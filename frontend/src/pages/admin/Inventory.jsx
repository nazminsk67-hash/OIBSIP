import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'

const initialForm = {
  name: '',
  stock: 0,
  unit: 'pcs',
  minimumStock: 0,
}

const statusLabel = (status) => {
  switch (status) {
    case 'out-of-stock':
      return 'Out of stock'
    case 'low-stock':
      return 'Low stock'
    default:
      return 'In stock'
  }
}

const statusClass = (status) => {
  if (status === 'in-stock') return 'badge badge-done'
  return 'badge badge-pending'
}

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editingItem, setEditingItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const fetchInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminApi.getInventory()
      setItems(response.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      toast.error('Unable to load ingredients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.unit.toLowerCase().includes(query)
      const matchesLowStock = !showLowStock || item.status !== 'in-stock'
      return matchesSearch && matchesLowStock
    })
  }, [items, search, showLowStock])

  const stats = useMemo(() => {
    const total = items.length
    const lowCount = items.filter((item) => item.status !== 'in-stock').length
    const outOfStock = items.filter((item) => item.status === 'out-of-stock').length
    const totalStock = items.reduce((sum, item) => sum + Number(item.stock || 0), 0)
    const averageStock = total ? Math.round(totalStock / total) : 0
    return { total, lowCount, outOfStock, averageStock }
  }, [items])

  const openForm = (item = null) => {
    if (item) {
      setEditingItem(item)
      setForm({
        name: item.name,
        stock: item.stock,
        unit: item.unit,
        minimumStock: item.minimumStock,
      })
    } else {
      setEditingItem(null)
      setForm(initialForm)
    }
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingItem(null)
    setForm(initialForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.unit.trim()) {
      toast.error('Please enter a name and unit for the ingredient')
      return
    }
    if (Number(form.stock) < 0 || Number(form.minimumStock) < 0) {
      toast.error('Stock values cannot be negative')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        unit: form.unit.trim(),
        stock: Number(form.stock),
        minimumStock: Number(form.minimumStock),
      }

      if (editingItem) {
        const response = await adminApi.updateInventoryItem(editingItem._id, payload)
        setItems((prev) => prev.map((item) => (item._id === response.data._id ? response.data : item)))
        toast.success('Ingredient updated')
      } else {
        const response = await adminApi.createInventoryItem(payload)
        setItems((prev) => [response.data, ...prev])
        toast.success('Ingredient added')
      }

      closeForm()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save ingredient')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ingredient ${item.name}?`)) {
      return
    }
    try {
      await adminApi.deleteInventoryItem(item._id)
      setItems((prev) => prev.filter((row) => row._id !== item._id))
      toast.success('Ingredient deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete ingredient')
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-24 rounded-3xl" style={{ backgroundColor: 'var(--bg-secondary)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="card rounded-3xl border p-6" style={{ borderColor: 'var(--danger-color)' }}>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Inventory unavailable</h2>
          <p className="mt-3" style={{ color: 'var(--danger-color)' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--accent-primary)' }}>Inventory</p>
          <h1 className="mt-2 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Ingredient management</h1>
          <p className="mt-2" style={{ color: 'var(--text-tertiary)' }}>Add, update, and monitor ingredient stock across the kitchen.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={() => openForm(null)}>
            Add ingredient
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowLowStock((prev) => !prev)}
          >
            {showLowStock ? 'Show all ingredients' : 'Show low stock'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card p-5 rounded-3xl border">
          <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Total ingredients</p>
          <p className="mt-3 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
        </div>
        <div className="card p-5 rounded-3xl border">
          <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Low stock</p>
          <p className="mt-3 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.lowCount}</p>
        </div>
        <div className="card p-5 rounded-3xl border">
          <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Out of stock</p>
          <p className="mt-3 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.outOfStock}</p>
        </div>
        <div className="card p-5 rounded-3xl border">
          <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-tertiary)' }}>Average stock</p>
          <p className="mt-3 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.averageStock}</p>
        </div>
      </div>

      <section className="card rounded-3xl border p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_auto]">
          <div className="space-y-2">
            <label className="label">Search ingredients</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or unit"
              className="input-field"
            />
          </div>
          <div className="flex items-end gap-3">
            {showForm ? (
              <button type="button" className="btn-secondary" onClick={closeForm}>
                Close form
              </button>
            ) : null}
          </div>
        </div>

        {showForm ? (
          <div className="card rounded-3xl border p-5 bg-surface">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {editingItem ? 'Edit ingredient' : 'New ingredient'}
            </h2>
            <form onSubmit={handleSubmit} className="form-stack-2">
              <div className="space-y-2">
                <label className="label">Ingredient name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Tomato"
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="label">Unit</label>
                <input
                  value={form.unit}
                  onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
                  placeholder="pcs / kg / liters"
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="label">Current stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                  min="0"
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="label">Minimum stock</label>
                <input
                  type="number"
                  value={form.minimumStock}
                  onChange={(e) => setForm((prev) => ({ ...prev, minimumStock: Number(e.target.value) }))}
                  min="0"
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingItem ? 'Update ingredient' : 'Add ingredient'}
                </button>
                <button type="button" className="btn-secondary" onClick={closeForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="table-responsive rounded-3xl border" style={{ borderColor: 'var(--border-color)' }}>
          <table className="table-smooth">
            <thead>
              <tr>
                <th>Ingredient Name</th>
                <th>Current Stock</th>
                <th>Unit</th>
                <th>Minimum Stock</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                    No ingredients match this search or filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item._id}>
                    <td className="font-medium">{item.name}</td>
                    <td>{item.stock}</td>
                    <td className="capitalize">{item.unit}</td>
                    <td>{item.minimumStock}</td>
                    <td>
                      <span className={statusClass(item.status)}>{statusLabel(item.status)}</span>
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        type="button"
                        className="btn-ghost text-xs py-1 px-3"
                        onClick={() => openForm(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-ghost text-xs py-1 px-3 text-danger"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
