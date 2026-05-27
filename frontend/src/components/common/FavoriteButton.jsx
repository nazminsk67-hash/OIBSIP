import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addFavorite, removeFavorite, selectFavorites } from '../../redux/favoritesSlice'

export default function FavoriteButton({ pizza, className = '' }) {
  const dispatch = useDispatch()
  const favorites = useSelector(selectFavorites)
  const isFavorite = favorites.some((item) => item._id === pizza._id)

  const toggle = (e) => {
    e.stopPropagation()
    if (isFavorite) dispatch(removeFavorite(pizza._id))
    else dispatch(addFavorite(pizza._id))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-full bg-white/90 p-2 text-slate-700 transition hover:text-primary-600 ${className}`}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? '♥' : '♡'}
    </button>
  )
}
