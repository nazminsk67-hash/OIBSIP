import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PizzaCard from '../../components/pizza/PizzaCard'
import Loader from '../../components/common/Loader'
import {
  fetchPizzas,
  selectPizzas,
  selectPizzaLoading,
  selectPizzaError,
} from '../../redux/pizzaSlice'

const defaultCategories = ['All', 'Veg', 'Non-Veg', 'Special']
const normalizeCategory = (value) =>
  value?.toString().toLowerCase().replace(/[^a-z]/g, '')

export default function PizzaList() {
  const dispatch = useDispatch()
  const pizzas = useSelector(selectPizzas)
  const loading = useSelector(selectPizzaLoading)
  const error = useSelector(selectPizzaError)

  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortOption, setSortOption] = useState('newest')
  const [availability, setAvailability] = useState('all')
  const [vegFilter, setVegFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    dispatch(fetchPizzas())
  }, [dispatch])

  const categories = useMemo(() => {
    const unique = new Set(pizzas.map((pizza) => normalizeCategory(pizza.category || 'classic')))
    return Array.from(unique)
      .filter(Boolean)
      .map((category) => category.replace(/(^|\s)\S/g, (t) => t.toUpperCase()))
      .reduce((acc, value) => {
        if (!acc.includes(value) && !['Veg', 'Non-Veg', 'Special'].includes(value)) {
          acc.push(value)
        }
        return acc
      }, ['All', 'Veg', 'Non-Veg', 'Special'])
  }, [pizzas])

  const filteredPizzas = useMemo(() => {
    let items = pizzas || []
    const search = searchText.trim().toLowerCase()

    if (selectedCategory !== 'All') {
      const filterKey = normalizeCategory(selectedCategory)
      items = items.filter((pizza) => normalizeCategory(pizza.category).includes(filterKey))
    }

    if (availability !== 'all') {
      const allowAvailable = availability === 'available'
      items = items.filter((pizza) => (pizza.isAvailable ?? true) === allowAvailable)
    }

    if (vegFilter === 'veg') {
      items = items.filter((pizza) => /veg/i.test(pizza.category || ''))
    } else if (vegFilter === 'nonveg') {
      items = items.filter((pizza) => !/veg/i.test(pizza.category || ''))
    }

    if (search) {
      items = items.filter((pizza) =>
        pizza.name?.toLowerCase().includes(search) ||
        pizza.description?.toLowerCase().includes(search) ||
        pizza.category?.toLowerCase().includes(search)
      )
    }

    if (sortOption === 'price-asc') {
      items = [...items].sort((a, b) => {
        const aPrice = a.basePrice ?? a.price ?? 0
        const bPrice = b.basePrice ?? b.price ?? 0
        return aPrice - bPrice
      })
    }

    if (sortOption === 'price-desc') {
      items = [...items].sort((a, b) => {
        const aPrice = a.basePrice ?? a.price ?? 0
        const bPrice = b.basePrice ?? b.price ?? 0
        return bPrice - aPrice
      })
    }

    if (sortOption === 'alphabetical') {
      items = [...items].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }

    if (sortOption === 'newest') {
      items = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    return items
  }, [pizzas, searchText, selectedCategory, sortOption, availability, vegFilter])

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-80 rounded-[2rem] bg-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Unable to load pizzas</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-primary-600">Menu</p>
            <h1 className="text-3xl font-bold text-slate-900">Pizza Menu</h1>
            <p className="mt-2 text-slate-600 max-w-2xl">Search, filter and order from our freshest pizzas.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search pizzas, toppings, categories..."
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500"
            >
              <option value="all">All availability</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 md:hidden"
          >
            Filters
          </button>
          <button
            type="button"
            onClick={() => setVegFilter('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${vegFilter === 'all' ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setVegFilter('veg')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${vegFilter === 'veg' ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Veg
          </button>
          <button
            type="button"
            onClick={() => setVegFilter('nonveg')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${vegFilter === 'nonveg' ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Non-Veg
          </button>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="relative ml-auto w-11/12 max-w-sm bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-sm text-slate-600">Close</button>
            </div>
            <div className="mt-4 space-y-4">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                <option value="all">All availability</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => { setVegFilter('all'); setShowFilters(false) }} className="flex-1 rounded-full bg-slate-100 px-4 py-2">All</button>
                <button onClick={() => { setVegFilter('veg'); setShowFilters(false) }} className="flex-1 rounded-full bg-slate-100 px-4 py-2">Veg</button>
                <button onClick={() => { setVegFilter('nonveg'); setShowFilters(false) }} className="flex-1 rounded-full bg-slate-100 px-4 py-2">Non-Veg</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!filteredPizzas.length ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-lg font-semibold text-slate-900">
            No pizzas match your search.
          </p>
          <p className="mt-2 text-slate-500">Try another keyword, filter, or category.</p>
          <button
            type="button"
            onClick={() => {
              setSearchText('')
              setSelectedCategory('All')
              setVegFilter('all')
              setAvailability('all')
            }}
            className="mt-6 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPizzas.map((pizza) => (
            <PizzaCard key={pizza._id} pizza={pizza} />
          ))}
        </div>
      )}
    </div>
  )
}
