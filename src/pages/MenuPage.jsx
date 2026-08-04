import { hibiscusRefresher } from '../data/menu'
import FlavorCard from '../components/FlavorCard'
import { useCart } from '../context/CartContext'
import './MenuPage.css'

export default function MenuPage({ onNavigate }) {
  const { totalItems } = useCart()

  return (
    <div className="menu-page">
      {/* Hero */}
      <section className="menu-hero">
        <div className="menu-hero-content">
          <img src="/santi-logo.png" alt="Santi Café" className="hero-logo" />
          <h1>Santi Café</h1>
          <p>Freshly made with care, every single day</p>
        </div>
      </section>

      {/* Product feature section */}
      <div className="product-section">
        <div className="product-intro">
          <div className="product-badge">🌺 Featured Drink</div>
          <h2 className="product-title">{hibiscusRefresher.name}</h2>
          <p className="product-tagline">{hibiscusRefresher.tagline}</p>
        </div>

        <div className="flavor-label">Choose your flavour</div>
        <div className="flavors-grid">
          {hibiscusRefresher.flavours.map((flavour) => (
            <FlavorCard
              key={flavour.id}
              flavour={flavour}
              price={hibiscusRefresher.price}
            />
          ))}
        </div>
      </div>

      {/* Sticky view order button when cart has items */}
      {totalItems > 0 && (
        <div className="sticky-cart-bar">
          <button className="view-order-btn" onClick={() => onNavigate('cart')}>
            View Order · {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </button>
        </div>
      )}
    </div>
  )
}
