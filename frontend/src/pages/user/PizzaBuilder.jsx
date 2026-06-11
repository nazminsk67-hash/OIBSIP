import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { pizzaApi } from '../../api/pizzaApi'
import { addItem } from '../../redux/cartSlice'
import { formatPrice } from '../../utils/helpers'

// Deterministically generates 7 points to scatter toppings inside the cheese area
const getToppingPositions = (ingredientName) => {
  let hash = 0
  for (let i = 0; i < ingredientName.length; i++) {
    hash += ingredientName.charCodeAt(i)
  }
  const count = 8
  const positions = []
  for (let i = 0; i < count; i++) {
    const angle = (i * (2 * Math.PI) / count) + (hash * 0.15)
    // Keep radius between 18% and 38% from the center (50, 50)
    const radius = 18 + ((hash + i * 13) % 20)
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    const rotate = (hash + i * 37) % 360
    positions.push({ x, y, rotate })
  }
  return positions
}

// Renders visual representations of toppings using simple CSS shapes
const renderToppingIcon = (name) => {
  const lower = name.toLowerCase()
  if (lower.includes('pepper') && lower.includes('bell')) {
    // Curved green bell pepper slice
    return <div className="w-5 h-2.5 border-2 border-green-600 bg-green-500 rounded-full opacity-90 shadow-sm" style={{ borderRadius: '50% 50% 0 0' }} />
  } else if (lower.includes('onion')) {
    // Red onion crescent ring
    return <div className="w-6 h-6 border-2 border-red-400 rounded-full bg-transparent opacity-85" style={{ borderBottomColor: 'transparent', borderRightColor: 'transparent' }} />
  } else if (lower.includes('mushroom')) {
    // Mushroom slice
    return (
      <div className="flex flex-col items-center opacity-90">
        <div className="w-5 h-3 bg-amber-200 rounded-t-full shadow-sm" style={{ borderBottom: '1px solid #d97706' }} />
        <div className="w-2 h-2.5 bg-amber-100 rounded-b shadow-sm" />
      </div>
    )
  } else if (lower.includes('olive')) {
    // Black olive ring
    return <div className="w-4 h-4 rounded-full border-[3px] border-slate-900 bg-transparent shadow-sm opacity-90" />
  } else if (lower.includes('jalapeño') || lower.includes('jalapeno')) {
    // Green jalapeno wheel
    return (
      <div className="w-4 h-4 rounded-full border border-emerald-800 bg-emerald-600 flex items-center justify-center shadow-sm opacity-90">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-100 opacity-80" />
      </div>
    )
  } else if (lower.includes('corn')) {
    // Golden corn kernel
    return <div className="w-2.5 h-3 bg-yellow-400 border border-yellow-500 rounded-full shadow-sm opacity-90" />
  } else if (lower.includes('spinach')) {
    // Green spinach leaf
    return <div className="w-5 h-3.5 bg-emerald-800 rounded-full opacity-80 shadow-sm" style={{ borderRadius: '65% 35% 65% 35%' }} />
  } else if (lower.includes('sun-dried') || lower.includes('tomato')) {
    // Red tomato slice/strip
    return <div className="w-5.5 h-2 bg-red-700 border border-red-900 rounded shadow-sm opacity-95" />
  } else if (lower.includes('chicken')) {
    // Chicken chunk
    return <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded shadow-sm opacity-90" style={{ borderRadius: '40% 60% 45% 55%' }} />
  } else if (lower.includes('pepperoni')) {
    // Pepperoni disc
    return (
      <div className="w-6 h-6 rounded-full bg-red-600 border border-red-800 shadow-inner flex items-center justify-center opacity-95">
        <div className="w-4.5 h-4.5 rounded-full bg-red-700 opacity-30 border border-dashed border-red-950" />
      </div>
    )
  } else if (lower.includes('sausage')) {
    // Brown sausage chunk
    return <div className="w-5 h-5 rounded-full bg-amber-900 border border-amber-950 shadow-sm opacity-90" style={{ borderRadius: '45% 55% 50% 50%' }} />
  }
  // Default fallback dot
  return <div className="w-3.5 h-3.5 rounded-full bg-orange-400 border border-orange-600 shadow-sm" />
}

