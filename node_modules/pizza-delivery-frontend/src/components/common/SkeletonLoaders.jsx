import React from 'react'

/**
 * Skeleton loaders for UI placeholders during data loading
 */

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="space-y-4">
        <div className="h-6 w-1/2 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  )
}

export function SkeletonChartPlaceholder({ height = 'h-72' }) {
  return (
    <div className={`rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm ${height}`}>
      <div className="flex h-full items-center justify-center">
        <div className="w-full space-y-4">
          <div className="h-6 w-1/3 animate-pulse rounded-full bg-slate-200" />
          <div className="flex items-end gap-3">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="flex-1 animate-pulse rounded-full bg-slate-200"
                style={{ height: `${Math.random() * 100 + 50}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonListItem() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <div className="space-y-2">
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-4 h-8 w-2/3 animate-pulse rounded-full bg-slate-300" />
        </div>
      ))}
    </div>
  )
}

export default {
  SkeletonCard,
  SkeletonChartPlaceholder,
  SkeletonListItem,
  SkeletonStats,
}
