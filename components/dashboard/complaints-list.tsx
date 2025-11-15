'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Eye, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COMPLAINT_CATEGORIES } from '@/lib/constants'
import { ComplaintDetailModal } from './complaint-detail-modal'

interface ComplaintsListProps {
  complaints: any[]
}

export function ComplaintsList({ complaints }: ComplaintsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || complaint.category_id === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <div className="space-y-6" id="complaints-section">
      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white focus:border-blue-500">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10">
              <SelectItem value="all" className="text-white focus:bg-blue-500/20">All Status</SelectItem>
              <SelectItem value="new" className="text-white focus:bg-blue-500/20">New</SelectItem>
              <SelectItem value="under_review" className="text-white focus:bg-blue-500/20">Under Review</SelectItem>
              <SelectItem value="in_progress" className="text-white focus:bg-blue-500/20">In Progress</SelectItem>
              <SelectItem value="resolved" className="text-white focus:bg-blue-500/20">Resolved</SelectItem>
              <SelectItem value="closed" className="text-white focus:bg-blue-500/20">Closed</SelectItem>
              <SelectItem value="urgent" className="text-white focus:bg-blue-500/20">Urgent</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white focus:border-blue-500">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10">
              <SelectItem value="all" className="text-white focus:bg-blue-500/20">All Categories</SelectItem>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="text-white focus:bg-blue-500/20">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12 text-center">
          <h3 className="text-xl font-bold text-white mb-2 font-mono">No Complaints Found</h3>
          <p className="text-gray-400 mb-6">
            {complaints.length === 0
              ? "You haven't raised any complaints yet. Start by creating your first complaint."
              : "No complaints match your filters. Try adjusting your search criteria."
            }
          </p>
          {complaints.length === 0 && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/dashboard/new-complaint">Create Your First Complaint</a>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  )
}

function ComplaintCard({ complaint }: { complaint: any }) {
  const [showDetailModal, setShowDetailModal] = useState(false)

  const statusColors = {
    new: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    under_review: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    in_progress: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    resolved: 'bg-green-500/10 text-green-500 border-green-500/30',
    closed: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    urgent: 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse',
  }

  const priorityColors = {
    low: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    urgent: 'bg-red-500/10 text-red-400 border-red-500/30',
  }

  return (
    <>
      <div
        className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
        onClick={() => setShowDetailModal(true)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${statusColors[complaint.status as keyof typeof statusColors]} font-mono text-xs`}>
                {complaint.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={`${priorityColors[complaint.priority as keyof typeof priorityColors]} font-mono text-xs`}>
                {complaint.priority.toUpperCase()}
              </Badge>
              {complaint.is_anonymous && (
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 font-mono text-xs">
                  ANONYMOUS
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {complaint.title}
            </h3>
            <p className="text-gray-400 line-clamp-2 mb-3">
              {complaint.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="font-mono">
                {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-sm text-gray-500">
              <span className="font-mono">Category:</span>{' '}
              <span className="text-white">
                {COMPLAINT_CATEGORIES.find(c => c.id === complaint.category_id)?.name || complaint.category_id}
              </span>
            </div>
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="text-sm text-gray-500">
                <span className="font-mono">📎 {complaint.attachments.length} file(s)</span>
              </div>
            )}
          </div>
          {complaint.ai_sentiment && (
            <div className="text-sm text-gray-500">
              <span className="font-mono">AI Sentiment:</span>{' '}
              <span className={`font-bold ${
                complaint.ai_sentiment > 0.6 ? 'text-green-400' :
                complaint.ai_sentiment > 0.3 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {(complaint.ai_sentiment * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <ComplaintDetailModal
        complaint={complaint}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />
    </>
  )
}
