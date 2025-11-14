import { useEffect } from 'react'
import './Toast.css'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 10000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast toast-${type}`}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <p>{message}</p>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  )
}
