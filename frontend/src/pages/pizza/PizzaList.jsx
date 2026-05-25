import React, { useEffect, useState } from 'react'
import { pizzaApi } from '../../api/pizzaApi'
import PizzaCard from '../../components/pizza/PizzaCard'

export default function PizzaList() {
  const [pizzas, setPizzas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    pizzaApi.getAllPizzas()
      .then(res => { if (mounted) setPizzas(res.data) })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="p-8">Loading pizzas…</div>

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {pizzas.map(p => (
        <PizzaCard key={p._id} pizza={p} />
      ))}
    </div>
  )
}
