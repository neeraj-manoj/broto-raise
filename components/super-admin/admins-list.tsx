'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Shield, Star, Mail, MapPin, Loader2, MoreVertical, Edit, TrendingUp, Trash2, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EditAdminDialog } from './edit-admin-dialog'
import { ViewAdminDialog } from './view-admin-dialog'

interface AdminUser {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'super_admin'
  location_id: string
  created_at: string
  avatar_url?: string
  location?: {
    id: string
    name: string
    city: string
  }
}

export function AdminsList() {
  const router = useRouter()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null)
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPromoteDialog, setShowPromoteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handlePromoteToSuperAdmin = async () => {
    if (!currentAdmin) return

    setIsProcessing(true)
    try {
      // Promote user via API
      const response = await fetch('/api/super-admin/promote-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentAdmin.id })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to promote admin')
      }

      toast.success(`${currentAdmin.full_name} promoted to Super Admin`)
      await fetchAdmins()
      setShowPromoteDialog(false)
      setCurrentAdmin(null)
    } catch (error: any) {

      toast.error(error.message || 'Failed to promote admin')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!currentAdmin) return

    setIsProcessing(true)
    try {
      const supabase = createClient()

      // Delete user account via API
      const response = await fetch('/api/super-admin/delete-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentAdmin.id })
      })

      if (!response.ok) throw new Error('Failed to delete admin')

      toast.success(`${currentAdmin.full_name} deleted successfully`)
      await fetchAdmins()
      setShowDeleteDialog(false)
      setCurrentAdmin(null)
    } catch (error) {

      toast.error('Failed to delete admin')
    } finally {
      setIsProcessing(false)
    }
  }

  const fetchAdmins = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, location_id, created_at, avatar_url')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch locations
      if (profiles && profiles.length > 0) {
        const locationIds = [...new Set(profiles.map(p => p.location_id).filter(Boolean))]
        const { data: locations } = await supabase
          .from('locations')
          .select('id, name, city')
          .in('id', locationIds)

        profiles.forEach((profile: any) => {
          profile.location = locations?.find(l => l.id === profile.location_id)
        })
      }

      setAdmins(profiles || [])
    } catch (error) {

    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="font-mono text-white">Administrators</CardTitle>
        <CardDescription className="text-gray-400">
          {admins.length} total administrator{admins.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {admins.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No administrators found
          </div>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                onClick={() => {
                  setCurrentAdmin(admin)
                  setShowViewDialog(true)
                }}
                className="bg-white/5 rounded-lg border border-white/10 p-4 hover:border-blue-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 border-2 border-white/10">
                      <AvatarImage src={admin.avatar_url} alt={admin.full_name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {admin.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-semibold">{admin.full_name}</h3>
                      <Badge
                        className={`font-mono text-xs ${
                          admin.role === 'super_admin'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {admin.role === 'super_admin' ? (
                          <>
                            <Star className="h-3 w-3 mr-1" />
                            SUPER ADMIN
                          </>
                        ) : (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            ADMIN
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{admin.email}</span>
                      </div>
                      {admin.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{admin.location.name}, {admin.location.city}</span>
                        </div>
                      )}
                    </div>
                    </div>
                  </div>

                  {/* Actions Menu - Only show for regular admins */}
                  {admin.role === 'admin' && (
                    <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
                        <DropdownMenuItem
                          onClick={() => {
                            setCurrentAdmin(admin)
                            setShowEditDialog(true)
                          }}
                          className="text-white hover:bg-white/10 cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setCurrentAdmin(admin)
                            setShowPromoteDialog(true)
                          }}
                          className="text-purple-400 hover:bg-purple-500/10 cursor-pointer"
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Promote to Super Admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          onClick={() => {
                            setCurrentAdmin(admin)
                            setShowDeleteDialog(true)
                          }}
                          className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  )}

                  {/* Super Admins - Info menu */}
                  {admin.role === 'super_admin' && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
                          <DropdownMenuItem
                            onClick={() => setShowInfoDialog(true)}
                            className="text-gray-400 hover:bg-white/10 cursor-pointer"
                          >
                            <Info className="h-4 w-4 mr-2" />
                            Account Information
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* View Admin Dialog */}
      <ViewAdminDialog
        admin={currentAdmin}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />

      {/* Edit Admin Dialog */}
      {currentAdmin && (
        <EditAdminDialog
          admin={currentAdmin}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={() => {
            fetchAdmins()
            setShowEditDialog(false)
            setCurrentAdmin(null)
          }}
        />
      )}

      {/* Promote Confirmation Dialog */}
      <AlertDialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <AlertDialogContent className="bg-gray-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Promote to Super Admin?
            </AlertDialogTitle>
            <div className="text-sm text-gray-400">
              You are about to promote <span className="text-white font-semibold">{currentAdmin?.full_name}</span> to Super Admin.
              <br /><br />
              Super Admins have full system access and can:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>View and manage all complaints</li>
                <li>Create new admins</li>
                <li>Access system analytics</li>
              </ul>
              <br />
              <span className="text-yellow-400">Note: You cannot demote or delete Super Admins from this interface.</span>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePromoteToSuperAdmin}
              disabled={isProcessing}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Promoting...
                </>
              ) : (
                'Promote to Super Admin'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Admin Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              You are about to permanently delete <span className="text-white font-semibold">{currentAdmin?.full_name}</span>'s admin account.
              <br /><br />
              <span className="text-red-400 font-semibold">This action cannot be undone.</span>
              <br /><br />
              The user will lose all admin privileges and their account will be removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Admin'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Super Admin Info Dialog */}
      <AlertDialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <AlertDialogContent className="bg-gray-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              Super Admin Account
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-gray-400 space-y-4">
                <p>
                  Super Admin accounts have the highest level of privileges in the system and require direct backend access to modify.
                </p>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 space-y-2">
                  <p className="text-purple-400 font-semibold text-sm">Protected Actions:</p>
                  <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                    <li>Editing account details</li>
                    <li>Deleting the account</li>
                    <li>Modifying permissions</li>
                  </ul>
                </div>
                <p className="text-sm">
                  To perform these actions, please contact your system administrator or access the database directly.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-purple-600 hover:bg-purple-700 text-white">
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
