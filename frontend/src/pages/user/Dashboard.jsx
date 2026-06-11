import PizzaList from '../pizza/PizzaList'
import SEO from '../../components/common/SEO'

export default function Dashboard() {
  return (
    <>
      <SEO
        title="Order Pizza Online"
        description="Browse fresh pizzas, build your own, earn rewards, and track delivery in real time."
        path="/dashboard"
      />
      <PizzaList />
    </>
  )
}
