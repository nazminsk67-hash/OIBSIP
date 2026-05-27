import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { formatPrice } from '../../utils/helpers'
import { placeOrder } from '../../redux/orderSlice'
import { clearItems } from '../../redux/cartSlice'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PaymentMethodSelector from '../../components/checkout/PaymentMethodSelector'
import { orderApi } from '../../api/orderApi'
import { selectCurrentUser } from '../../redux/authSlice'

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Razorpay SDK failed to load'))
    document.body.appendChild(script)
  })

export default function Checkout() {
  const items = useSelector((state) => state.cart.items)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const total = items.reduce((s, i) => s + (i.lineTotal || 0), 0)

  const handlePlaceOrder = async () => {
    setErrorMessage('')
    if (!address.trim() || !phone.trim()) {
      setErrorMessage('Please provide both delivery address and phone number.')
      toast.error('Please fill in all required fields')
      return
    }

    const orderPayload = {
      pizzas: items.map((i) => ({
        pizza: i.pizzaId,
        name: i.name,
        size: i.size,
        sizePrice: i.sizePrice,
        toppings: (i.toppings || []).map((t) => ({
          ingredientId: t.ingredientId,
          name: t.name,
          extraPrice: t.extraPrice,
        })),
        quantity: i.quantity,
      })),
      address,
      phone,
      paymentMethod,
      totalPrice: total,
    }

    setLoading(true)
    try {
      if (paymentMethod === 'online') {
        // Create Razorpay order on server (amount in paise)
        const amountPaise = Math.round(total * 100)
        const { data } = await orderApi.createRazorpayOrder(amountPaise)

        // Load Razorpay SDK
        await loadScript('https://checkout.razorpay.com/v1/checkout.js')

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY || '',
          amount: data.amount || amountPaise,
          currency: data.currency || 'INR',
          name: 'Pizza Delivery',
          description: 'Order payment',
          order_id: data.orderId,
          handler: async (resp) => {
            try {
              // On success, place order including Razorpay identifiers
              await dispatch(
                placeOrder({ ...orderPayload, razorpayOrderId: data.orderId, razorpayPaymentId: resp.razorpay_payment_id })
              ).unwrap()
              dispatch(clearItems())
              toast.success('🍕 Payment successful and order placed!')
              navigate('/my-orders')
            } catch (err) {
              const msg = err || 'Unable to complete order after payment.'
              setErrorMessage(msg)
              toast.error(msg)
            }
          },
          modal: { ondismiss: () => setLoading(false) },
          prefill: {
            name: currentUser?.name,
            email: currentUser?.email,
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        // Cash on delivery (existing flow)
        await dispatch(placeOrder(orderPayload)).unwrap()
        dispatch(clearItems())
        toast.success('🍕 Order placed successfully! Check your order status for live updates.')
        navigate('/my-orders')
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Order failed. Please try again.'
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
      setLoading(false)
    } finally {
      // For online payments loading is managed by modal handlers
      if (paymentMethod !== 'online') setLoading(false)
    }
  }

  if (!items.length) {
    return (
      <div className="p-6 min-h-[60vh] flex items-center justify-center">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Checkout unavailable</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900">Your cart is empty</h2>
          <p className="mt-3 text-slate-600">Add items to your cart before placing an order.</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-8 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Browse pizzas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Secure checkout</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Review your order</h2>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
          {items.length} {items.length === 1 ? 'item' : 'items'} in cart
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.75fr]">
        <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Delivery details</h3>
            <p className="mt-2 text-slate-600">Fill in your address and phone number to complete the order.</p>
          </div>

          <div className="grid gap-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-900">Delivery address *</span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete delivery address..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-1 focus:ring-primary-300"
                rows={3}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-900">Phone number *</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +91 98765 43210"
                type="tel"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-1 focus:ring-primary-300"
              />
            </label>

            <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">Error:</p>
                <p className="mt-1">{errorMessage}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 text-base font-semibold text-white transition hover:from-primary-700 hover:to-primary-800 disabled:cursor-not-allowed disabled:opacity-70 disabled:grayscale"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Placing order...
                </span>
              ) : (
                'Place order now'
              )}
            </button>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm h-fit sticky top-6">
          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Order summary</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Your cart</h3>
            </div>

            <div className="max-h-80 space-y-2 rounded-2xl bg-white p-4 overflow-y-auto shadow-sm">
              {items.map((item) => (
                <div key={item._key} className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm whitespace-nowrap">{formatPrice(item.lineTotal)}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">Total</p>
                <p className="text-2xl font-bold text-primary-600">{formatPrice(total)}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3">
              <p className="text-xs font-medium text-emerald-900">
                ✓ Your order details will be securely saved and you'll get live updates!
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}