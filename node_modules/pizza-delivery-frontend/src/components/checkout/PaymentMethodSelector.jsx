import React from 'react'

const paymentMethods = [
  {
    id: 'cash',
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: '💵',
  },
  {
    id: 'online',
    label: 'Online Payment',
    description: 'Secure online payment (Razorpay)',
    icon: '💳',
  },
]

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="block">
        <p className="text-sm font-semibold text-slate-900">Payment Method</p>
        <p className="mt-1 text-sm text-slate-600">Choose how you'd like to pay</p>
      </label>

      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => !method.disabled && onChange(method.id)}
            disabled={method.disabled}
            className={`w-full rounded-xl border-2 p-4 text-left transition ${
              value === method.id
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : method.disabled
                  ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                  : 'border-slate-200 bg-white hover:border-primary-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900">{method.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{method.description}</p>
                </div>
              </div>
              {value === method.id && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white">
                  ✓
                </div>
              )}
              {method.disabled && (
                <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                  {method.note}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-blue-50 p-3 border border-blue-200">
        <p className="text-xs font-medium text-blue-900">
          ℹ️ Your order details will be securely stored. Online payments powered by Razorpay.
        </p>
      </div>
    </div>
  )
}
