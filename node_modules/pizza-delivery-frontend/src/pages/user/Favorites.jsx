import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFavorites, selectFavorites, selectFavoritesLoading } from '../../redux/favoritesSlice'
import PizzaCard from '../../components/pizza/PizzaCard'
import Loader from '../../components/common/Loader'

export default function Favorites() {
  const dispatch = useDispatch()
  const favorites = useSelector(selectFavorites)
  const loading = useSelector(selectFavoritesLoading)

  useEffect(() => {
    dispatch(fetchFavorites())
  }, [dispatch])

  if (loading) return <Loader fullScreen />

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.22em] text-primary-600">Favorites</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Saved pizzas</h1>
        <p className="mt-2 text-slate-600">Your favorite pizzas are saved here for fast reordering.</p>
      </div>

      {!favorites.length ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Nothing here yet</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900">Your wishlist is empty</h2>
          <p className="mt-3 text-slate-600">Browse the menu and add pizzas to your favorites.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((pizza) => (
            <PizzaCard key={pizza._id} pizza={pizza} />
          ))}
        </div>
      )}
    </div>
  )
}
