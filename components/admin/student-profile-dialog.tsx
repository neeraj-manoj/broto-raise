'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { User, Mail, MapPin, Calendar, Shield, X, FileText, AlertCircle, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { ComplaintViewModal } from './complaint-view-modal'

interface StudentProfileDialogProps {
  studentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentProfileDialog({ studentId, open, onOpenChange }: StudentProfileDialogProps) {
  const [profile, setProfile] = useState<any>(null)
  const [complaints, setComplaints] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null)
  const [showComplaintView, setShowComplaintView] = useState(false)

  useEffect(() => {
    if (open && studentId) {
      fetchStudentData()
    }
  }, [open, studentId])

  const fetchStudentData = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url, location_id, created_at')
        .eq('id', studentId)
        .single()

      if (profileError) {

        setProfile(null)
      } else {
        // Fetch location separately if location_id exists
        let enrichedProfile: any = { ...profileData }
        if (profileData?.location_id) {
          const { data: locationData } = await supabase
            .from('locations')
            .select('id, name, city')
            .eq('id', profileData.location_id)
            .single()

          enrichedProfile.location = locationData
        }
        setProfile(enrichedProfile)
      }

      // Fetch student's complaint statistics (exclude anonymous complaints)
      const { data: complaintsData } = await supabase
        .from('complaints')
        .select('id, title, status, priority, created_at, category_id, is_anonymous')
        .eq('student_id', studentId)
        .eq('is_anonymous', false)
        .order('created_at', { ascending: false })

      setComplaints(complaintsData || [])
    } catch (error) {

    } finally {
      setIsLoading(false)
    }
  }

  const statusColors = {
    new: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    under_review: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    in_progress: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    resolved: 'bg-green-500/10 text-green-500 border-green-500/30',
    closed: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  }

  const getComplaintStats = () => {
    if (!complaints.length) return null

    const total = complaints.length
    const resolved = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length
    const pending = complaints.filter(c => c.status === 'new' || c.status === 'under_review').length
    const inProgress = complaints.filter(c => c.status === 'in_progress').length

    return { total, resolved, pending, inProgress }
  }

  const stats = getComplaintStats()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-white/10 text-white !max-w-[98vw] !w-[98vw] !h-[98vh] overflow-hidden flex flex-col p-0 !z-[55]">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-xl sm:text-2xl font-bold font-mono">Student Profile</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : profile ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Profile Overview */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-blue-500/20 border-2 border-blue-500/30 flex items-center justify-center overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt="Profile"
                        width={96}
                        height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User className="h-10 w-10 text-blue-400" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white text-center sm:text-left">{profile.full_name}</h3>
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 mt-2">
                      {profile.role?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="text-white truncate">{profile.email}</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="text-white truncate">{profile.location.name}, {profile.location.city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Member since: <span className="text-white">{format(new Date(profile.created_at), 'MMM dd, yyyy')}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Shield className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">User ID: <span className="text-white font-mono text-xs">{profile.id.slice(0, 8)}...</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaint Statistics */}
            {stats && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Complaint Statistics
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4">
                    <p className="text-xl sm:text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-gray-400 mt-1">Total Complaints</p>
                  </div>
                  <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4">
                    <p className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.pending}</p>
                    <p className="text-xs text-gray-400 mt-1">Pending</p>
                  </div>
                  <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4">
                    <p className="text-xl sm:text-2xl font-bold text-purple-400">{stats.inProgress}</p>
                    <p className="text-xs text-gray-400 mt-1">In Progress</p>
                  </div>
                  <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4">
                    <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.resolved}</p>
                    <p className="text-xs text-gray-400 mt-1">Resolved</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Complaints */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                Recent Complaints ({complaints.length})
              </h3>
              {complaints.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto pr-2">
                  {complaints.slice(0, 10).map((complaint) => (
                    <div
                      key={complaint.id}
                      onClick={() => {
                        setSelectedComplaintId(complaint.id)
                        setShowComplaintView(true)
                      }}
                      className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4 hover:border-blue-500/50 hover:bg-white/10 transition-all cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium truncate text-sm sm:text-base group-hover:text-blue-400 transition-colors">{complaint.title}</h4>
                            <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-blue-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(complaint.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge className={`${statusColors[complaint.status as keyof typeof statusColors]} text-xs whitespace-nowrap flex-shrink-0`}>
                          {complaint.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No complaints found</p>
              )}
            </div>
          </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Profile not found</p>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Complaint View Modal */}
      <ComplaintViewModal
        complaintId={selectedComplaintId}
        open={showComplaintView}
        onOpenChange={setShowComplaintView}
      />
    </Dialog>
  )
}
