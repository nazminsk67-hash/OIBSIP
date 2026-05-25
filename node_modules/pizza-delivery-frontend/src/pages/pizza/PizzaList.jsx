import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PizzaCard from '../../components/pizza/PizzaCard'
import { fetchPizzas, selectPizzas, selectPizzaLoading } from '../../redux/pizzaSlice'

export default function PizzaList() {
  const dispatch = useDispatch()
  const pizzas = useSelector(selectPizzas)
  const loading = useSelector(selectPizzaLoading)

  useEffect(() => {
    dispatch(fetchPizzas())
  }, [dispatch])

  if (loading) return <div className="p-8">Loading pizzas…</div>
  if (!pizzas.length) return <div className="p-8">No pizzas available yet.</div>

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {pizzas.map(p => (
        <PizzaCard key={p._id} pizza={p} />
      ))}
    </div>
  )
}
