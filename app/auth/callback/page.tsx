"use client"
import { useEffect, useState } from 'react'
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
  const [status, setStatus] = useState('Signing you in…')
  const [details, setDetails] = useState<string | null>(null)

  useEffect(() => {
    async function finishSignIn() {
      try {
        const supabase = createClient()

        const hashVals = parseHash(window.location.hash)
        const access_token = hashVals['access_token']
        const refresh_token = hashVals['refresh_token']

        if (access_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) {
            console.error('Error setting session from fragment', error)
            setStatus('Failed to sign in using the link.')
            setDetails(`Fragment session error: ${error.message}`)
            return
          }
          router.replace('/')
          return
        }

        const searchParams = new URLSearchParams(window.location.search)
        // If Supabase returned an OAuth `code` (server-side exchange), forward
        // the browser to our server exchange endpoint which will perform the
        // `exchangeCodeForSession` and redirect the user.
        if (searchParams.get('code')) {
          setStatus('Exchanging server code...')
          // Preserve the full query string when forwarding to the API route
          const qs = window.location.search.substring(1)
          window.location.href = `/api/auth/callback?${qs}`
          return
        }

        if (searchParams.get('access_token')) {
          const at = searchParams.get('access_token')!
          const rt = searchParams.get('refresh_token') || undefined
          const { error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt })
          if (error) {
            console.error('Error setting session from query', error)
            setStatus('Failed to sign in using the link.')
            setDetails(`Query session error: ${error.message}`)
            return
          }
          router.replace('/')
          return
        }

        const errorCode = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        if (errorCode) {
          setStatus('Sign-in link returned an error.')
          setDetails(`Error: ${errorCode}\nDescription: ${errorDescription || 'No details'}\nURL: ${window.location.href}`)
          return
        }

        setStatus('Sign-in link did not return a valid token.')
        setDetails(`URL: ${window.location.href}`)
      } catch (err) {
        console.error(err)
        setStatus('Unexpected sign-in error')
        setDetails(String(err))
      }
    }

    finishSignIn()
  }, [router])

  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="max-w-lg rounded-3xl border border-border bg-surface p-8 text-center shadow-lg">
        <h1 className="text-xl font-bold text-ink mb-4">{status}</h1>
        {details && (
          <div className="text-left text-sm text-muted whitespace-pre-wrap bg-s2 rounded-2xl p-4">
            {details}
          </div>
        )}
      </div>
    </div>
  )
}
