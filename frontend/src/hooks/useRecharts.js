import { useEffect, useState } from 'react'

export default function useRecharts() {
  const [lib, setLib] = useState(null)

  useEffect(() => {
    let mounted = true
    import('recharts')
      .then((m) => {
        if (mounted) setLib(m)
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

  return lib
}
