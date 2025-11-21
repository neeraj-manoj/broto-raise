'use client'

import { formatDistanceToNow, format } from 'date-fns'
import { Download, FileText, Image as ImageIcon, Calendar, Clock, MessageSquare, X, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ComplaintDetailModalProps {
  complaint: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface StatusHistoryItem {
  id: string
  status: string
  changed_at: string
  changed_by: string | null
  changer_name?: string
}

export function ComplaintDetailModal({ complaint, open, onOpenChange }: ComplaintDetailModalProps) {
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
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
    if (open && complaint?.id) {
      fetchStatusHistory()
    }
  }, [open, complaint?.id])

  const fetchStatusHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('status_history')
        .select(`
          id,
          status,
          changed_at,
          changed_by,
          changer:profiles!status_history_changed_by_fkey(full_name)
        `)
        .eq('complaint_id', complaint.id)
        .order('changed_at', { ascending: true })

      if (error) throw error

      const formattedData = data?.map((item: any) => ({
        id: item.id,
        status: item.status,
        changed_at: item.changed_at,
        changed_by: item.changed_by,
        changer_name: item.changer?.full_name || 'System'
      })) || []

      setStatusHistory(formattedData)
    } catch (error) {

    } finally {
      setIsLoadingHistory(false)
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

      // Clean up the object URL after download
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    } catch (error) {

      toast.error('Failed to download file')
    }
  }

  return (
    <>
      {/* Mobile: Drawer (Slide-up with swipe) */}
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="h-[90vh] bg-gray-900 border-t-2 border-white/20 p-0 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Header */}
              <DrawerHeader className="px-4 pb-4 pt-2 space-y-3 border-b border-white/10">
                <DrawerTitle className="text-xl font-bold font-mono text-white text-left leading-tight pr-8">
                  {complaint.title}
                </DrawerTitle>
                
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
                  <Badge className="bg-white/5 text-gray-400 border-white/10 font-mono text-xs">
                    {COMPLAINT_CATEGORIES.find(c => c.id === complaint.category_id)?.name || complaint.category_id}
                  </Badge>
                </div>
              </DrawerHeader>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">
                      <span className="text-white block">{format(new Date(complaint.created_at), 'MMM dd, yyyy')}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">
                      <span className="text-white block">{formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <ThumbsUp className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">
                      <span className="text-white block">{complaint.upvotes_count || 0} {complaint.upvotes_count === 1 ? 'upvote' : 'upvotes'}</span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                  <h3 className="text-xs font-semibold text-gray-400 mb-2">Description</h3>
                  <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                {/* Admin Response */}
                {complaint.admin_response && (
                  <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                      <h3 className="text-xs font-semibold text-blue-400">Admin Response</h3>
                    </div>
                    <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                      {complaint.admin_response}
                    </p>
                  </div>
                )}

                {/* Attachments */}
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <h3 className="text-xs font-semibold text-gray-400 mb-3">Attachments ({complaint.attachments.length})</h3>
                    <div className="space-y-2">
                      {complaint.attachments.map((attachment: any, index: number) => {
                        const file = typeof attachment === 'string' ? JSON.parse(attachment) : attachment
                        return (
                          <div key={index} className="flex items-center gap-3 bg-white/5 rounded-lg border border-white/10 p-3 active:bg-white/10 transition-colors">
                            {file.type?.startsWith('image/') ? (
                              <ImageIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                            ) : (
                              <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadAttachment(file.url, file.name)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 active:bg-blue-500/20 h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Status History Timeline */}
                {statusHistory.length > 0 && (
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <h3 className="text-xs font-semibold text-gray-400 mb-3">Status History</h3>
                    <div className="space-y-3">
                      {statusHistory.map((item, index) => {
                        const isLast = index === statusHistory.length - 1

                        return (
                          <div key={item.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-2 h-2 rounded-full ${isLast ? 'bg-blue-500' : 'bg-gray-500'} mt-2`} />
                              {!isLast && <div className="w-0.5 h-full bg-white/10 mt-1" />}
                            </div>

                            <div className="flex-1 pb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={`${statusColors[item.status as keyof typeof statusColors]} font-mono text-xs`}>
                                  {item.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                                {isLast && (
                                  <span className="text-xs text-blue-400 font-mono">Current</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                {format(new Date(item.changed_at), 'MMM dd, yyyy, h:mm a')}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Resolution */}
                {(complaint.status === 'resolved' || complaint.status === 'closed') && complaint.resolved_at && (
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <h3 className="text-xs font-semibold text-gray-400 mb-2">Resolution</h3>
                    <div className="text-sm text-gray-400">
                      Resolved on <span className="text-white">{format(new Date(complaint.resolved_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="pb-4 border-t border-white/10 pt-4">
                  <div className="text-xs text-gray-500">
                    Last updated: {formatDistanceToNow(new Date(complaint.updated_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        /* Desktop: Dialog */
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-white/10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-mono text-white pr-8">
                {complaint.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
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
                <Badge className="bg-white/5 text-gray-400 border-white/10 font-mono text-xs">
                  {COMPLAINT_CATEGORIES.find(c => c.id === complaint.category_id)?.name || complaint.category_id}
                </Badge>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Created: <span className="text-white">{format(new Date(complaint.created_at), 'MMM dd, yyyy')}</span></span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span><span className="text-white">{formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}</span></span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <ThumbsUp className="h-4 w-4" />
                  <span><span className="text-white">{complaint.upvotes_count || 0} {complaint.upvotes_count === 1 ? 'upvote' : 'upvotes'}</span></span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Description</h3>
                <p className="text-white whitespace-pre-wrap leading-relaxed">
                  {complaint.description}
                </p>
              </div>

              {/* Admin Response */}
              {complaint.admin_response && (
                <div className="bg-blue-500/10 rounded-lg border border-blue-500/30 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-blue-400">Admin Response</h3>
                  </div>
                  <p className="text-white whitespace-pre-wrap leading-relaxed">
                    {complaint.admin_response}
                  </p>
                </div>
              )}

              {/* Attachments */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Attachments ({complaint.attachments.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {complaint.attachments.map((attachment: any, index: number) => {
                      const file = typeof attachment === 'string' ? JSON.parse(attachment) : attachment
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

              {/* Status History Timeline */}
              {statusHistory.length > 0 && (
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4">Status History</h3>
                  <div className="space-y-3">
                    {statusHistory.map((item, index) => {
                      const isLast = index === statusHistory.length - 1

                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full ${isLast ? 'bg-blue-500' : 'bg-gray-500'} mt-2`} />
                            {!isLast && <div className="w-0.5 h-full bg-white/10 mt-1" />}
                          </div>

                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${statusColors[item.status as keyof typeof statusColors]} font-mono text-xs`}>
                                {item.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {isLast && (
                                <span className="text-xs text-blue-400 font-mono">Current</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              {format(new Date(item.changed_at), 'MMM dd, yyyy, h:mm a')}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Resolution */}
              {(complaint.status === 'resolved' || complaint.status === 'closed') && complaint.resolved_at && (
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Resolution</h3>
                  <div className="text-sm text-gray-400">
                    Resolved on <span className="text-white">{format(new Date(complaint.resolved_at), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-white/10">
                <div className="text-sm text-gray-500">
                  Last updated: {formatDistanceToNow(new Date(complaint.updated_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