const getSauceColor = (sauceName) => {
  if (!sauceName) return 'transparent'
  const lower = sauceName.toLowerCase()
  if (lower.includes('marinara') || lower.includes('tomato')) return '#dc2626'
  if (lower.includes('bbq')) return '#451a03'
  if (lower.includes('pesto')) return '#15803d'
  if (lower.includes('garlic') || lower.includes('white')) return '#fef9c3'
  if (lower.includes('arrabiata') || lower.includes('spicy')) return '#b91c1c'
  return '#dc2626'
}

const getCrustBorderColor = (crustName) => {
  if (!crustName) return '#e2e8f0'
  const lower = crustName.toLowerCase()
  if (lower.includes('wheat') || lower.includes('whole')) return '#a16207'
  if (lower.includes('cheese') || lower.includes('burst')) return '#fbbf24'
  if (lower.includes('gluten') || lower.includes('free')) return '#d97706'
  if (lower.includes('thick')) return '#b45309'
  return '#c2410c'
}

const getCrustBorderWidth = (crustName) => {
  if (!crustName) return '12px'
  const lower = crustName.toLowerCase()
  if (lower.includes('thick') || lower.includes('burst')) return '24px'
  if (lower.includes('wheat') || lower.includes('whole')) return '18px'
  return '14px'
}

const getCheeseStyle = (cheeseName) => {
  if (!cheeseName) return { opacity: 0 }
  const lower = cheeseName.toLowerCase()
  let color = 'rgba(254, 240, 138, 0.65)' // Pale cheese yellow
  let opacity = 0.75
  if (lower.includes('double')) {
    opacity = 0.85
    color = 'rgba(253, 224, 71, 0.8)'
  } else if (lower.includes('cheddar')) {
    color = 'rgba(245, 158, 11, 0.7)' // Cheddar orange-yellow
  } else if (lower.includes('vegan')) {
    color = 'rgba(254, 243, 199, 0.55)' // Lighter cream
  } else if (lower.includes('parmesan')) {
    color = 'rgba(253, 253, 225, 0.6)' // Pale dry yellow
  }
  return {
    backgroundColor: color,
    opacity,
  }
}

