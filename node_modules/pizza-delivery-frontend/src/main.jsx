import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { store } from './redux/store'
import ErrorBoundary from './components/common/ErrorBoundary'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

// Register service worker and handle PWA install prompt (safe, non-blocking)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })

  // Optional: capture install prompt for custom UI
  window.deferredPrompt = null
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    window.deferredPrompt = e
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                background: '#111827',
                color: '#f9fafb',
                fontSize: '14px',
                padding: '12px 16px',
              },
              success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
)
