'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Mail, MapPin, Calendar, Shield, Loader2, Save, Camera, Upload, X, Star, ArrowLeft } from 'lucide-react'
import { BROCAMP_LOCATIONS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

interface ProfileFormProps {
  user: any
  profile: any
}

export function ProfileForm({ user, profile: initialProfile }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState({
    fullName: initialProfile?.full_name || '',
    locationId: initialProfile?.location_id || '',
  })

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase
    setIsUploadingAvatar(true)
    try {
      const supabase = createClient()

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`])
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      setAvatarPreview(null)
      toast.success('Avatar updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar')
      setAvatarPreview(null)
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return

    setIsUploadingAvatar(true)
    try {
      const supabase = createClient()

      // Delete from storage
      const oldPath = avatarUrl.split('/').pop()
      if (oldPath) {
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${oldPath}`])

        if (deleteError) throw deleteError
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl('')
      toast.success('Avatar removed successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.fullName,
          location_id: profile.locationId,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Star className="h-3 w-3 lg:mr-1" />
            <span className="hidden lg:inline">Super Admin</span>
          </Badge>
        )
      case 'admin':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Shield className="h-3 w-3 lg:mr-1" />
            <span className="hidden lg:inline">Admin</span>
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            <User className="h-3 w-3 lg:mr-1" />
            <span className="hidden lg:inline">Student</span>
          </Badge>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button - Desktop only - Hidden for Super Admin */}
      {initialProfile?.role !== 'super_admin' && (
        <Button asChild variant="ghost" className="text-white hover:bg-white/10 h-9 hidden lg:inline-flex">
          <Link href={initialProfile?.role === 'admin' ? "/admin" : "/dashboard"}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      )}

      {/* Profile Overview Card */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="h-16 w-16 rounded-full bg-blue-500/20 border-2 border-blue-500/30 flex items-center justify-center overflow-hidden">
                {avatarPreview || avatarUrl ? (
                  <Image
                    src={avatarPreview || avatarUrl}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <User className="h-8 w-8 text-blue-400" />
                )}
              </div>
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                aria-label="Upload avatar"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-white font-mono truncate">{initialProfile?.full_name || 'User'}</CardTitle>
                <div className="shrink-0">
                  {getRoleBadge(initialProfile?.role)}
                </div>
              </div>
              <CardDescription className="text-gray-400 flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Remove Avatar Button */}
      {avatarUrl && (
        <Button
          type="button"
          variant="outline"
          onClick={handleRemoveAvatar}
          disabled={isUploadingAvatar}
          className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30 h-12"
        >
          <X className="h-4 w-4 mr-2" />
          Remove Profile Picture
        </Button>
      )}

      {/* Avatar Upload Info */}
      {!avatarUrl && (
        <Alert className="bg-blue-500/10 border-blue-500/30">
          <Upload className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-400">
            Click on the avatar icon above to upload a profile picture. Supported formats: JPEG, PNG, GIF, WebP (max 2MB).
          </AlertDescription>
        </Alert>
      )}

      {/* Account Information */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white font-mono flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Account Information
          </CardTitle>
          <CardDescription className="text-gray-400">
            View your account details and role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm">Email Address</Label>
              <div className="bg-white/5 rounded-lg border border-white/10 px-3 py-2">
                <p className="text-white">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm">Account Role</Label>
              <div className="bg-white/5 rounded-lg border border-white/10 px-3 py-2">
                <p className="text-white capitalize">{initialProfile?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm">Member Since</Label>
              <div className="bg-white/5 rounded-lg border border-white/10 px-3 py-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-white">
                  {initialProfile?.created_at ? format(new Date(initialProfile.created_at), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm">Account ID</Label>
              <div className="bg-white/5 rounded-lg border border-white/10 px-3 py-2">
                <p className="text-white text-xs font-mono truncate">{user?.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white font-mono">Edit Profile</CardTitle>
          <CardDescription className="text-gray-400">
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                required
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-300">Brocamp Location</Label>
              <Select
                value={profile.locationId}
                onValueChange={(value) => setProfile({ ...profile, locationId: value })}
                required
                disabled={isLoading}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-blue-500">
                  <SelectValue placeholder="Select your location" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  {BROCAMP_LOCATIONS.map((location) => (
                    <SelectItem key={location.id} value={location.id} className="text-white focus:bg-blue-500/20 focus:text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {location.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
