'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface DashboardNavProps {
  user: User
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="w-64 bg-white border-r border-gray-200 shadow-sm p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-600">🎯 Toimipaikka</h1>
        <p className="text-xs text-gray-500 mt-1">Analysaattori</p>
      </div>

      <div className="flex-1">
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded"
          >
            📊 Analyysi
          </Link>
          <Link
            href="/dashboard/projects"
            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded"
          >
            📁 Projektit
          </Link>
          <Link
            href="/dashboard/history"
            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded"
          >
            📜 Historia
          </Link>
        </nav>
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="text-xs text-gray-600">
          <p className="font-semibold">{user.email}</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-xs"
        >
          Kirjaudu ulos
        </Button>
      </div>
    </nav>
  )
}
