'use client'

import { FileText, Clock, CheckCircle, AlertCircle, Zap, TrendingUp } from 'lucide-react'

interface AdminStatsProps {
  stats: {
    total: number
    pending: number
    inProgress: number
    resolved: number
    urgent: number
    activeUrgent: number
    avgResolutionTime: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
      <StatCard
        icon={<FileText className="h-5 w-5 md:h-6 md:w-6" />}
        label="Total"
        value={stats.total}
        color="blue"
      />
      <StatCard
        icon={<AlertCircle className="h-5 w-5 md:h-6 md:w-6" />}
        label="Pending"
        value={stats.pending}
        color="yellow"
        highlight={stats.pending > 0}
      />
      <StatCard
        icon={<Clock className="h-5 w-5 md:h-6 md:w-6" />}
        label="In Progress"
        value={stats.inProgress}
        color="purple"
      />
      <StatCard
        icon={<CheckCircle className="h-5 w-5 md:h-6 md:w-6" />}
        label="Resolved"
        value={stats.resolved}
        color="green"
      />
      <StatCard
        icon={<Zap className="h-5 w-5 md:h-6 md:w-6" />}
        label="Urgent"
        value={stats.activeUrgent}
        color="red"
        highlight={stats.activeUrgent > 0}
        showNoIssuesMessage={stats.activeUrgent === 0}
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5 md:h-6 md:w-6" />}
        label="Avg. Time"
        value={stats.avgResolutionTime === 0 ? 'N/A' : `${stats.avgResolutionTime}h`}
        color="cyan"
        isText={stats.avgResolutionTime === 0}
      />
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  color: 'blue' | 'yellow' | 'purple' | 'green' | 'red' | 'cyan'
  highlight?: boolean
  isText?: boolean
  showNoIssuesMessage?: boolean
}

function StatCard({ icon, label, value, color, highlight, isText, showNoIssuesMessage }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
    green: 'text-green-500 bg-green-500/10 border-green-500/30',
    red: 'text-red-500 bg-red-500/10 border-red-500/30',
    cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
  }

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-3xl lg:rounded-xl border p-3 md:p-4 transition-all duration-300 aspect-square lg:aspect-auto flex flex-col lg:flex-row lg:items-start justify-between ${
      highlight
        ? 'border-red-500/50 ring-2 ring-red-500/20 animate-pulse'
        : 'border-white/10 hover:border-blue-500/50'
    }`}>
      {/* Mobile: Icon and label at top-left, value centered */}
      <div className="flex items-center gap-2 mb-auto lg:hidden">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <p className="text-gray-400 text-xs font-medium">{label}</p>
      </div>
      <div className={`${isText ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl'} font-black font-mono ${colorClasses[color].split(' ')[0]} text-center lg:hidden my-auto`}>
        {value}
      </div>

      {/* Desktop: Original layout */}
      <div className="hidden lg:flex lg:flex-col lg:w-full">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          <div className={`${isText ? 'text-2xl' : 'text-3xl'} font-black font-mono ${colorClasses[color].split(' ')[0]}`}>
            {value}
          </div>
        </div>
        <p className="text-gray-400 text-xs font-medium">{label}</p>
        {showNoIssuesMessage && (
          <p className="text-gray-500 text-[10px] mt-1 italic">No active urgent issues</p>
        )}
      </div>
    </div>
  )
}
