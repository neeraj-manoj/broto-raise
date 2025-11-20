'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { User, MapPin, Calendar, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { ComplaintDetailModal } from '@/components/dashboard/complaint-detail-modal'

interface StudentProfileViewProps {
  studentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentProfileView({ studentId, open, onOpenChange }: StudentProfileViewProps) {
  const [profile, setProfile] = useState<any>(null)
  const [complaints, setComplaints] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, location_id, batch_name, created_at')
        .eq('id', studentId)
        .single()

      if (profileData) {
        // Fetch location separately if location_id exists
        let enrichedProfile: any = { ...profileData }
        if (profileData.location_id) {
          const { data: locationData } = await supabase
            .from('locations')
            .select('name, city')
            .eq('id', profileData.location_id)
            .single()

          enrichedProfile.location = locationData
        }
        setProfile(enrichedProfile)
      }

      // Fetch student's non-anonymous complaints
      const { data: complaintsData } = await supabase
        .from('complaints')
        .select('*')
        .eq('created_by', studentId)
        .eq('is_anonymous', false)
        .order('created_at', { ascending: false })

      setComplaints(complaintsData || [])
    } catch (error) {
      console.error('Error fetching student data:', error)
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
    urgent: 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse',
  }

  const Content = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-2 border-white/10">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-blue-600 text-xl">
            {profile?.full_name?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold text-white">{profile?.full_name}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-300">
              {profile?.batch_name || 'Student'}
            </Badge>
            {profile?.location && (
              <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-300 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {profile.location.city}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-gray-400 text-sm mb-1">Complaints Raised</div>
          <div className="text-2xl font-bold text-white">{complaints.length}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-gray-400 text-sm mb-1">Joined</div>
          <div className="text-lg font-bold text-white">
            {profile?.created_at ? format(new Date(profile.created_at), 'MMM yyyy') : '-'}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          Recent Public Complaints
        </h3>
        <div className="space-y-3">
          {complaints.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white/5 rounded-lg border border-white/10">
              No public complaints found
            </div>
          ) : (
            complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-blue-500/30 transition-colors cursor-pointer"
                onClick={() => setSelectedComplaint(complaint)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${statusColors[complaint.status as keyof typeof statusColors]} font-mono text-[10px]`}>
                    {complaint.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-xs text-gray-500 font-mono">
                    {format(new Date(complaint.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <h4 className="text-white font-medium line-clamp-1 mb-1">{complaint.title}</h4>
                <p className="text-gray-400 text-sm line-clamp-2">{complaint.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="bg-gray-900 border-t border-white/10 max-h-[90vh]">
            <DrawerHeader className="text-left">
              <DrawerTitle>Student Profile</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              ) : (
                <Content />
              )}
            </div>
          </DrawerContent>
        </Drawer>

        {selectedComplaint && (
          <ComplaintDetailModal
            complaint={selectedComplaint}
            open={!!selectedComplaint}
            onOpenChange={(open) => !open && setSelectedComplaint(null)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : (
            <Content />
          )}
        </DialogContent>
      </Dialog>

      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          open={!!selectedComplaint}
          onOpenChange={(open) => !open && setSelectedComplaint(null)}
        />
      )}
    </>
  )
}
