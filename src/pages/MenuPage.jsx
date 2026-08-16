import { useNavigate } from 'react-router-dom'
import { hibiscusRefresher } from '../data/menu'
import FlavorCard from '../components/FlavorCard'
import { useCart } from '../context/CartContext'
import './MenuPage.css'

export default function MenuPage() {
  const navigate = useNavigate()
  const { totalItems } = useCart()

  return (
    <div className="menu-page">
      {/* Hero */}
      <section className="menu-hero">
        <div className="hero-text">
          <h1 className="hero-headline">
            <span className="hero-script">Refresh your</span>
            <span className="hero-bold">EVERYDAY.</span>
          </h1>
          <p className="hero-sub">
            Naturally vibrant. Deliciously refreshing.<br />
            Made with real hibiscus.
          </p>
          <a href="#menu" className="hero-cta">
            GET YOURS <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* Feature strip */}
      <section className="feature-strip">
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C8 2 5 5 5 8c0 4 7 12 7 12s7-8 7-12c0-3-3-6-7-6z"/><circle cx="12" cy="8" r="2"/></svg>
          </div>
          <h3>REAL HIBISCUS</h3>
          <p>Made with real hibiscus flowers.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z"/><path d="M8 12l3 3 5-5"/></svg>
          </div>
          <h3>NATURAL INGREDIENTS</h3>
          <p>No artificial colors. No preservatives.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <h3>REFRESHING GOODNESS</h3>
          <p>Light, refreshing and perfectly satisfying.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <h3>MADE WITH CARE</h3>
          <p>Handcrafted drinks you can feel good about.</p>
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
