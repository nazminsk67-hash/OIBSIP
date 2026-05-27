import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 p-6">
          <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-10 shadow-sm">
            <h1 className="text-3xl font-semibold text-red-700">Something went wrong</h1>
            <p className="mt-4 text-slate-600">
              The page failed to load. Refresh the app or try again later.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
