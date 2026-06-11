import { Component } from 'react'
import { logError } from '../../utils/errorLogger'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorId: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    const errorId = `err_${Date.now()}`
    this.setState({ errorId })
    logError(error, {
      componentStack: info?.componentStack,
      boundary: 'ErrorBoundary',
      errorId,
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorId: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-900">
          <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-10 shadow-sm dark:border-red-900/50 dark:bg-slate-950">
            <p className="text-sm uppercase tracking-[0.2em] text-red-600">Something went wrong</p>
            <h1 className="mt-2 text-3xl font-semibold text-red-700 dark:text-red-400">
              We hit an unexpected error
            </h1>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              The page failed to load. You can try again or refresh the app.
            </p>
            {this.state.errorId && (
              <p className="mt-2 text-xs text-slate-400">Reference: {this.state.errorId}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
