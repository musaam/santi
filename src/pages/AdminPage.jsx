import { useState, useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useConfig } from '../context/ConfigContext'
import { hibiscusRefresher as fallbackProduct } from '../data/menu'
import {
  LoginForm,
  useAuthUser,
  signOutUser,
  isAdminEmail,
} from './auth'
import './AdminPage.css'

function ProductEditor() {
  const { product } = useConfig()

  // Local editable copy, seeded from live config and re-seeded when it changes
  // (e.g. edited on another device) unless there are unsaved local edits.
  const [name, setName] = useState(product.name)
  const [tagline, setTagline] = useState(product.tagline)
  const [price, setPrice] = useState(product.price)
  const [flavours, setFlavours] = useState(product.flavours)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (dirty) return
    setName(product.name)
    setTagline(product.tagline)
    setPrice(product.price)
    setFlavours(product.flavours)
  }, [product, dirty])

  function updateFlavour(id, field, value) {
    setDirty(true)
    setFlavours((list) =>
      list.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    )
  }

  async function save() {
    setSaving(true)
    setMsg('')
    // Persist only the fields the admin controls. Static styling (colors,
    // images, emoji) stays in the bundled fallback and is merged in by
    // ConfigContext, so we don't need to store it here.
    const productData = {
      name: name.trim(),
      tagline: tagline.trim(),
      price: Number(price) || 0,
      flavours: flavours.map((f) => ({
        id: f.id,
        flavour: f.flavour,
        description: f.description,
        available: f.available !== false,
      })),
    }
    try {
      await setDoc(doc(db, 'config', 'app'), { product: productData }, { merge: true })
      setDirty(false)
      setMsg('Saved. Changes are live.')
      setTimeout(() => setMsg(''), 2500)
    } catch (err) {
      console.error('Failed to save product:', err)
      setMsg('Save failed — check your access.')
    } finally {
      setSaving(false)
    }
  }

  function resetToBundled() {
    setName(fallbackProduct.name)
    setTagline(fallbackProduct.tagline)
    setPrice(fallbackProduct.price)
    setFlavours(fallbackProduct.flavours)
    setDirty(true)
    setMsg('Loaded bundled defaults — review, then Save to publish.')
  }

  const availableCount = flavours.filter((f) => f.available !== false).length

  return (
    <section className="menu-editor">
      <div className="menu-editor-head">
        <div>
          <h2>Product & Pricing</h2>
          <p className="event-panel-status">
            Edit the product name, price, and each flavour. Changes go live on Save — no redeploy needed.
          </p>
        </div>
        <button className="admin-btn-ghost" onClick={resetToBundled} disabled={saving}>
          Load defaults
        </button>
      </div>

      <div className="event-panel-fields">
        <label className="admin-field">
          <span>Product name</span>
          <input value={name} onChange={(e) => { setDirty(true); setName(e.target.value) }} placeholder="Hibiscus Refresher" />
        </label>
        <label className="admin-field">
          <span>Tagline</span>
          <input value={tagline} onChange={(e) => { setDirty(true); setTagline(e.target.value) }} placeholder="Short description shown on the menu" />
        </label>
        <label className="admin-field">
          <span>Price (applies to all flavours)</span>
          <div className="menu-editor-price">
            <span>$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => { setDirty(true); setPrice(e.target.value) }}
            />
          </div>
        </label>
      </div>

      <div className="menu-editor-group">
        <span className="event-items-group-name">
          Flavours ({availableCount} of {flavours.length} available)
        </span>
        {flavours.map((f) => (
          <div key={f.id} className={`menu-editor-item ${f.available === false ? 'unavailable' : ''}`}>
            <div className="menu-editor-row">
              <span className="menu-editor-emoji" aria-hidden="true">{f.emoji}</span>
              <input
                className="menu-editor-name"
                value={f.flavour}
                onChange={(e) => updateFlavour(f.id, 'flavour', e.target.value)}
                placeholder="Flavour name"
              />
            </div>
            <input
              className="menu-editor-desc"
              value={f.description || ''}
              onChange={(e) => updateFlavour(f.id, 'description', e.target.value)}
              placeholder="Description"
            />
            <label className="menu-editor-avail">
              <input
                type="checkbox"
                checked={f.available !== false}
                onChange={(e) => updateFlavour(f.id, 'available', e.target.checked)}
              />
              <span>Available</span>
            </label>
          </div>
        ))}
      </div>

      <div className="event-panel-foot">
        <button className="admin-btn-primary" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {msg && <span className="event-saved-msg">{msg}</span>}
      </div>
    </section>
  )
}

function AdminDashboard({ user }) {
  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Store Settings</h1>
        <div className="admin-header-right">
          <span className="admin-user">{user.email}</span>
          <button className="admin-btn-ghost" onClick={signOutUser}>
            Sign out
          </button>
        </div>
      </header>

      <ProductEditor />
    </div>
  )
}

export default function AdminPage() {
  const { user, loading } = useAuthUser()

  if (loading) {
    return <div className="admin-loading">Loading…</div>
  }

  if (!user) {
    return <LoginForm title="Santi — Admin Login" />
  }

  // Store configuration is admin-only. A non-admin (e.g. the server account)
  // that logs in here is told they don't have access.
  if (!isAdminEmail(user)) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <h1 className="admin-login-title">No access</h1>
          <p className="admin-login-error">
            This account isn&apos;t authorized for store settings. Use the admin account,
            or go to the orders page instead.
          </p>
          <button className="admin-btn-ghost" onClick={signOutUser}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return <AdminDashboard user={user} />
}
