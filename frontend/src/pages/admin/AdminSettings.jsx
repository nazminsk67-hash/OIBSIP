import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'

const defaultSettings = {
  general: { companyName: '', timezone: '', supportEmail: '' },
  payments: { razorpayEnabled: true, cashOnDeliveryEnabled: true },
  notifications: { orderAlerts: true, emailAlerts: true },
  appearance: { theme: 'auto' },
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminApi.getSettings()
        setSettings(response.data)
      } catch (err) {
        toast.error('Could not load settings')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const updateField = (path, value) => {
    setSettings((prev) => {
      const next = { ...prev }
      const keys = path.split('.')
      let pointer = next
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          pointer[key] = value
        } else {
          pointer[key] = { ...pointer[key] }
          pointer = pointer[key]
        }
      })
      return next
    })
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await adminApi.updateSettings(settings)
      toast.success('Settings saved successfully')
    } catch (err) {
      toast.error('Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-primary-600">Settings Center</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Admin configuration</h1>
        <p className="mt-2 text-slate-600">Manage general, payments, notification and appearance settings from one location.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-950">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">General</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span>Company name</span>
                <input
                  value={settings.general.companyName}
                  onChange={(e) => updateField('general.companyName', e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-500 dark:bg-slate-950 dark:border-slate-700"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Timezone</span>
                <input
                  value={settings.general.timezone}
                  onChange={(e) => updateField('general.timezone', e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-500 dark:bg-slate-950 dark:border-slate-700"
                />
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span>Support email</span>
                <input
                  value={settings.general.supportEmail}
                  onChange={(e) => updateField('general.supportEmail', e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-500 dark:bg-slate-950 dark:border-slate-700"
                />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Payments</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <input
                  type="checkbox"
                  checked={settings.payments.razorpayEnabled}
                  onChange={(e) => updateField('payments.razorpayEnabled', e.target.checked)}
                />
                <span>Razorpay enabled</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <input
                  type="checkbox"
                  checked={settings.payments.cashOnDeliveryEnabled}
                  onChange={(e) => updateField('payments.cashOnDeliveryEnabled', e.target.checked)}
                />
                <span>Cash on delivery</span>
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Notifications</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <input
                  type="checkbox"
                  checked={settings.notifications.orderAlerts}
                  onChange={(e) => updateField('notifications.orderAlerts', e.target.checked)}
                />
                <span>Order alerts</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailAlerts}
                  onChange={(e) => updateField('notifications.emailAlerts', e.target.checked)}
                />
                <span>Email alerts</span>
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Appearance</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {['auto', 'light', 'dark'].map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => updateField('appearance.theme', theme)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${settings.appearance.theme === theme ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/20' : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'}`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-950">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Save settings</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Changes are persisted to the admin settings collection and can be extended for site-wide feature toggles.</p>
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </aside>
      </div>
    </div>
  )
}
