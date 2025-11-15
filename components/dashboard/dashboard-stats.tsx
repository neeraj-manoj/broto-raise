'use client'

import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface DashboardStatsProps {
  stats: {
    total: number
    pending: number
    inProgress: number
    resolved: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      <StatCard
        icon={<FileText className="h-6 w-6 md:h-8 md:w-8" />}
        label="Total Complaints"
        value={stats.total}
        color="blue"
      />
      <StatCard
        icon={<AlertCircle className="h-6 w-6 md:h-8 md:w-8" />}
        label="Pending"
        value={stats.pending}
        color="yellow"
      />
      <StatCard
        icon={<Clock className="h-6 w-6 md:h-8 md:w-8" />}
        label="In Progress"
        value={stats.inProgress}
        color="purple"
      />
      <StatCard
        icon={<CheckCircle className="h-6 w-6 md:h-8 md:w-8" />}
        label="Resolved"
        value={stats.resolved}
        color="green"
      />
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'yellow' | 'purple' | 'green'
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
    green: 'text-green-500 bg-green-500/10 border-green-500/30',
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-3xl lg:rounded-xl border border-white/10 p-4 md:p-6 hover:border-blue-500/50 transition-all duration-300 aspect-square lg:aspect-auto flex flex-col lg:flex-row lg:items-start justify-between">
      {/* Mobile: Icon and label at top-left, value centered */}
      <div className="flex items-center gap-2 mb-auto lg:hidden">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <p className="text-gray-400 text-xs font-medium">{label}</p>
      </div>
      <div className={`text-5xl md:text-6xl lg:text-4xl font-black font-mono ${colorClasses[color].split(' ')[0]} text-center lg:hidden my-auto`}>
        {value}
      </div>

      {/* Desktop: Original layout */}
      <div className="hidden lg:flex lg:flex-col lg:w-full">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          <div className={`text-4xl font-black font-mono ${colorClasses[color].split(' ')[0]}`}>
            {value}
          </div>
        </div>
        <p className="text-gray-400 text-sm font-medium">{label}</p>
      </div>
    </div>
  )
}
