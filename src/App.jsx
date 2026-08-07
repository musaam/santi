import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { CartProvider, useCart } from './context/CartContext'
import Navbar from './components/Navbar'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import ReviewPage from './pages/ReviewPage'

function AppContent() {
  const [completedOrder, setCompletedOrder] = useState(null)
  const [orderStatus, setOrderStatus] = useState('idle')
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const hideNavbar = location.pathname === '/confirmation'

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
    navigate('/confirmation')
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

  return (
    <div className="app">
      {!hideNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/order" element={<CartPage onCheckout={handleCheckout} />} />
          <Route path="/reviews" element={<ReviewPage />} />
          <Route
            path="/confirmation"
            element={
              <OrderConfirmationPage
                order={completedOrder}
                orderStatus={orderStatus}
                onOrderAgain={() => {
                  setOrderStatus('idle')
                  setCompletedOrder(null)
                  navigate('/')
                  window.scrollTo({ top: 0, behavior: 'instant' })
                }}
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  )
}
