import React, { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'
import ResetPasswordForm from '../components/auth/ResetPasswordForm'

export default function Auth() {
  const [tab, setTab] = useState<'login' | 'signup' | 'reset'>('login')

  return (
    <div>
      <h2>Autenticación</h2>
      <div>
        <button onClick={() => setTab('login')}>Entrar</button>
        <button onClick={() => setTab('signup')}>Registro</button>
        <button onClick={() => setTab('reset')}>Recuperar contraseña</button>
      </div>
      <div style={{ marginTop: 16 }}>
        {tab === 'login' && <LoginForm />}
        {tab === 'signup' && <SignupForm />}
        {tab === 'reset' && <ResetPasswordForm />}
      </div>
    </div>
  )
}
