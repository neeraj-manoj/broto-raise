'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, MapPin, Shield, Star, Calendar } from 'lucide-react'

interface Location {
  id: string
  name: string
  city: string
}

interface AdminUser {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'super_admin'
  location_id: string
  location?: Location
  created_at?: string
  avatar_url?: string
}

interface ViewAdminDialogProps {
  admin: AdminUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewAdminDialog({ admin, open, onOpenChange }: ViewAdminDialogProps) {
  if (!admin) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/10">
              <AvatarImage src={admin.avatar_url} alt={admin.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xl">
                {admin.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <DialogTitle className="text-2xl font-bold">
              {admin.full_name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Role Badge */}
          <div>
            <Badge
              className={`font-mono text-sm ${
                admin.role === 'super_admin'
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}
            >
              {admin.role === 'super_admin' ? (
                <>
                  <Star className="h-4 w-4 mr-1" />
                  SUPER ADMIN
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-1" />
                  ADMIN
                </>
              )}
            </Badge>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Contact Information
            </h3>

            <div className="bg-white/5 rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="text-white">{admin.email}</div>
                </div>
              </div>

              {admin.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="text-white">
                      {admin.location.name}
                    </div>
                  </div>
                </div>
              )}

              {admin.created_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">Account Created</div>
                    <div className="text-white">{formatDate(admin.created_at)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Permissions & Access
            </h3>

            <div className="bg-white/5 rounded-lg p-3">
              <ul className="space-y-2 text-sm">
                {admin.role === 'super_admin' ? (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span className="text-gray-300">Full system access and control</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span className="text-gray-300">Create and manage administrator accounts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span className="text-gray-300">View and manage all complaints</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span className="text-gray-300">Access system analytics and reports</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span className="text-gray-300">View and manage all student complaints</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span className="text-gray-300">Update complaint status and priority</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span className="text-gray-300">Add comments and respond to complaints</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span className="text-gray-300">Access analytics dashboard</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {admin.role === 'super_admin' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-xs text-yellow-400">
                <strong>Note:</strong> Super Admin accounts require backend access for role modifications and deletion.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
