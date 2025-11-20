'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { X, Download, FileText, Image as ImageIcon, UserCheck, MapPin, Calendar, Clock, Ban, CheckCircle2, Eye, MessageSquare, Sparkles, Wand2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
import { StudentProfileDialog } from './student-profile-dialog'

interface ComplaintDetailModalProps {
  complaint: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function ComplaintDetailModal({ complaint, open, onOpenChange, onUpdate }: ComplaintDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showStudentProfile, setShowStudentProfile] = useState(false)
  const [currentComplaint, setCurrentComplaint] = useState(complaint)
  const [adminResponse, setAdminResponse] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)
  const [showResponseEditor, setShowResponseEditor] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [previousResponse, setPreviousResponse] = useState('')
  const [hasEnhanced, setHasEnhanced] = useState(false)
  const [adminProfile, setAdminProfile] = useState<any>(null)
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
    setCurrentComplaint(complaint)
    setAdminResponse(complaint.admin_response || '')

    // Fetch admin profile
    const fetchAdminProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single()
        setAdminProfile(profile)
      }
    }
    fetchAdminProfile()
    setShowResponseEditor(false) // Reset editor visibility when complaint changes
    setPreviousResponse('') // Reset undo history
    setHasEnhanced(false) // Reset enhancement state
  }, [complaint])

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
        .eq('id', currentComplaint.id)

      if (error) throw error

      // Create notification for student
      const notificationMessages: { [key: string]: { title: string; message: string } } = {
        in_progress: {
          title: 'Complaint In Progress',
          message: `Your complaint "${currentComplaint.title}" is now being worked on.`
        },
        resolved: {
          title: 'Complaint Resolved',
          message: `Your complaint "${currentComplaint.title}" has been resolved.`
        },
        closed: {
          title: 'Complaint Closed',
          message: `Your complaint "${currentComplaint.title}" has been closed.`
        },
        under_review: {
          title: 'Complaint Under Review',
          message: `Your complaint "${currentComplaint.title}" is under review.`
        }
      }

      const notification = notificationMessages[newStatus]
      if (notification && currentComplaint.student_id) {
        await supabase.from('notifications').insert({
          user_id: currentComplaint.student_id,
          complaint_id: currentComplaint.id,
          type: 'status_update',
          title: notification.title,
          message: notification.message,
        })
      }

      toast.success(`Complaint ${newStatus.replace('_', ' ')}`)
      onUpdate()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to update complaint')

    } finally {
      setIsUpdating(false)
    }
  }

  const handleGenerateAIResponse = async () => {
    setIsGeneratingAI(true)
    setPreviousResponse(adminResponse) // Save current state for undo
    try {
      const response = await fetch('/api/admin/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintTitle: currentComplaint.title,
          complaintDescription: currentComplaint.description,
          complaintCategory: COMPLAINT_CATEGORIES.find(c => c.id === currentComplaint.category_id)?.name,
          priority: currentComplaint.priority,
          location: currentComplaint.location?.name,
          studentName: currentComplaint.is_anonymous ? null : currentComplaint.student?.full_name,
          adminName: adminProfile?.full_name,
          adminRole: adminProfile?.role
        })
      })

      if (!response.ok) throw new Error('Failed to generate response')

      const data = await response.json()
      setAdminResponse(data.response)
      toast.success('AI response generated successfully')
    } catch (error) {

      toast.error('Failed to generate AI response')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleEnhanceResponse = async () => {
    if (!adminResponse.trim()) {
      toast.error('Please enter some text first')
      return
    }


    setIsGeneratingAI(true)
    setPreviousResponse(adminResponse) // Save current state for undo
    try {
      const response = await fetch('/api/admin/enhance-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentResponse: adminResponse,
          complaintTitle: currentComplaint.title,
          complaintDescription: currentComplaint.description,
          studentName: currentComplaint.is_anonymous ? null : currentComplaint.student?.full_name,
          adminName: adminProfile?.full_name,
          adminRole: adminProfile?.role
        })
      })



      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to enhance response')
      }

      const data = await response.json()



      if (data.response && data.response.trim()) {
        setAdminResponse(data.response) // Replace completely with enhanced version
        setHasEnhanced(true) // Mark as enhanced
        toast.success('Response enhanced successfully')
      } else {
        throw new Error('Empty response received from API')
      }
    } catch (error: any) {

      toast.error(error.message || 'Failed to enhance response')
      setPreviousResponse('') // Clear undo on error
      setHasEnhanced(false)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleUndoAI = () => {
    setAdminResponse(previousResponse)
    setPreviousResponse('')
    setHasEnhanced(false) // Reset enhancement state on undo
    toast.success('Changes reverted')
  }

  const handleSubmitResponse = async () => {
    if (!adminResponse.trim()) {
      toast.error('Please enter a response')
      return
    }

    setIsSubmittingResponse(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('complaints')
        .update({
          admin_response: adminResponse.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentComplaint.id)

      if (error) throw error

      // Create notification for student
      if (currentComplaint.student_id) {
        const adminName = adminProfile?.full_name || 'An administrator'
        const isUpdate = currentComplaint.admin_response && currentComplaint.admin_response !== adminResponse.trim()

        await supabase.from('notifications').insert({
          user_id: currentComplaint.student_id,
          complaint_id: currentComplaint.id,
          type: 'admin_response',
          title: isUpdate ? 'Admin Response Updated' : 'Admin Response Received',
          message: `${adminName} has ${isUpdate ? 'updated their' : 'sent a'} response to your complaint: "${currentComplaint.title}". Check your complaints to view the full response.`
        })
      }

      toast.success('Response submitted successfully')
      onUpdate()
      setCurrentComplaint({ ...currentComplaint, admin_response: adminResponse.trim() })
      setShowResponseEditor(false) // Hide editor after successful submission
    } catch (error) {
      toast.error('Failed to submit response')

    } finally {
      setIsSubmittingResponse(false)
    }
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

      // Clean up the object URL after download
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    } catch (error) {

      toast.error('Failed to download file')
    }
  }

  const modalContent = (
    <>
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap text-sm md:text-base">
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
          {currentComplaint.location && (
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-mono text-xs">
              {currentComplaint.location.name}
            </Badge>
          )}
          <Badge className="bg-white/5 text-gray-400 border-white/10 font-mono text-xs">
            {COMPLAINT_CATEGORIES.find(c => c.id === currentComplaint.category_id)?.name || currentComplaint.category_id}
          </Badge>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Complaint Details */}
          <div className="space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-1 gap-4 text-sm">
              {!currentComplaint.is_anonymous && currentComplaint.student && (
                <div className="flex items-center justify-between bg-white/5 rounded-lg border border-white/10 p-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <UserCheck className="h-4 w-4" />
                    <span>Submitted by: <span className="text-white font-medium">{currentComplaint.student.full_name}</span></span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStudentProfile(true)}
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {currentComplaint.location && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>Location: <span className="text-white">{currentComplaint.location.city}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Created: <span className="text-white">{format(new Date(currentComplaint.created_at), 'MMM dd, yyyy')}</span></span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="h-4 w-4" />
                <span><span className="text-white">{formatDistanceToNow(new Date(currentComplaint.created_at), { addSuffix: true })}</span></span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/5 rounded-lg border border-white/10 p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Description</h3>
              <p className="text-white whitespace-pre-wrap leading-relaxed">
                {currentComplaint.description}
              </p>
            </div>

            {/* Attachments */}
            {currentComplaint.attachments && currentComplaint.attachments.length > 0 && (
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Attachments ({currentComplaint.attachments.length})</h3>
                <div className="grid grid-cols-1 gap-3">
                  {currentComplaint.attachments.map((attachment: any, index: number) => {
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

                    return (
                      <div key={index} className="flex items-center gap-3 bg-white/5 rounded-lg border border-white/10 p-3 hover:border-blue-500/50 transition-colors">
                        {file.type?.startsWith('image/') ? (
                          <ImageIcon className="h-5 w-5 text-blue-400" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-400" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadAttachment(file.url, file.name)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Admin Response */}
          <div className="space-y-6 lg:sticky lg:top-0 lg:self-start">
            {/* Admin Response Section */}
            <div className="bg-white/5 rounded-lg border border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-gray-400">Admin Response</h3>
                </div>
                {currentComplaint.admin_response && !showResponseEditor && (
                  <Button
                    onClick={() => setShowResponseEditor(true)}
                    size="sm"
                    variant="outline"
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Update Response
                  </Button>
                )}
              </div>

              {currentComplaint.admin_response && !showResponseEditor ? (
                <div className="bg-blue-500/10 rounded-lg border border-blue-500/30 p-4">
                  <p className="text-white whitespace-pre-wrap leading-relaxed">
                    {currentComplaint.admin_response}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {!adminResponse.trim() ? (
                        <Button
                          onClick={handleGenerateAIResponse}
                          disabled={isGeneratingAI || isSubmittingResponse}
                          size="sm"
                          variant="outline"
                          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                        >
                          {isGeneratingAI ? (
                            <>
                              <Sparkles className="h-3 w-3 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              Generate with AI
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleEnhanceResponse}
                          disabled={isGeneratingAI || isSubmittingResponse || hasEnhanced}
                          size="sm"
                          variant="outline"
                          className={hasEnhanced ? "border-gray-500/30 text-gray-500 cursor-not-allowed" : "border-purple-500/30 text-purple-400 hover:bg-purple-500/10"}
                        >
                          {isGeneratingAI ? (
                            <>
                              <Wand2 className="h-3 w-3 mr-1 animate-spin" />
                              Enhancing...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-3 w-3 mr-1" />
                              {hasEnhanced ? 'Enhanced' : 'Enhance with AI'}
                            </>
                          )}
                        </Button>
                      )}
                      {previousResponse && (
                        <Button
                          onClick={handleUndoAI}
                          disabled={isGeneratingAI || isSubmittingResponse}
                          size="sm"
                          variant="outline"
                          className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                        >
                          <Undo2 className="h-3 w-3 mr-1" />
                          Undo
                        </Button>
                      )}
                      <span className="text-xs text-gray-500">AI-powered response assistance</span>
                    </div>
                  </div>

                  <Textarea
                    value={adminResponse}
                    onChange={(e) => {
                      setAdminResponse(e.target.value)
                      setHasEnhanced(false) // Reset enhancement state when text changes
                    }}
                    placeholder="Write your response to the student here..."
                    className="min-h-[200px] lg:min-h-[300px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    disabled={isSubmittingResponse || isGeneratingAI}
                  />

                  <div className="flex justify-end gap-2 mt-3">
                    {showResponseEditor && (
                      <Button
                        onClick={() => {
                          setShowResponseEditor(false)
                          setAdminResponse(currentComplaint.admin_response || '')
                        }}
                      variant="outline"
                      disabled={isSubmittingResponse || isGeneratingAI}
                      className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
                      >
                        Cancel
                      </Button>
                    )}
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={isSubmittingResponse || isGeneratingAI || !adminResponse.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmittingResponse ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {currentComplaint.admin_response ? 'Update Response' : 'Submit Response'}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white/5 rounded-lg border border-white/10 p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Actions</h3>
              <div className="flex flex-col gap-2">
                {(complaint.status === 'new' || complaint.status === 'under_review') && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/20 justify-start"
                      onClick={() => handleStatusUpdate('in_progress')}
                      disabled={isUpdating}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Start Progress
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/20 justify-start"
                      onClick={() => handleStatusUpdate('closed')}
                      disabled={isUpdating}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Close Complaint
                    </Button>
                  </>
                )}
                {currentComplaint.status === 'in_progress' && (
                  <Button
                    variant="outline"
                    className="w-full border-green-500/30 text-green-400 hover:bg-green-500/20 justify-start"
                    onClick={() => handleStatusUpdate('resolved')}
                    disabled={isUpdating}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </Button>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-white/10">
                Last updated: {formatDistanceToNow(new Date(complaint.updated_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>
    </>
  )

  return (
    <>
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="h-[90vh] bg-gray-900 border-t-2 border-white/20 p-0 overflow-hidden !z-[50]">
            <div className="h-full flex flex-col">
              <DrawerHeader className="px-6 pt-6 pb-4 border-b border-white/10">
                <DrawerTitle className="text-xl font-bold font-mono text-white text-left">
                  {complaint.title}
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
          <DialogContent className="bg-gray-900 text-gray-100 w-[95vw] max-w-[1400px] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:max-w-[1400px] p-4 md:p-6 !z-[50]">
            <DialogHeader className="mb-3 md:mb-4">
              <DialogTitle className="text-xl md:text-2xl font-bold font-mono text-white pr-8">
                {complaint.title}
              </DialogTitle>
            </DialogHeader>
            {modalContent}
          </DialogContent>
        </Dialog>
      )}

      {/* Student Profile Dialog */}
      {!currentComplaint.is_anonymous && currentComplaint.student_id && (
        <StudentProfileDialog
          studentId={currentComplaint.student_id}
          open={showStudentProfile}
          onOpenChange={setShowStudentProfile}
        />
      )}
    </>
  )
}
