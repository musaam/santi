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
          <Link to="/order" className={`nav-link ${path === '/order' ? 'active' : ''}`}>
            Order
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
