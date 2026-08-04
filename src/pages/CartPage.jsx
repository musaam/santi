import { useCart } from '../context/CartContext'
import CartItem from '../components/CartItem'
import './CartPage.css'

export default function CartPage({ onNavigate, onCheckout }) {
  const { items, totalPrice, totalItems } = useCart()

  const tax = totalPrice * 0.08
  const grandTotal = totalPrice + tax

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">☕</div>
          <h2>Your order is empty</h2>
          <p>Head back to the menu and add some items!</p>
          <button className="btn-primary" onClick={() => onNavigate('menu')}>
            Browse Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-content">
        <div className="cart-header">
          <h1>Your Order</h1>
          <span className="cart-item-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
        </div>

        <div className="cart-layout">
          {/* Items list */}
          <div className="cart-items-list">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
            <button className="add-more-btn" onClick={() => onNavigate('menu')}>
              + Add more items
            </button>
          </div>

          {/* Order summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-line">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
            <button className="btn-primary checkout-btn" onClick={onCheckout}>
              Place Order
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('menu')}>
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
