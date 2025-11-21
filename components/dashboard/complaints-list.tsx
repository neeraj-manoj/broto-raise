'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Eye, Filter, Search, ThumbsUp, User, Clock, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COMPLAINT_CATEGORIES } from '@/lib/constants'
import { ComplaintDetailModal } from './complaint-detail-modal'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { StudentProfileView } from '@/components/shared/student-profile-view'

interface ComplaintsListProps {
  complaints: any[]
  mode?: 'personal' | 'community'
  userUpvotedIds?: string[]
  currentUserId?: string
}

export function ComplaintsList({
  complaints,
  mode = 'personal',
  userUpvotedIds = [],
  currentUserId
}: ComplaintsListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set(userUpvotedIds))
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  // Use complaints directly, no need for local state that causes re-renders
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, number>>({})

  // Merge complaints with optimistic updates
  const displayComplaints = complaints.map(c => ({
    ...c,
    upvotes_count: optimisticUpdates[c.id] !== undefined
      ? optimisticUpdates[c.id]
      : (c.upvotes_count || 0)
  }))

  const handleUpvote = async (e: React.MouseEvent, complaintId: string) => {
    e.stopPropagation()
    if (!currentUserId) return

    // Prevent self-upvoting
    const currentComplaint = complaints.find(c => c.id === complaintId)
    if (currentComplaint?.created_by === currentUserId) {
      toast.error("You can't upvote your own complaint")
      return
    }

    const isUpvoted = upvotedIds.has(complaintId)
    const supabase = createClient()
    
    // Calculate optimistic count
    // We need to know if the user was originally upvoted to determine the base count
    const wasOriginallyUpvoted = userUpvotedIds.includes(complaintId)
    const originalCount = currentComplaint?.upvotes_count || 0
    const willBeUpvoted = !isUpvoted // The new state we are transitioning to

    let newCount = originalCount

    if (willBeUpvoted) {
        // We want to be upvoted.
        if (wasOriginallyUpvoted) {
             // We were originally upvoted, so originalCount is correct (assuming data is fresh).
             newCount = originalCount
        } else {
             // We were not originally upvoted, so add 1.
             newCount = originalCount + 1
        }
    } else {
        // We want to NOT be upvoted.
        if (wasOriginallyUpvoted) {
            // We were originally upvoted, so remove 1.
            newCount = originalCount - 1
        } else {
            // We were not originally upvoted, so originalCount is correct.
            newCount = originalCount
        }
    }
    
    // Ensure count doesn't go below 0
    newCount = Math.max(0, newCount)

    // Optimistic update
    const newUpvotedIds = new Set(upvotedIds)
    if (isUpvoted) {
      newUpvotedIds.delete(complaintId)
    } else {
      newUpvotedIds.add(complaintId)
    }
    setUpvotedIds(newUpvotedIds)

    setOptimisticUpdates(prev => ({
      ...prev,
      [complaintId]: newCount
    }))

    try {
      if (isUpvoted) {
        const { error } = await supabase
          .from('complaint_upvotes')
          .delete()
          .eq('complaint_id', complaintId)
          .eq('user_id', currentUserId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('complaint_upvotes')
          .insert({
            complaint_id: complaintId,
            user_id: currentUserId
          })

        if (error) throw error
      }

      // Wait a bit for the database trigger to update the count, then refresh
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (error: any) {
      console.error('Upvote error:', error)
      // Revert on error
      const revertedIds = new Set(upvotedIds)
      setUpvotedIds(revertedIds)
      setOptimisticUpdates(prev => {
        const { [complaintId]: _, ...rest } = prev
        return rest
      })

      // Check for specific error types
      if (error?.code === '23505') {
        toast.error('You have already upvoted this complaint')
      } else {
        toast.error('Failed to update upvote')
      }
    }
  }

  // Filter and Sort complaints
  const filteredComplaints = displayComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || complaint.category_id === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortBy === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (sortBy === 'most_upvoted') {
      return (b.upvotes_count || 0) - (a.upvotes_count || 0)
    }
    return 0
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

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white focus:border-blue-500">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10">
              <SelectItem value="newest" className="text-white focus:bg-blue-500/20">Newest First</SelectItem>
              <SelectItem value="oldest" className="text-white focus:bg-blue-500/20">Oldest First</SelectItem>
              <SelectItem value="most_upvoted" className="text-white focus:bg-blue-500/20">Most Upvoted</SelectItem>
            </SelectContent>
          </Select>

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
              ? (mode === 'personal'
                  ? "You haven't raised any complaints yet. Start by creating your first complaint."
                  : "No complaints found in your community yet.")
              : "No complaints match your filters. Try adjusting your search criteria."
            }
          </p>
          {complaints.length === 0 && mode === 'personal' && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/dashboard/new-complaint">Create Your First Complaint</a>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              mode={mode}
              isUpvoted={upvotedIds.has(complaint.id)}
              onUpvote={(e) => handleUpvote(e, complaint.id)}
              onProfileClick={(e) => {
                e.stopPropagation()
                setSelectedStudentId(complaint.created_by)
              }}
            />
          ))}
        </div>
      )}

      <StudentProfileView
        studentId={selectedStudentId || ''}
        open={!!selectedStudentId}
        onOpenChange={(open) => !open && setSelectedStudentId(null)}
      />
    </div>
  )
}

function ComplaintCard({
  complaint,
  mode,
  isUpvoted,
  onUpvote,
  onProfileClick
}: {
  complaint: any
  mode: 'personal' | 'community'
  isUpvoted: boolean
  onUpvote: (e: React.MouseEvent) => void
  onProfileClick?: (e: React.MouseEvent) => void
}) {
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
            {/* Header: Author info (Community) or Status (Personal) */}
            <div className="flex items-center gap-3 mb-3">
              {mode === 'community' && complaint.profiles ? (
                <div
                  className="flex items-center gap-2 mr-2 hover:bg-white/5 p-1 rounded-lg transition-colors cursor-pointer"
                  onClick={onProfileClick}
                >
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarImage src={complaint.profiles.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-xs">
                      {complaint.profiles.full_name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-none hover:text-blue-400 transition-colors">
                      {complaint.profiles.full_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {complaint.profiles.batch_name || 'Student'}
                    </span>
                  </div>
                </div>
              ) : null}

              <Badge className={`${statusColors[complaint.status as keyof typeof statusColors]} font-mono text-xs`}>
                {complaint.status.replace('_', ' ').toUpperCase()}
              </Badge>

              {mode === 'personal' && (
                <Badge className={`${priorityColors[complaint.priority as keyof typeof priorityColors]} font-mono text-xs`}>
                  {complaint.priority.toUpperCase()}
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
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
              </span>
              {mode === 'personal' && (
                <span className="flex items-center gap-1 font-mono text-blue-400">
                  <ThumbsUp className="w-3 h-3" />
                  {complaint.upvotes_count || 0} {complaint.upvotes_count === 1 ? 'upvote' : 'upvotes'}
                </span>
              )}
            </div>
          </div>

          {/* Upvote Button (Community Mode) */}
          {mode === 'community' && (
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-blue-500/10 border-none ring-0 focus:ring-0 focus-visible:ring-0 outline-none ${
                isUpvoted ? 'text-blue-400' : 'text-gray-500'
              }`}
              onClick={onUpvote}
            >
              <ThumbsUp className={`w-5 h-5 ${isUpvoted ? 'fill-current' : ''}`} />
              <span className="font-mono font-bold text-xs">
                {complaint.upvotes_count || 0}
              </span>
            </Button>
          )}
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

          {/* AI Sentiment or other metadata */}
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
