import { useState } from 'react'
import { CartProvider, useCart } from './context/CartContext'
import Navbar from './components/Navbar'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'

function AppContent() {
  const [page, setPage] = useState('menu')
  const [completedOrder, setCompletedOrder] = useState(null)
  const { items, totalPrice, clearCart } = useCart()

  function handleCheckout() {
    const tax = totalPrice * 0.08
    setCompletedOrder({ items: [...items], grandTotal: totalPrice + tax })
    clearCart()
    setPage('confirmation')
  }

  function handleNavigate(destination) {
    setPage(destination)
  }

  return (
    <div className="app">
      {page !== 'confirmation' && (
        <Navbar currentPage={page} onNavigate={handleNavigate} />
      )}
      <main className="main-content">
        {page === 'menu' && <MenuPage onNavigate={handleNavigate} />}
        {page === 'cart' && (
          <CartPage onNavigate={handleNavigate} onCheckout={handleCheckout} />
        )}
        {page === 'confirmation' && (
          <OrderConfirmationPage order={completedOrder} onNavigate={handleNavigate} />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  )
}
