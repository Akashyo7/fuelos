"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    async function finishSignIn() {
      try {
        const supabase = createClient()
        // Parses session from the URL hash or query and stores it in local storage
        // Works for magic-link redirects from Supabase
        // @ts-ignore
        const { data, error } = await supabase.auth.getSessionFromUrl?.() ?? { data: null, error: null }
        if (error) {
          console.error('Error getting session from URL', error)
          router.replace('/login?error=auth_failed')
          return
        }

        // If session was retrieved (or user already logged in), redirect home
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
