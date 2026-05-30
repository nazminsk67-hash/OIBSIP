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
      <div className="p-6 min-h-[60vh] flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-dashed p-10 text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-sm uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>Checkout unavailable</p>
          <h2 className="mt-4 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Your cart is empty</h2>
          <p className="mt-3" style={{ color: 'var(--text-tertiary)' }}>Add items to your cart before placing an order.</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-8 btn-primary px-6 py-3 text-sm font-semibold"
          >
            Browse pizzas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em]" style={{ color: 'var(--accent-primary)' }}>Secure checkout</p>
          <h2 className="mt-2 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Review your order</h2>
        </div>
        <div className="rounded-full px-4 py-2 text-sm font-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
          {items.length} {items.length === 1 ? 'item' : 'items'} in cart
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.75fr]">
        <div className="space-y-6 rounded-[2rem] border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Delivery details</h3>
            <p className="mt-2" style={{ color: 'var(--text-tertiary)' }}>Fill in your address and phone number to complete the order.</p>
          </div>

          <div className="grid gap-5">
            <label className="block">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Delivery address *</span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete delivery address..."
                aria-label="Delivery address"
                required
                className="mt-2 w-full rounded-xl border p-3 text-sm outline-none transition"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
                rows={3}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Phone number *</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +91 98765 43210"
                type="tel"
                aria-label="Phone number"
                required
                className="mt-2 w-full rounded-xl border p-3 text-sm outline-none transition"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' }}
              />
            </label>

            <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

            {errorMessage && (
              <div className="rounded-xl border p-4 text-sm" style={{ backgroundColor: 'var(--danger-light)', borderColor: 'var(--danger-color)', color: 'var(--danger-dark)' }} role="alert">
                <p className="font-semibold">Error:</p>
                <p className="mt-1">{errorMessage}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              aria-busy={loading}
              className="btn-primary w-full px-6 py-3 text-base font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Placing order...
                </span>
              ) : (
                'Place order now'
              )}
            </button>
          </div>
        </div>

        <aside className="rounded-[2rem] border p-6 h-fit sticky top-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.18em]" style={{ color: 'var(--text-tertiary)' }}>Order summary</p>
              <h3 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Your cart</h3>
            </div>

            <div className="max-h-80 space-y-2 rounded-2xl p-4 overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}>
              {items.map((item) => (
                <div key={item._key} className="flex items-start justify-between gap-3 pb-2 border-b last:border-b-0" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{formatPrice(item.lineTotal)}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Total</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{formatPrice(total)}</p>
              </div>
            </div>

            <div className="rounded-2xl border p-3" style={{ backgroundColor: 'var(--success-light)', borderColor: 'var(--success-color)', color: 'var(--success-dark)' }}>
              <p className="text-xs font-medium">
                ✓ Your order details will be securely saved and you'll get live updates!
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}