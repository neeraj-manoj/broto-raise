import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle, List } from 'lucide-react'

export function DashboardActionCard() {
  return (
    <div className="hidden lg:grid grid-cols-2 gap-4 mb-8">
      <Button
        asChild
        size="lg"
        className="h-32 text-xl font-bold bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 border border-blue-400/20 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 text-white"
      >
        <Link href="/dashboard/new-complaint" className="flex flex-col items-center justify-center gap-3 text-white">
          <PlusCircle className="w-8 h-8 text-white" />
          <span className="text-white">Raise New Complaint</span>
        </Link>
      </Button>

      <Button
        asChild
        size="lg"
        variant="outline"
        className="h-32 text-xl font-bold bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-300"
      >
        <Link href="/dashboard/my-complaints" className="flex flex-col items-center justify-center gap-3">
          <List className="w-8 h-8" />
          <span>My Complaints</span>
        </Link>
      </Button>
    </div>
  )
}
