import { useState } from 'react'

export default function ImageWithFallback({ src, alt, className = '' }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-pulse bg-slate-200" />
      )}

      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-6xl text-orange-500">
          🍕
        </div>
      )}
    </div>
  )
}
