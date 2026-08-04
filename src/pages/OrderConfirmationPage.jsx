import './OrderConfirmationPage.css'

export default function OrderConfirmationPage({ order, onNavigate }) {
  const orderNumber = String(Math.floor(Math.random() * 900) + 100)

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <img src="/santi-logo.png" alt="Santi Café" className="confirm-logo" />
        <div className="confirmation-icon">✓</div>
        <h1>Order Placed!</h1>
        <p className="confirmation-subtitle">
          Thanks for ordering with Santi Café. We&apos;ll have it ready for you shortly!
        </p>

        <div className="order-number">
          Order <span>#{orderNumber}</span>
        </div>

        <div className="ordered-items">
          <h3>What you ordered</h3>
          {order.items.map((item) => (
            <div key={item.id} className="confirmed-item">
              <span>{item.emoji} {item.name}</span>
              <span>×{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="confirmed-total">
            <span>Total paid</span>
            <span>${order.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <p className="pickup-note">
          ☕ Your order will be ready at the counter in about 5–10 minutes.
        </p>

        <button className="btn-primary" onClick={() => onNavigate('menu')}>
          Order Again
        </button>
      </div>
    </div>
  )
}
