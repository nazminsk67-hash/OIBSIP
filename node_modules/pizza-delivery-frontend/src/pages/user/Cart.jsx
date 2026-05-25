import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { formatPrice } from '../../utils/helpers'
import { removeItem, updateItemQuantity, clearItems } from '../../redux/cartSlice'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const items = useSelector(s => s.cart.items)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const subTotal = items.reduce((s,i)=>s+(i.lineTotal||0),0)

  if (!items.length) return (
    <div className="p-8">Your cart is empty</div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      <div className="space-y-4 mb-6">
        {items.map(item => (
          <div key={item._key} className="p-4 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{item.name} — {item.size}</div>
              <div className="text-sm text-gray-600">{item.toppings?.map(t=>t.name).join(', ')}</div>
            </div>
            <div className="flex items-center gap-4">
              <input type="number" value={item.quantity} min="1" onChange={e=>dispatch(updateItemQuantity({ key: item._key, quantity: Number(e.target.value)||1 }))} className="w-20 p-1 border rounded" />
              <div className="font-semibold">{formatPrice(item.lineTotal)}</div>
              <button className="text-red-500" onClick={() => dispatch(removeItem(item._key))}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">Subtotal: {formatPrice(subTotal)}</div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/checkout')} className="btn-primary">Checkout</button>
          <button onClick={() => dispatch(clearItems())} className="btn-ghost">Clear</button>
        </div>
      </div>
    </div>
  )
}
