import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { formatPrice } from '../../utils/helpers'
import { placeOrder } from '../../redux/orderSlice'
import { clearItems } from '../../redux/cartSlice'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Checkout() {
  const items = useSelector((state) => state.cart.items)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)

  const total = items.reduce((s, i) => s + (i.lineTotal || 0), 0)

  const handlePlaceOrder = async () => {
    if (!address || !phone) {
      toast.error('Please provide address and phone number.')
      return
    }

    const orderPayload = {
      pizzas: items.map(i => ({
        pizza: i.pizzaId,
        name: i.name,
        size: i.size,
        sizePrice: i.sizePrice,
        toppings: (i.toppings || []).map(t => ({ ingredientId: t.ingredientId, name: t.name, extraPrice: t.extraPrice })),
        quantity: i.quantity,
      })),
      address,
      phone,
      paymentMethod,
      totalPrice: total,
    }

    setLoading(true)
    try {
      await dispatch(placeOrder(orderPayload)).unwrap()
      dispatch(clearItems())
      toast.success('Order placed successfully!')
      navigate('/my-orders')
    } catch (err) {
      toast.error(err || 'Order failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Delivery address</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 border rounded-lg" rows={4} />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Phone number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="123-456-7890" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Payment method</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full p-3 border rounded-lg">
              <option value="cash">Cash on Delivery</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          <button onClick={handlePlaceOrder} className="btn-primary w-full" disabled={loading}>{loading ? 'Placing order...' : 'Place order'}</button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Order summary</h3>
          <div className="space-y-3">
            {items.map(it => (
              <div key={it._key} className="flex justify-between gap-4 text-sm">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-gray-500">{it.size} x{it.quantity}</div>
                </div>
                <div className="font-semibold">{formatPrice(it.lineTotal)}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t pt-4 text-base font-semibold flex items-center justify-between">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
