import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { formatPrice } from '../../utils/helpers'
import { orderApi } from '../../api/orderApi'
import { clearItems } from '../../redux/cartSlice'
import { useNavigate } from 'react-router-dom'

export default function Checkout() {
  const items = useSelector(s => s.cart.items)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const total = items.reduce((s,i)=>s+(i.lineTotal||0),0)

  const handlePlaceOrder = async () => {
    if (!address) return alert('Please enter delivery address')
    setLoading(true)
    try {
      const orderPayload = {
        pizzas: items.map(i => ({
          pizza: i.pizzaId,
          name: i.name,
          size: i.size,
          sizePrice: i.sizePrice,
          toppings: (i.toppings||[]).map(t=>({ ingredientId: t.ingredientId, name: t.name, extraPrice: t.extraPrice })),
          quantity: i.quantity,
        })),
        totalPrice: total,
      }
      await orderApi.placeOrder(orderPayload)
      dispatch(clearItems())
      navigate('/orders')
    } catch (e) {
      console.error(e)
      alert('Order failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <div className="mb-4">
        <label className="block mb-1">Delivery address</label>
        <textarea value={address} onChange={e=>setAddress(e.target.value)} className="w-full p-2 border rounded" rows={4} />
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Order summary</h3>
        <div className="bg-gray-50 p-4 rounded">
          {items.map(it => (
            <div key={it._key} className="flex justify-between mb-2">
              <div>{it.name} x{it.quantity}</div>
              <div>{formatPrice(it.lineTotal)}</div>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-3">Total <span>{formatPrice(total)}</span></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handlePlaceOrder} className="btn-primary" disabled={loading}>{loading? 'Placing...':'Place order'}</button>
      </div>
    </div>
  )
}
