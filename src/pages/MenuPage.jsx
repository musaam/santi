import { useNavigate } from 'react-router-dom'
import { hibiscusRefresher } from '../data/menu'
import FlavorCard from '../components/FlavorCard'
import HibiscusDrink from '../components/HibiscusDrink'
import { useCart } from '../context/CartContext'
import './MenuPage.css'

export default function MenuPage() {
  const navigate = useNavigate()
  const { totalItems } = useCart()

  return (
    <div className="menu-page">
      {/* Hero */}
      <section className="menu-hero">
        {/* Left drink illustration */}
        <div className="hero-drink hero-drink-left">
          <HibiscusDrink variant="left" />
        </div>

        {/* Center text */}
        <div className="menu-hero-content">
          <p className="hero-eyebrow">🌺 Freshly made daily</p>
          <h1>Santi Café</h1>
          <p className="hero-sub">Bold hibiscus drinks crafted with real fruit</p>
          <a href="#menu" className="hero-cta">See the Menu ↓</a>
        </div>

        {/* Right drink illustration */}
        <div className="hero-drink hero-drink-right">
          <HibiscusDrink variant="right" />
        </div>

        {/* Wave divider */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#FDF6F1" />
          </svg>
        </div>
      </section>

      {/* Product feature section */}
      <div className="product-section" id="menu">
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
          <button className="view-order-btn" onClick={() => navigate('/order')}>
            View Order · {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </button>
        </div>
      )}
    </div>
  )
}
