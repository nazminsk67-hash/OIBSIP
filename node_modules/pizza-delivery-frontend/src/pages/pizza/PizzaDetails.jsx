import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { pizzaApi } from '../../api/pizzaApi'
import { formatPrice } from '../../utils/helpers'
import { useDispatch } from 'react-redux'
import { addItem } from '../../redux/cartSlice'

export default function PizzaDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [pizza, setPizza] = useState(null)
  const [size, setSize] = useState(null)
  const [toppings, setToppings] = useState([])
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    pizzaApi.getPizzaById(id).then(r => {
      setPizza(r.data)
      if (r.data.sizes && r.data.sizes.length) setSize(r.data.sizes[0].name)
    }).catch(() => {})
  }, [id])

  if (!pizza) return <div className="p-8">Loading…</div>

  const selectedSizeObj = pizza.sizes?.find(s => s.name === size) || { price: 0 }
  const toppingsList = pizza.toppings || []

  const toggleTopping = (t) => {
    const exists = toppings.find(x => x.ingredientId === t.ingredientId)
    if (exists) setToppings(toppings.filter(x => x.ingredientId !== t.ingredientId))
    else setToppings([...toppings, t])
  }

  const linePrice = (selectedSizeObj.price || 0) + toppings.reduce((s,t)=>s+(t.extraPrice||0),0)

  const handleAdd = () => {
    dispatch(addItem({
      pizzaId: pizza._id,
      name: pizza.name,
      size,
      sizePrice: selectedSizeObj.price,
      toppings,
      quantity,
    }))
    navigate('/cart')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button className="mb-4 text-sm text-gray-500" onClick={() => navigate(-1)}>Back</button>
      <h1 className="text-2xl font-bold mb-2">{pizza.name}</h1>
      <p className="text-gray-600 mb-4">{pizza.description}</p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Size</label>
        <div className="flex gap-2">
          {pizza.sizes?.map(s => (
            <button key={s.name} onClick={() => setSize(s.name)}
              className={`px-3 py-2 rounded ${size===s.name? 'bg-primary-600 text-white':'bg-gray-100'}`}>
              {s.name} ({formatPrice(s.price)})
            </button>
          ))}
        </div>
      </div>

      {toppingsList.length>0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Toppings</label>
          <div className="grid grid-cols-2 gap-2">
            {toppingsList.map(t => (
              <button key={t.ingredientId} onClick={() => toggleTopping(t)}
                className={`px-2 py-1 rounded ${toppings.find(x=>x.ingredientId===t.ingredientId)? 'bg-primary-100':'bg-gray-100'}`}>
                {t.name} (+{formatPrice(t.extraPrice)})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm">Quantity</label>
        <input type="number" min="1" value={quantity} onChange={e=>setQuantity(Number(e.target.value)||1)} className="w-20 p-2 border rounded" />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">{formatPrice(linePrice)}</div>
        <div className="flex items-center gap-3">
          <button onClick={handleAdd} className="btn-primary">Add to cart</button>
        </div>
      </div>
    </div>
  )
}
