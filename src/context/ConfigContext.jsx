import { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { hibiscusRefresher as fallbackProduct } from '../data/menu'

const ConfigContext = createContext(null)

// Merge the live Firestore product over the bundled fallback so the storefront
// always has a complete product (name, emoji, colors, images) even if the
// admin has only edited price or a couple of flavours.
function mergeProduct(fallback, saved) {
  if (!saved || typeof saved !== 'object') return fallback

  // Merge flavours by id, preserving order and static styling from the
  // fallback while letting the admin override name/description/availability.
  const savedById = new Map(
    Array.isArray(saved.flavours) ? saved.flavours.map((f) => [f.id, f]) : []
  )
  const flavours = fallback.flavours.map((base) => {
    const override = savedById.get(base.id)
    return override ? { ...base, ...override } : base
  })

  return {
    ...fallback,
    ...saved,
    // price may be stored as a string from the number input; normalize it.
    price:
      saved.price !== undefined && saved.price !== null && saved.price !== ''
        ? Number(saved.price)
        : fallback.price,
    flavours,
  }
}

export function ConfigProvider({ children }) {
  // Product starts from the bundled fallback so the storefront always renders,
  // even before the Firestore config has been seeded.
  const [product, setProduct] = useState(fallbackProduct)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Live subscription to config/app so a change in Firestore (or the admin
    // page) updates pricing / flavours / availability across the site
    // instantly, without a redeploy.
    const unsub = onSnapshot(
      doc(db, 'config', 'app'),
      (snap) => {
        const data = snap.exists() ? snap.data() : {}
        setProduct(mergeProduct(fallbackProduct, data.product))
        setLoading(false)
      },
      (err) => {
        console.error('Failed to load app config:', err)
        // Fall back to the bundled product if config can't be read.
        setProduct(fallbackProduct)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  // Only flavours the admin has left available should appear in the storefront.
  const availableFlavours = product.flavours.filter((f) => f.available !== false)

  return (
    <ConfigContext.Provider value={{ product, availableFlavours, loading }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider')
  return ctx
}
