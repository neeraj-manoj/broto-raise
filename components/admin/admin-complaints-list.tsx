'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Eye, Filter, Search, UserCheck, Ban, CheckCircle2, Clock } from 'lucide-react'
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
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AdminComplaintsListProps {
  complaints: any[]
}

export function AdminComplaintsList({ complaints }: AdminComplaintsListProps) {
  const router = useRouter()
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [locations, setLocations] = useState<any[]>([])

  // Fetch all locations from database
  useEffect(() => {
    const fetchLocations = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('city', { ascending: true })

      if (!error && data) {
        setLocations(data)
      }
    }

    fetchLocations()
  }, [])

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())

    // Handle pending status (includes new and under_review)
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'pending' && (complaint.status === 'new' || complaint.status === 'under_review')) ||
                         (statusFilter === 'resolved' && (complaint.status === 'resolved' || complaint.status === 'closed')) ||
                         complaint.status === statusFilter

    const matchesCategory = categoryFilter === 'all' || complaint.category_id === categoryFilter
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter
    const matchesLocation = locationFilter === 'all' || complaint.location?.id === locationFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesLocation
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search complaints or students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:border-blue-500">
              <SelectValue placeholder="All Categories" />
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

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:border-blue-500">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10">
              <SelectItem value="all" className="text-white focus:bg-blue-500/20">All Status</SelectItem>
              <SelectItem value="pending" className="text-white focus:bg-blue-500/20">Pending</SelectItem>
              <SelectItem value="in_progress" className="text-white focus:bg-blue-500/20">In Progress</SelectItem>
              <SelectItem value="resolved" className="text-white focus:bg-blue-500/20">Resolved</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:border-blue-500">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10">
              <SelectItem value="all" className="text-white focus:bg-blue-500/20">All Priority</SelectItem>
              <SelectItem value="low" className="text-white focus:bg-blue-500/20">Low</SelectItem>
              <SelectItem value="medium" className="text-white focus:bg-blue-500/20">Medium</SelectItem>
              <SelectItem value="high" className="text-white focus:bg-blue-500/20">High</SelectItem>
              <SelectItem value="urgent" className="text-white focus:bg-blue-500/20">Urgent</SelectItem>
            </SelectContent>
          </Select>

          {/* Location Filter */}
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:border-blue-500">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10">
              <SelectItem value="all" className="text-white focus:bg-blue-500/20">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id} className="text-white focus:bg-blue-500/20">
                  {location.name}, {location.city}
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
          <p className="text-gray-400">
            {complaints.length === 0
              ? "No complaints have been submitted yet."
              : "No complaints match your filters. Try adjusting your search criteria."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <AdminComplaintCard key={complaint.id} complaint={complaint} onUpdate={() => router.refresh()} />
          ))}
        </div>
      )}
    </div>
  )
}

function AdminComplaintCard({ complaint, onUpdate }: { complaint: any; onUpdate: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false)
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

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('complaints')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'resolved' ? { resolved_at: new Date().toISOString() } : {})
        })
        .eq('id', complaint.id)

      if (error) throw error

      // Create notification for student
      const notificationMessages: { [key: string]: { title: string; message: string } } = {
        in_progress: {
          title: 'Complaint In Progress',
          message: `Your complaint "${complaint.title}" is now being worked on.`
        },
        resolved: {
          title: 'Complaint Resolved',
          message: `Your complaint "${complaint.title}" has been resolved.`
        },
        closed: {
          title: 'Complaint Closed',
          message: `Your complaint "${complaint.title}" has been closed.`
        },
        under_review: {
          title: 'Complaint Under Review',
          message: `Your complaint "${complaint.title}" is under review.`
        }
      }

      const notification = notificationMessages[newStatus]
      if (notification && complaint.student_id) {
        await supabase.from('notifications').insert({
          user_id: complaint.student_id,
          complaint_id: complaint.id,
          type: 'status_update',
          title: notification.title,
          message: notification.message,
        })
      }

      toast.success(`Complaint ${newStatus.replace('_', ' ')}`)
      onUpdate()
    } catch (error) {
      toast.error('Failed to update complaint')

    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <div
        className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
        onClick={() => setShowDetailModal(true)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
              {complaint.location && (
                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-mono text-xs">
                  {complaint.location.name}
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {complaint.title}
            </h3>
            <p className="text-gray-400 line-clamp-2 mb-3">
              {complaint.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              {!complaint.is_anonymous && complaint.student && (
                <span className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  {complaint.student.full_name}
                </span>
              )}
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

          {/* Quick Actions */}
          <div className="flex gap-2">
            {(complaint.status === 'new' || complaint.status === 'under_review') && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusUpdate('in_progress')
                  }}
                  disabled={isUpdating}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Start
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusUpdate('closed')
                  }}
                  disabled={isUpdating}
                >
                  <Ban className="h-3 w-3 mr-1" />
                  Close
                </Button>
              </>
            )}
            {complaint.status === 'in_progress' && (
              <Button
                size="sm"
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusUpdate('resolved')
                }}
                disabled={isUpdating}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            )}
          </div>
        </div>
      </div>

      <ComplaintDetailModal
        complaint={complaint}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onUpdate={onUpdate}
      />
    </>
  )
}
