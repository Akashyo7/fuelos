'use client'
import { useRouter } from 'next/navigation'

export default function BottomNav({ active }: { active: 'home' | 'progress' }) {
  const router = useRouter()
  return (
    <div className="flex border-t border-border bg-ground flex-shrink-0 pb-7">
      <button
        onClick={() => router.push('/home')}
        className={`flex-1 flex flex-col items-center gap-1 pt-3 text-xs tracking-wide ${active === 'home' ? 'text-accent' : 'text-muted'}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        Home
      </button>
      <button
        onClick={() => router.push('/progress')}
        className={`flex-1 flex flex-col items-center gap-1 pt-3 text-xs tracking-wide ${active === 'progress' ? 'text-accent' : 'text-muted'}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6"  y1="20" x2="6"  y2="14"/>
        </svg>
        Progress
      </button>
    </div>
  )
}
