import { useState } from 'react'
import { useCart } from '../context/CartContext'
import CartItem from '../components/CartItem'
import './CartPage.css'

export default function CartPage({ onNavigate, onCheckout }) {
  const { items, totalPrice, totalItems } = useCart()
  const [customer, setCustomer] = useState({ name: '', phone: '' })
  const [errors, setErrors] = useState({})

  const tax = totalPrice * 0.08
  const grandTotal = totalPrice + tax

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length < 4) return digits
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  function handlePhoneChange(e) {
    const formatted = formatPhone(e.target.value)
    setCustomer((p) => ({ ...p, phone: formatted }))
    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }))
  }

  function validate() {
    const newErrors = {}
    if (!customer.name.trim()) {
      newErrors.name = 'Please enter your name'
    }
    if (!customer.phone.trim()) {
      newErrors.phone = 'Please enter your phone number'
    } else if (!/^(\+?1[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}$/.test(customer.phone.trim())) {
      newErrors.phone = 'Please enter a valid Canadian phone number (e.g. 416-555-1234)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handlePlaceOrder() {
    if (validate()) {
      onCheckout(customer)
    }
  }

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

          {/* Right column: customer details + order summary */}
          <div className="cart-right">
            {/* Customer details */}
            <div className="customer-form">
              <h2>Your Details</h2>
              <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="customer-name">Name</label>
                <input
                  id="customer-name"
                  type="text"
                  placeholder="e.g. Alex"
                  value={customer.name}
                  onChange={(e) => {
                    setCustomer((p) => ({ ...p, name: e.target.value }))
                    if (errors.name) setErrors((p) => ({ ...p, name: '' }))
                  }}
                  autoComplete="given-name"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className={`form-field ${errors.phone ? 'has-error' : ''}`}>
                <label htmlFor="customer-phone">Phone Number</label>
                <input
                  id="customer-phone"
                  type="tel"
                  placeholder="(416) 555-1234"
                  value={customer.phone}
                  onChange={handlePhoneChange}
                  autoComplete="tel"
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
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
              <button className="btn-primary checkout-btn" onClick={handlePlaceOrder}>
                Place Order
              </button>
              <button className="btn-secondary" onClick={() => onNavigate('menu')}>
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
