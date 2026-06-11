import { useEffect } from 'react'

const DEFAULT_SITE = 'PizzaHub'
const DEFAULT_DESCRIPTION =
  'Order fresh custom pizzas online with live tracking, rewards, and secure checkout.'
const DEFAULT_IMAGE = '/pizza.svg'

function upsertMeta(attr, key, content) {
  if (!content || typeof document === 'undefined') return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href || typeof document === 'undefined') return
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Lightweight SEO helper — updates document title and meta tags without extra dependencies.
 */
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
}) {
  const fullTitle = title ? `${title} | ${DEFAULT_SITE}` : `${DEFAULT_SITE} — Order Your Perfect Pizza`
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const url = origin && path ? `${origin}${path.startsWith('/') ? path : `/${path}`}` : origin
  const imageUrl = image.startsWith('http') ? image : `${origin}${image}`

  useEffect(() => {
    document.title = fullTitle

    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')

    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    if (url) upsertMeta('property', 'og:url', url)
    if (imageUrl) upsertMeta('property', 'og:image', imageUrl)
    upsertMeta('property', 'og:site_name', DEFAULT_SITE)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    if (imageUrl) upsertMeta('name', 'twitter:image', imageUrl)

    if (url) upsertLink('canonical', url)
  }, [fullTitle, description, url, imageUrl, type, noIndex])

  return null
}

export { DEFAULT_SITE, DEFAULT_DESCRIPTION }
