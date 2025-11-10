import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardNav user={data.user} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
