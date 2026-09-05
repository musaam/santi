import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartItem from '../components/CartItem'
import './CartPage.css'

// Santi Cafe pickup location.
// PICKUP_ADDRESS is the general area shown on the cart *before* an order is
// placed. PICKUP_ADDRESS_FULL is the complete street address, revealed only
// after checkout (on the confirmation page and in the confirmation emails).
export const PICKUP_ADDRESS = 'Richmond west, Winnipeg, MB, Canada'
export const PICKUP_ADDRESS_FULL = '51 Brentlawn Blvd, Winnipeg, MB, Canada'

// Pickup time slots (30-min increments, end time inclusive) depend on the day:
//  - Weekdays (Mon–Fri): 6:00 PM – 9:00 PM
//  - Weekends (Sat/Sun): 1:00 PM – 9:00 PM
const WEEKDAY_SLOTS = [
  '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM',
  '9:00 PM',
]
const WEEKEND_SLOTS = [
  '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM',
  '9:00 PM',
]

// Given a date value (YYYY-MM-DD), return the pickup slots for that weekday.
// Weekends (Sunday=0, Saturday=6) get the extended afternoon hours.
function slotsForDate(dateStr) {
  if (!dateStr) return []
  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return []
  const d = new Date(year, month - 1, day)
  const wd = d.getDay()
  return wd === 0 || wd === 6 ? WEEKEND_SLOTS : WEEKDAY_SLOTS
}

// Persist checkout form details for the duration of the browser session so they
// survive navigating away (e.g. "Continue Shopping") and back to the cart.
const CHECKOUT_STORAGE_KEY = 'santi-checkout-details'

function loadCheckoutDetails() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearCheckoutDetails() {
  try {
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY)
  } catch {
    /* ignore storage errors */
  }
}

export default function CartPage({ onCheckout }) {
  const navigate = useNavigate()
  const { items, totalPrice, totalItems } = useCart()

  const saved = loadCheckoutDetails() || {}
  const [customer, setCustomer] = useState(saved.customer || { name: '', email: '', phone: '' })
  const [orderDate, setOrderDate] = useState(saved.orderDate || '')
  const [orderTime, setOrderTime] = useState(saved.orderTime || '')
  const [errors, setErrors] = useState({})

  // Save form details to sessionStorage whenever they change.
  useEffect(() => {
    try {
      sessionStorage.setItem(
        CHECKOUT_STORAGE_KEY,
        JSON.stringify({ customer, orderDate, orderTime })
      )
    } catch {
      /* ignore storage errors (e.g. private mode quota) */
    }
  }, [customer, orderDate, orderTime])

  // Pickup only — no delivery fees.
  const grandTotal = totalPrice

  // Available time slots for the currently selected date.
  const timeSlots = slotsForDate(orderDate)

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

  function handleDateChange(e) {
    const nextDate = e.target.value
    setOrderDate(nextDate)
    if (errors.orderDate) setErrors((p) => ({ ...p, orderDate: '' }))
    // If the previously chosen time isn't offered on the new day, clear it.
    if (orderTime && !slotsForDate(nextDate).includes(orderTime)) {
      setOrderTime('')
    }
  }

  // Next 14 days, any day of the week.
  function getUpcomingDates() {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      dates.push(d)
    }
    return dates
  }

  const upcomingDates = getUpcomingDates()

  function formatDateOption(date) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const dayNum = date.getDate()
    return `${dayName}, ${month} ${dayNum}`
  }

  function formatDateValue(date) {
    // Use local date components (not toISOString, which converts to UTC and can
    // shift the date by a day for users in negative UTC offsets in the evening).
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function validate() {
    const newErrors = {}
    if (!customer.name.trim()) {
      newErrors.name = 'Please enter your name'
    }
    if (!customer.email.trim()) {
      newErrors.email = 'Please enter your email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (customer.phone.trim() && !/^(\+?1[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}$/.test(customer.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (e.g. 416-555-1234)'
    }
    if (!orderDate) {
      newErrors.orderDate = 'Please select a date'
    }
    if (!orderTime) {
      newErrors.orderTime = 'Please select a time'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handlePlaceOrder() {
    if (validate()) {
      onCheckout(customer, {
        deliveryMethod: 'pickup',
        deliveryFee: 0,
        orderDate,
        orderTime,
        address: '',
        pickupAddress: PICKUP_ADDRESS_FULL,
      })
      // Order submitted — don't keep the details around for the next order.
      clearCheckoutDetails()
    }
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">☕</div>
          <h2>Your order is empty</h2>
          <p>Head back to the menu and add some items!</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
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
            <button className="add-more-btn" onClick={() => navigate('/')}>
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
              <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor="customer-email">Email</label>
                <input
                  id="customer-email"
                  type="email"
                  placeholder="e.g. alex@example.com"
                  value={customer.email}
                  onChange={(e) => {
                    setCustomer((p) => ({ ...p, email: e.target.value }))
                    if (errors.email) setErrors((p) => ({ ...p, email: '' }))
                  }}
                  autoComplete="email"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className={`form-field ${errors.phone ? 'has-error' : ''}`}>
                <label htmlFor="customer-phone">Phone Number <span className="field-optional">(optional)</span></label>
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

            {/* Pickup location */}
            <div className="delivery-method">
              <h2>Pickup</h2>
              <div className="pickup-address">
                <span className="pickup-address-label">📍 Pickup Location</span>
                <span className="pickup-address-value">{PICKUP_ADDRESS}</span>
                <span className="pickup-address-note">The full pickup address will be shown once your order is placed.</span>
              </div>
            </div>

            {/* Date & Time selection */}
            <div className="datetime-section">
              <h2>Pickup Date &amp; Time</h2>
              <p className="datetime-note">
                Pickup hours: weekdays 6:00–9:00 PM, weekends 1:00–9:00 PM.
              </p>
              <div className={`form-field ${errors.orderDate ? 'has-error' : ''}`}>
                <label htmlFor="order-date">Date</label>
                <select
                  id="order-date"
                  value={orderDate}
                  onChange={handleDateChange}
                >
                  <option value="">Select a date</option>
                  {upcomingDates.map((date) => (
                    <option key={formatDateValue(date)} value={formatDateValue(date)}>
                      {formatDateOption(date)}
                    </option>
                  ))}
                </select>
                {errors.orderDate && <span className="field-error">{errors.orderDate}</span>}
              </div>
              <div className={`form-field ${errors.orderTime ? 'has-error' : ''}`}>
                <label htmlFor="order-time">Time</label>
                <select
                  id="order-time"
                  value={orderTime}
                  onChange={(e) => {
                    setOrderTime(e.target.value)
                    if (errors.orderTime) setErrors((p) => ({ ...p, orderTime: '' }))
                  }}
                  disabled={!orderDate}
                >
                  <option value="">{orderDate ? 'Select a time' : 'Select a date first'}</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {errors.orderTime && <span className="field-error">{errors.orderTime}</span>}
              </div>
            </div>

            {/* Order summary */}
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-line">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-line total">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
              <button className="btn-primary checkout-btn" onClick={handlePlaceOrder}>
                Place Order
              </button>
              <button className="btn-secondary" onClick={() => navigate('/')}>
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
