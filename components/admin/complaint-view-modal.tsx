'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { Download, FileText, Image as ImageIcon, MapPin, Calendar, Clock, ThumbsUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { COMPLAINT_CATEGORIES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ComplaintViewModalProps {
  complaintId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ComplaintViewModal({ complaintId, open, onOpenChange }: ComplaintViewModalProps) {
  const [complaint, setComplaint] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if viewport is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (complaintId && open) {
      fetchComplaint()
    }
  }, [complaintId, open])

  const fetchComplaint = async () => {
    if (!complaintId) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: complaintData } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', complaintId)
        .single()

      if (complaintData) {
        // Fetch student and location data
        if (complaintData.student_id) {
          const { data: studentData } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .eq('id', complaintData.student_id)
            .single()
          complaintData.student = studentData
        }

        if (complaintData.location_id) {
          const { data: locationData } = await supabase
            .from('locations')
            .select('id, name, city')
            .eq('id', complaintData.location_id)
            .single()
          complaintData.location = locationData
        }

        setComplaint(complaintData)
      }
    } catch (error) {

      toast.error('Failed to load complaint')
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

  const priorityColors = {
    low: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    urgent: 'bg-red-500/10 text-red-400 border-red-500/30',
  }

  const downloadAttachment = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.click()

      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    } catch (error) {

      toast.error('Failed to download file')
    }
  }

  if (!complaint && !isLoading) return null

  const modalContent = (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : complaint ? (
        <div className={`space-y-${isMobile ? '4' : '6'}`}>
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
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
            <Badge className="bg-white/5 text-gray-400 border-white/10 font-mono text-xs">
              {COMPLAINT_CATEGORIES.find(c => c.id === complaint.category_id)?.name || complaint.category_id}
            </Badge>
          </div>

          {/* Metadata */}
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-${isMobile ? '3' : '4'} text-sm`}>
            {complaint.location && (
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className={isMobile ? 'text-xs' : ''}>Location: <span className="text-white">{complaint.location.city}</span></span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className={isMobile ? 'text-xs' : ''}><span className="text-white">{formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}</span></span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className={isMobile ? 'text-xs' : ''}>Created: <span className="text-white">{format(new Date(complaint.created_at), 'MMM dd, yyyy')}</span></span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <ThumbsUp className="h-4 w-4 flex-shrink-0" />
              <span className={isMobile ? 'text-xs' : ''}>Upvotes: <span className="text-white">{complaint.upvotes_count || 0}</span></span>
            </div>
          </div>

          {/* Description */}
          <div className={`bg-white/5 rounded-${isMobile ? 'xl' : 'lg'} border border-white/10 p-${isMobile ? '4' : '6'}`}>
            <h3 className={`text-${isMobile ? 'xs' : 'sm'} font-semibold text-gray-400 mb-${isMobile ? '2' : '3'}`}>Description</h3>
            <p className={`text-${isMobile ? 'sm' : 'base'} text-white whitespace-pre-wrap leading-relaxed`}>
              {complaint.description}
            </p>
          </div>

          {/* Attachments */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div className={`bg-white/5 rounded-${isMobile ? 'xl' : 'lg'} border border-white/10 p-${isMobile ? '4' : '6'}`}>
              <h3 className={`text-${isMobile ? 'xs' : 'sm'} font-semibold text-gray-400 mb-${isMobile ? '3' : '4'}`}>Attachments ({complaint.attachments.length})</h3>
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-2' : 'md:grid-cols-2 gap-3'}`}>
                    {complaint.attachments.map((attachment: any, index: number) => {
                      // Parse attachment if it's a string or double-encoded
                      let file = attachment

                      // Handle string attachments
                      if (typeof attachment === 'string') {
                        try {
                          file = JSON.parse(attachment)
                        } catch {
                          file = { url: attachment, name: 'Unknown', size: 0, type: 'application/octet-stream' }
                        }
                      }

                      // Handle double-encoded (url field contains full JSON)
                      if (file.url && typeof file.url === 'string' && file.url.startsWith('{')) {
                        try {
                          file = JSON.parse(file.url)
                        } catch {
                          // Keep as-is if parsing fails
                        }
                      }

                      const isImage = file.type?.startsWith('image/')
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-white/5 rounded-lg border border-white/10 p-3 hover:bg-white/10 transition-colors group"
                        >
                          <div className="flex-shrink-0">
                            {isImage ? (
                              <ImageIcon className="h-8 w-8 text-blue-400" />
                            ) : (
                              <FileText className="h-8 w-8 text-purple-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                            </p>
                          </div>
                          <button
                            onClick={() => downloadAttachment(file.url, file.name)}
                            className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Admin Response */}
              {complaint.admin_response && (
                <div className={`bg-blue-500/10 rounded-${isMobile ? 'xl' : 'lg'} border border-blue-500/30 p-${isMobile ? '4' : '6'}`}>
                  <h3 className={`text-${isMobile ? 'xs' : 'sm'} font-semibold text-blue-400 mb-${isMobile ? '2' : '3'}`}>Admin Response</h3>
                  <p className={`text-${isMobile ? 'sm' : 'base'} text-white whitespace-pre-wrap leading-relaxed`}>
                    {complaint.admin_response}
                  </p>
                </div>
              )}
        </div>
      ) : null}
    </>
  )

  return (
    <>
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="h-[90vh] bg-gray-900 border-t-2 border-white/20 p-0 overflow-hidden !z-[60]">
            <div className="h-full flex flex-col">
              <DrawerHeader className="px-4 pb-4 pt-2 space-y-3 border-b border-white/10">
                <DrawerTitle className="text-xl font-bold font-mono text-white text-left leading-tight pr-8">
                  {isLoading ? 'Loading...' : complaint ? complaint.title : 'Complaint Details'}
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto px-4 py-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                {modalContent}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="bg-gray-900 text-gray-100 max-w-4xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] !z-[60]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-mono text-white pr-8">
                {isLoading ? 'Loading...' : complaint ? complaint.title : 'Complaint Details'}
              </DialogTitle>
            </DialogHeader>
            {modalContent}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
