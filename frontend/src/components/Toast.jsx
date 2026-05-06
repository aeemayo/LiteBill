import { useState, useCallback, useRef } from 'react'
import { getExplorerTxUrl } from '../config'

// ── Hook ──────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const addToast = useCallback(({ type = 'info', msg, txHash }) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, type, msg, txHash, exiting: false }])

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 260)
    }, 6000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 260)
  }, [])

  return { toasts, addToast, removeToast }
}

// ── Icons ─────────────────────────────────────────────────────────
const ICONS = { success: '✓', error: '✕', info: 'ℹ' }

// ── Component ─────────────────────────────────────────────────────
export function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null
  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast ${t.type}${t.exiting ? ' exiting' : ''}`}
          onClick={() => removeToast(t.id)}
          role="alert"
        >
          <span className="toast-icon">{ICONS[t.type]}</span>
          <div className="toast-body">
            <p className="toast-msg">{t.msg}</p>
            {t.txHash && (
              <a
                className="toast-link"
                href={getExplorerTxUrl(t.txHash)}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
              >
                Tx: {t.txHash.slice(0, 18)}…
              </a>
            )}
          </div>
          <button className="toast-close" aria-label="Dismiss">✕</button>
        </div>
      ))}
    </div>
  )
}
