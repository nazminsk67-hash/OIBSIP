import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { formatPrice } from '../../utils/helpers'
import { removeItem, updateItemQuantity, clearItems } from '../../redux/cartSlice'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const items = useSelector(state => state.cart.items)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const subTotal = items.reduce((sum, item) => sum + (item.lineTotal || 0), 0)

  if (!items.length) return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold">Your cart is empty</h2>
      <p className="text-gray-500 mt-2">Add pizza to your cart to continue.</p>
      <button onClick={() => navigate('/dashboard')} className="btn-primary mt-6">Browse pizzas</button>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      <div className="space-y-4 mb-6">
        {items.map(item => (
          <div key={item._key} className="p-4 border rounded flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{item.name} — {item.size}</div>
              {item.toppings?.length > 0 && (
                <div className="text-sm text-gray-600">{item.toppings.map(t => t.name).join(', ')}</div>
              )}
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm">Qty</label>
                <input type="number" value={item.quantity} min="1" onChange={e => dispatch(updateItemQuantity({ key: item._key, quantity: Number(e.target.value) || 1 }))} className="w-20 p-1 border rounded" />
              </div>
              <div className="font-semibold">{formatPrice(item.lineTotal)}</div>
              <button className="text-sm text-red-500 hover:underline" onClick={() => dispatch(removeItem(item._key))}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Subtotal</div>
          <div className="text-xl font-bold">{formatPrice(subTotal)}</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full sm:w-auto">Checkout</button>
          <button onClick={() => dispatch(clearItems())} className="btn-ghost w-full sm:w-auto">Clear Cart</button>
        </div>
      </div>
    </div>
  )
}
