import React, { useState } from 'react'
import { useAuth } from '../../context/AuthProvider'

export default function ResetPasswordForm() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const res = await resetPassword(email)
      if (res.error) setError(res.error.message)
      else setMessage('Se ha enviado un email para restablecer la contraseña (revisar SPAM).')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </div>
      <div>
        <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar email'}</button>
      </div>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  )
}
