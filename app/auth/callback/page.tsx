"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function parseHash(hash: string) {
  if (!hash) return {}
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(trimmed)
  const out: Record<string, string> = {}
  params.forEach((v, k) => (out[k] = v))
  return out
}

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    async function finishSignIn() {
      try {
        const supabase = createClient()

        // Try parsing access token from URL fragment (magic link)
        const hashVals = parseHash(window.location.hash)
        const access_token = hashVals['access_token']
        const refresh_token = hashVals['refresh_token']

        if (access_token) {
          // Set the session so the client is authenticated
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) {
            console.error('Error setting session from fragment', error)
            router.replace('/login?error=auth_failed')
            return
          }
          router.replace('/')
          return
        }

        // Fallback: try to let supabase parse query (some flows may use query params)
        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.get('access_token')) {
          const at = searchParams.get('access_token')!
          const rt = searchParams.get('refresh_token') || undefined
          const { error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt })
          if (error) {
            console.error('Error setting session from query', error)
            router.replace('/login?error=auth_failed')
            return
          }
          router.replace('/')
          return
        }

        // If no tokens found, fall back to server exchange (for OAuth code flow)
        router.replace('/')
      } catch (err) {
        console.error(err)
        router.replace('/login?error=auth_failed')
      }
    }

    finishSignIn()
  }, [router])

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="mb-4">Signing you in…</div>
      </div>
    </div>
  )
}
