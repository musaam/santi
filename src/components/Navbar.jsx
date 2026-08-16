import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Navbar.css'

export default function Navbar() {
  const { totalItems } = useCart()
  const location = useLocation()
  const path = location.pathname

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src="/santi-logo.png" alt="Santi Café logo" className="navbar-logo" />
          <span className="navbar-title">Santi Café</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>
            Menu
          </Link>
          <Link to="/reviews" className={`nav-link ${path === '/reviews' ? 'active' : ''}`}>
            Reviews
          </Link>
          <Link to="/order" className={`nav-link cart-link ${path === '/order' ? 'active' : ''}`} aria-label="Cart">
            <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
