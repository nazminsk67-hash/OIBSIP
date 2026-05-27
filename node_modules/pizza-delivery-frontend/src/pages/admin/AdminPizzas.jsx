import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  fetchAdminPizzas,
  createPizza,
  updatePizza,
  deletePizza,
  selectPizzas,
  selectPizzaLoading,
  selectPizzaError,
} from '../../redux/pizzaSlice'
import Loader from '../../components/common/Loader'
import AdminPizzaForm from '../../components/pizza/AdminPizzaForm'
import { formatPrice } from '../../utils/helpers'

const statusClass = (available) =>
  available ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'

export default function AdminPizzas() {
  const dispatch = useDispatch()
  const pizzas = useSelector(selectPizzas)
  const loading = useSelector(selectPizzaLoading)
  const error = useSelector(selectPizzaError)
  const [activePizza, setActivePizza] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchAdminPizzas())
  }, [dispatch])

  const selectedPizza = useMemo(
    () => pizzas.find((pizza) => pizza._id === activePizza),
    [pizzas, activePizza]
  )

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(pizzas.map((pizza) => pizza.category || 'classic')))],
    [pizzas]
  )

  const filteredPizzas = useMemo(() => {
    const lowerSearch = searchText.trim().toLowerCase()
    return pizzas.filter((pizza) => {
      const matchesSearch =
        !lowerSearch ||
        pizza.name.toLowerCase().includes(lowerSearch) ||
        (pizza.category || '').toLowerCase().includes(lowerSearch)
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' ? pizza.isAvailable : !pizza.isAvailable)
      const matchesCategory =
        categoryFilter === 'all' ||
        (pizza.category || 'classic').toLowerCase() === categoryFilter.toLowerCase()
      return matchesSearch && matchesAvailability && matchesCategory
    })
  }, [pizzas, searchText, availabilityFilter, categoryFilter])

  const handleCreate = async (data) => {
    try {
      setSubmitting(true)
      await dispatch(createPizza(data)).unwrap()
      toast.success('Pizza created successfully')
      setShowForm(false)
    } catch (err) {
      toast.error(err || 'Unable to create pizza')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (data) => {
    try {
      setSubmitting(true)
      await dispatch(updatePizza({ id: selectedPizza._id, payload: data })).unwrap()
      toast.success('Pizza updated successfully')
      setActivePizza(null)
      setShowForm(false)
    } catch (err) {
      toast.error(err || 'Unable to update pizza')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (pizzaId) => {
    if (!window.confirm('Delete this pizza?')) return
    try {
      setSubmitting(true)
      await dispatch(deletePizza(pizzaId)).unwrap()
      toast.success('Pizza deleted successfully')
    } catch (err) {
      toast.error(err || 'Unable to delete pizza')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleAvailability = async (pizza) => {
    try {
      setSubmitting(true)
      await dispatch(updatePizza({ id: pizza._id, payload: { isAvailable: !pizza.isAvailable } })).unwrap()
      toast.success(
        pizza.isAvailable ? 'Pizza hidden from customers' : 'Pizza is now available'
      )
    } catch (err) {
      toast.error(err || 'Unable to update availability')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader fullScreen />

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-primary-600">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Pizza catalog</h1>
          <p className="mt-2 text-slate-600">Create, edit, and manage menu items from a single dashboard.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setActivePizza(null)
            setShowForm(true)
          }}
          className="rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Add pizza
        </button>
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_0.85fr_0.85fr]">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by pizza or category"
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
        />
        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
        >
          <option value="all">All pizzas</option>
          <option value="available">Available</option>
          <option value="hidden">Hidden</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {filteredPizzas.length ? (
            filteredPizzas.map((pizza) => (
              <div key={pizza._id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{pizza.name}</h2>
                    <p className="mt-2 text-sm text-slate-500">{pizza.category || 'Classic'}</p>
                    <p className="mt-2 text-sm text-slate-600">{formatPrice(pizza.basePrice || pizza.price || 0)} starting price</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(pizza.isAvailable)}`}>
                    {pizza.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {pizza.image && (
                  <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
                    <img
                      src={pizza.image}
                      alt={pizza.name}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                    {pizza.sizes?.length ? `${pizza.sizes.length} sizes` : 'Single size'}
                  </div>
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                    {pizza.category || 'Classic'}
                  </div>
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                    {formatPrice(pizza.basePrice || pizza.price || 0)} starting
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePizza(pizza._id)
                      setShowForm(true)
                    }}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(pizza)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${pizza.isAvailable ? 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                  >
                    {pizza.isAvailable ? 'Hide' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pizza._id)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
              No pizzas found. Add your first menu item to populate the catalog.
            </div>
          )}
        </div>

        {showForm && (
          <div>
            <AdminPizzaForm
              pizza={selectedPizza}
              onSubmit={selectedPizza ? handleUpdate : handleCreate}
              onCancel={() => setShowForm(false)}
              submitting={submitting}
            />
          </div>
        )}
      </div>
    </div>
  )
}
