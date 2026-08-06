import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { CartProvider, useCart } from './context/CartContext'
import Navbar from './components/Navbar'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import ReviewPage from './pages/ReviewPage'

function AppContent() {
  const [page, setPage] = useState('menu')
  const [completedOrder, setCompletedOrder] = useState(null)
  const [orderStatus, setOrderStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const { items, totalPrice, clearCart } = useCart()

  async function handleCheckout(customer) {
    const tax = totalPrice * 0.08
    const grandTotal = totalPrice + tax

    const order = {
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
      },
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      subtotal: totalPrice,
      tax,
      grandTotal,
    }

    setCompletedOrder(order)
    clearCart()
    setPage('confirmation')
    window.scrollTo({ top: 0, behavior: 'instant' })
    setOrderStatus('saving')

    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: serverTimestamp(),
      })
      setOrderStatus('saved')
      setCompletedOrder((prev) => ({ ...prev, firestoreId: docRef.id }))
    } catch (err) {
      console.error('Failed to save order:', err)
      setOrderStatus('error')
    }
  }

  function handleNavigate(destination) {
    setPage(destination)
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (destination === 'menu') {
      setOrderStatus('idle')
      setCompletedOrder(null)
    }
  }

  return (
    <div className="app">
      {page !== 'confirmation' && (
        <Navbar currentPage={page} onNavigate={handleNavigate} />
      )}
      <main className="main-content">
        {page === 'menu' && <MenuPage onNavigate={handleNavigate} />}
        {page === 'review' && <ReviewPage />}
        {page === 'cart' && (
          <CartPage onNavigate={handleNavigate} onCheckout={handleCheckout} />
        )}
        {page === 'confirmation' && (
          <OrderConfirmationPage
            order={completedOrder}
            orderStatus={orderStatus}
            onNavigate={handleNavigate}
          />
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