export default function PizzaBuilder() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [options, setOptions] = useState({ bases: [], sauces: [], cheeses: [], veggies: [], meats: [] })
  
  const [currentStep, setCurrentStep] = useState(1)
  
  // Selection States
  const [selectedBase, setSelectedBase] = useState(null)
  const [selectedSauce, setSelectedSauce] = useState(null)
  const [selectedCheese, setSelectedCheese] = useState(null)
  const [selectedToppings, setSelectedToppings] = useState([])
  const [toppingCategory, setToppingCategory] = useState('veg') // 'veg' or 'meat'
  
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await pizzaApi.getBuilderOptions()
        setOptions(response.data || { bases: [], sauces: [], cheeses: [], veggies: [], meats: [] })
        
        // Auto-select first in stock options as initial selections
        const firstBase = response.data?.bases?.find(b => b.stock > 0 && b.isAvailable)
        const firstSauce = response.data?.sauces?.find(s => s.stock > 0 && s.isAvailable)
        const firstCheese = response.data?.cheeses?.find(c => c.stock > 0 && c.isAvailable)
        
        if (firstBase) setSelectedBase(firstBase)
        if (firstSauce) setSelectedSauce(firstSauce)
        if (firstCheese) setSelectedCheese(firstCheese)
      } catch (err) {
        console.error('Error fetching builder options:', err)
        setError(err.response?.data?.message || 'Failed to load pizza ingredients. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchOptions()
  }, [])

  // Price calculations
  const basePrice = selectedBase?.price || 0
  const saucePrice = selectedSauce?.price || 0
  const cheesePrice = selectedCheese?.price || 0
  const toppingsPrice = selectedToppings.reduce((sum, item) => sum + (item.price || 0), 0)
  const totalAmount = basePrice + saucePrice + cheesePrice + toppingsPrice

  const handleToppingToggle = (topping) => {
    const isSelected = selectedToppings.some((t) => t._id === topping._id)
    if (isSelected) {
      setSelectedToppings(selectedToppings.filter((t) => t._id !== topping._id))
    } else {
      setSelectedToppings([...selectedToppings, topping])
    }
  }

  const buildCartItemPayload = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) {
      toast.error('Please select Crust, Sauce, and Cheese before proceeding.')
      return null
    }

    // Custom pizza: size is "Custom", sizePrice is 0. 
    // All ingredients (crust, sauce, cheese, and extra toppings) go to toppings array.
    // This allows the checkout and order placement flows to process ingredients dynamically.
    const customItem = {
      pizzaId: null,
      name: `Custom Pizza (${selectedBase.name})`,
      size: 'Custom',
      sizePrice: 0,
      toppings: [
        { ingredientId: selectedBase._id, name: `${selectedBase.name} (Base)`, extraPrice: selectedBase.price },
        { ingredientId: selectedSauce._id, name: `${selectedSauce.name} (Sauce)`, extraPrice: selectedSauce.price },
        { ingredientId: selectedCheese._id, name: `${selectedCheese.name} (Cheese)`, extraPrice: selectedCheese.price },
        ...selectedToppings.map((t) => ({
          ingredientId: t._id,
          name: t.name,
          extraPrice: t.price,
        })),
      ],
      quantity: 1,
    }

    return customItem
  }

  const handleAddToCart = () => {
    const payload = buildCartItemPayload()
    if (!payload) return
    dispatch(addItem(payload))
    toast.success('🍕 Custom pizza added to cart!')
  }

  const handleOrderNow = () => {
    const payload = buildCartItemPayload()
    if (!payload) return
    dispatch(addItem(payload))
    toast.success('🍕 Proceeding to checkout...')
    navigate('/checkout')
  }

  const isStepValid = (step) => {
    if (step === 1) return !!selectedBase
    if (step === 2) return !!selectedSauce
    if (step === 3) return !!selectedCheese
    return true
  }

  if (loading) {
    return (
      <div className="page-shell max-w-6xl min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" style={{ borderColor: 'var(--accent-primary) transparent var(--accent-primary) transparent' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading ingredients...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell max-w-6xl min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md rounded-3xl border p-8 text-center" style={{ backgroundColor: 'var(--danger-light)', borderColor: 'var(--danger-color)', color: 'var(--danger-dark)' }}>
          <h2 className="text-xl font-bold">Failed to load builder</h2>
          <p className="mt-3 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 btn-primary px-6 py-2.5"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell max-w-6xl" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--accent-primary)' }}>Masterpiece Builder</p>
        <h2 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Build Your Own Pizza</h2>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Choose from our range of freshly prepared bases, rich sauces, premium cheeses, and garden-fresh toppings.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        
        {/* Left Side: Live Interactive Preview & Price Details */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border p-8 shadow-card sticky top-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            
            {/* Live Pizza Rendering */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center shadow-lg bg-slate-900 border-4 border-slate-950 overflow-hidden" style={{ background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)' }}>
              
              {/* Pizza Board / Peel Wood Pattern (subtle design polish) */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 10px)' }} />

              {/* Pizza Base (Crust) */}
              <div 
                className="w-[90%] h-[90%] rounded-full relative transition-all duration-500 shadow-md flex items-center justify-center"
                style={{
                  border: `${getCrustBorderWidth(selectedBase?.name)} solid ${getCrustBorderColor(selectedBase?.name)}`,
                  backgroundColor: '#fde047', // dough color
                  boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.3)',
                }}
              >
                {/* Cheese Stuffing Indicator for Cheese Burst */}
                {selectedBase?.name?.toLowerCase().includes('cheese') && (
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-200 opacity-60 animate-pulse" />
                )}

                {/* Pizza Sauce Layer */}
                <div 
                  className="w-full h-full rounded-full transition-all duration-500 relative flex items-center justify-center"
                  style={{
                    backgroundColor: getSauceColor(selectedSauce?.name),
                    transform: 'scale(0.96)',
                    boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* Pizza Cheese Layer */}
                  {selectedCheese && (
                    <div 
                      className="absolute inset-0 rounded-full transition-all duration-500"
                      style={{
                        ...getCheeseStyle(selectedCheese.name),
                        transform: 'scale(0.98)',
                        backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(180, 83, 9, 0.4) 3%, transparent 4%), radial-gradient(circle at 70% 60%, rgba(180, 83, 9, 0.4) 3%, transparent 4%), radial-gradient(circle at 45% 75%, rgba(180, 83, 9, 0.4) 3%, transparent 4%)',
                      }}
                    />
                  )}

                  {/* Toppings Scattered */}
                  {selectedToppings.map((topping) => {
                    const positions = getToppingPositions(topping.name)
                    return positions.map((pos, idx) => (
                      <div
                        key={`${topping._id}-${idx}`}
                        className="absolute transition-all duration-500 transform hover:scale-125 cursor-pointer"
                        style={{
                          top: `${pos.y}%`,
                          left: `${pos.x}%`,
                          transform: `translate(-50%, -50%) rotate(${pos.rotate}deg)`,
                        }}
                      >
                        {renderToppingIcon(topping.name)}
                      </div>
                    ))
                  })}
                </div>
              </div>
            </div>

            {/* Selected Summary Details */}
            <div className="mt-8 w-full border-t pt-6" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span>🍕</span> Your Creation Summary
              </h3>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-6">
                <div>
                  <span className="text-xs uppercase tracking-[0.05em]" style={{ color: 'var(--text-tertiary)' }}>Crust Base</span>
                  <p className="font-semibold" style={{ color: selectedBase ? 'var(--text-primary)' : 'var(--danger-color)' }}>
                    {selectedBase ? `${selectedBase.name} (+₹${selectedBase.price})` : 'Not Selected'}
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.05em]" style={{ color: 'var(--text-tertiary)' }}>Sauce</span>
                  <p className="font-semibold" style={{ color: selectedSauce ? 'var(--text-primary)' : 'var(--danger-color)' }}>
                    {selectedSauce ? `${selectedSauce.name} (+₹${selectedSauce.price})` : 'Not Selected'}
                  </p>
                </div>
                <div className="mt-2">
                  <span className="text-xs uppercase tracking-[0.05em]" style={{ color: 'var(--text-tertiary)' }}>Cheese</span>
                  <p className="font-semibold" style={{ color: selectedCheese ? 'var(--text-primary)' : 'var(--danger-color)' }}>
                    {selectedCheese ? `${selectedCheese.name} (+₹${selectedCheese.price})` : 'Not Selected'}
                  </p>
                </div>
                <div className="mt-2 col-span-1">
                  <span className="text-xs uppercase tracking-[0.05em]" style={{ color: 'var(--text-tertiary)' }}>Extra Toppings</span>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedToppings.length} selected (+{formatPrice(toppingsPrice)})
                  </p>
                </div>
              </div>

              {/* Toppings Tag List */}
              {selectedToppings.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {selectedToppings.map((t) => (
                    <span 
                      key={t._id} 
                      onClick={() => handleToppingToggle(t)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-red-50 hover:text-red-700 transition"
                      style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                    >
                      {t.name} ×
                    </span>
                  ))}
                </div>
              )}

              {/* Price Display and Actions */}
              <div className="flex items-center justify-between p-4 rounded-2xl mb-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>Live Total Amount</p>
                  <p className="text-3xl font-extrabold" style={{ color: 'var(--accent-primary)' }}>{formatPrice(totalAmount)}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">GST Included</span>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedBase || !selectedSauce || !selectedCheese}
                  className="flex-1 btn-secondary text-sm font-semibold rounded-2xl py-3"
                >
                  Add To Cart
                </button>
                <button
                  type="button"
                  onClick={handleOrderNow}
                  disabled={!selectedBase || !selectedSauce || !selectedCheese}
                  className="flex-1 btn-primary text-sm font-semibold rounded-2xl py-3"
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Step-by-Step Customization Panel */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[2.5rem] border p-6 sm:p-8 shadow-card" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            
            {/* Step Navigation Tabs */}
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              {[
                { number: 1, label: 'Crust' },
                { number: 2, label: 'Sauce' },
                { number: 3, label: 'Cheese' },
                { number: 4, label: 'Toppings' },
              ].map((step) => (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setCurrentStep(step.number)}
                  className={`flex flex-col items-center gap-1 min-w-[4rem] text-center pb-2 transition-all ${
                    currentStep === step.number 
                      ? 'border-b-2 font-bold' 
                      : 'text-slate-400 font-medium'
                  }`}
                  style={{
                    borderBottomColor: currentStep === step.number ? 'var(--accent-primary)' : 'transparent',
                    color: currentStep === step.number ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  }}
                >
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                    currentStep === step.number
                      ? 'text-white bg-primary-500'
                      : isStepValid(step.number)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                  style={{
                    backgroundColor: currentStep === step.number ? 'var(--accent-primary)' : undefined
                  }}>
                    {isStepValid(step.number) && currentStep !== step.number ? '✓' : step.number}
                  </span>
                  <span className="text-xs">{step.label}</span>
                </button>
              ))}
            </div>

            {/* STEP 1: Select Pizza Base (Crust) */}
            {currentStep === 1 && (
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Select Pizza Crust</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>A great pizza starts with a perfect crust. Choose your favorite base style (Minimum 5 options):</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {options.bases.map((base) => {
                    const isSelected = selectedBase?._id === base._id
                    const isOutOfStock = base.stock <= 0 || !base.isAvailable
                    
                    return (
                      <div
                        key={base._id}
                        onClick={() => !isOutOfStock && setSelectedBase(base)}
                        className={`option-card relative p-4 flex flex-col justify-between min-h-[5.5rem] rounded-2xl border text-left transition cursor-pointer select-none ${
                          isSelected ? 'option-card-selected' : ''
                        } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        role="button"
                        aria-pressed={isSelected}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{base.name}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                              {isOutOfStock ? 'Currently out of stock' : `In Stock: ${base.stock}`}
                            </p>
                          </div>
                          <span className="font-extrabold text-sm" style={{ color: 'var(--accent-primary)' }}>
                            +₹{base.price}
                          </span>
                        </div>
                        
                        {isOutOfStock ? (
                          <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger-dark)' }}>
                            Unavailable
                          </span>
                        ) : (
                          isSelected && (
                            <span className="absolute bottom-2 right-2 text-xs text-primary-500 font-bold" style={{ color: 'var(--accent-primary)' }}>
                              Selected ✓
                            </span>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Select Sauce */}
            {currentStep === 2 && (
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Select Pizza Sauce</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Add some character to your crust with our slow-simmered sauces (Minimum 5 options):</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {options.sauces.map((sauce) => {
                    const isSelected = selectedSauce?._id === sauce._id
                    const isOutOfStock = sauce.stock <= 0 || !sauce.isAvailable
                    
                    return (
                      <div
                        key={sauce._id}
                        onClick={() => !isOutOfStock && setSelectedSauce(sauce)}
                        className={`option-card relative p-4 flex flex-col justify-between min-h-[5.5rem] rounded-2xl border text-left transition cursor-pointer select-none ${
                          isSelected ? 'option-card-selected' : ''
                        } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        role="button"
                        aria-pressed={isSelected}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{sauce.name}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                              {isOutOfStock ? 'Currently out of stock' : `In Stock: ${sauce.stock}`}
                            </p>
                          </div>
                          <span className="font-extrabold text-sm" style={{ color: 'var(--accent-primary)' }}>
                            +₹{sauce.price}
                          </span>
                        </div>
                        
                        {isOutOfStock ? (
                          <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger-dark)' }}>
                            Unavailable
                          </span>
                        ) : (
                          isSelected && (
                            <span className="absolute bottom-2 right-2 text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                              Selected ✓
                            </span>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Select Cheese */}
            {currentStep === 3 && (
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Select Cheese Layer</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Melted cheese makes everything better. Select your gooey cheese layer (Minimum 5 options):</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {options.cheeses.map((cheese) => {
                    const isSelected = selectedCheese?._id === cheese._id
                    const isOutOfStock = cheese.stock <= 0 || !cheese.isAvailable
                    
                    return (
                      <div
                        key={cheese._id}
                        onClick={() => !isOutOfStock && setSelectedCheese(cheese)}
                        className={`option-card relative p-4 flex flex-col justify-between min-h-[5.5rem] rounded-2xl border text-left transition cursor-pointer select-none ${
                          isSelected ? 'option-card-selected' : ''
                        } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        role="button"
                        aria-pressed={isSelected}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{cheese.name}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                              {isOutOfStock ? 'Currently out of stock' : `In Stock: ${cheese.stock}`}
                            </p>
                          </div>
                          <span className="font-extrabold text-sm" style={{ color: 'var(--accent-primary)' }}>
                            +₹{cheese.price}
                          </span>
                        </div>
                        
                        {isOutOfStock ? (
                          <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger-dark)' }}>
                            Unavailable
                          </span>
                        ) : (
                          isSelected && (
                            <span className="absolute bottom-2 right-2 text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                              Selected ✓
                            </span>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Select Veggies / Meat Toppings */}
            {currentStep === 4 && (
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Choose Toppings</h3>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Mix & match toppings. Select as many as you like!</p>
                  </div>
                  
                  {/* Veg vs Meat toggle tab */}
                  <div className="flex rounded-full p-1 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => setToppingCategory('veg')}
                      className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${
                        toppingCategory === 'veg'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      style={{
                        backgroundColor: toppingCategory === 'veg' ? 'var(--text-primary)' : undefined,
                        color: toppingCategory === 'veg' ? 'var(--bg-primary)' : undefined
                      }}
                    >
                      🌱 Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setToppingCategory('meat')}
                      className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${
                        toppingCategory === 'meat'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      style={{
                        backgroundColor: toppingCategory === 'meat' ? 'var(--text-primary)' : undefined,
                        color: toppingCategory === 'meat' ? 'var(--bg-primary)' : undefined
                      }}
                    >
                      🥩 Meat
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(toppingCategory === 'veg' ? options.veggies : options.meats).map((topping) => {
                    const isSelected = selectedToppings.some((t) => t._id === topping._id)
                    const isOutOfStock = topping.stock <= 0 || !topping.isAvailable
                    
                    return (
                      <div
                        key={topping._id}
                        onClick={() => !isOutOfStock && handleToppingToggle(topping)}
                        className={`option-card relative p-4 flex flex-col justify-between min-h-[5.5rem] rounded-2xl border text-left transition cursor-pointer select-none ${
                          isSelected ? 'option-card-selected' : ''
                        } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        role="button"
                        aria-pressed={isSelected}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{topping.name}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                              {isOutOfStock ? 'Currently out of stock' : `In Stock: ${topping.stock}`}
                            </p>
                          </div>
                          <span className="font-extrabold text-sm" style={{ color: 'var(--accent-primary)' }}>
                            +₹{topping.price}
                          </span>
                        </div>
                        
                        {isOutOfStock ? (
                          <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger-dark)' }}>
                            Unavailable
                          </span>
                        ) : (
                          isSelected && (
                            <span className="absolute bottom-2 right-2 text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                              Selected ✓
                            </span>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="mt-8 pt-6 border-t flex justify-between gap-4" style={{ borderColor: 'var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="btn-secondary flex-1 rounded-2xl py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                disabled={currentStep === 4}
                className="btn-primary flex-1 rounded-2xl py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step →
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  )
}
