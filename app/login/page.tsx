'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Login() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div className="flex flex-col flex-1 bg-ground items-center justify-center px-6">
      <div className="w-full max-w-xs flex flex-col gap-6">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-accent mb-2">FuelOS</p>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-tight">
            Hit your protein.<br />Every day.
          </h1>
          <p className="text-sm text-muted mt-2">Enter your email to get started — no password needed.</p>
        </div>

        {sent ? (
          <div className="bg-surface rounded-2xl p-5 border border-border text-center">
            <div className="text-3xl mb-3">📬</div>
            <p className="font-bold text-ink mb-1">Check your email</p>
            <p className="text-sm text-muted">We sent a sign-in link to <strong className="text-ink">{email}</strong>. Click it to open the app.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1.5">Email</label>
              <input
                type="email" required placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full py-4 bg-accent text-white font-bold rounded-2xl text-base disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send sign-in link →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
