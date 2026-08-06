import { useCart } from '../context/CartContext'
import './Navbar.css'

export default function Navbar({ currentPage, onNavigate }) {
  const { totalItems } = useCart()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="navbar-brand" onClick={() => onNavigate('menu')}>
          <img src="/santi-logo.png" alt="Santi Café logo" className="navbar-logo" />
          <span className="navbar-title">Santi Café</span>
        </button>

        <div className="navbar-links">
          <button
            className={`nav-link ${currentPage === 'menu' ? 'active' : ''}`}
            onClick={() => onNavigate('menu')}
          >
            Menu
          </button>
          <button
            className={`nav-link ${currentPage === 'review' ? 'active' : ''}`}
            onClick={() => onNavigate('review')}
          >
            Reviews
          </button>
          <button
            className={`nav-link ${currentPage === 'cart' ? 'active' : ''}`}
            onClick={() => onNavigate('cart')}
          >
            Order
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
