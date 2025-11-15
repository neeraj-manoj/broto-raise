'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, User, Mail, MapPin, Phone, Save } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface SettingsFormProps {
  user: any
  profile: any
  locations?: any[]
  isAdmin?: boolean
}

export function SettingsForm({ user, profile, locations = [], isAdmin = false }: SettingsFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    location_id: profile?.location_id || '',
    phone: profile?.phone || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.full_name.trim()) {
      toast.error('Full name is required')
      return
    }

    setIsSaving(true)
    try {
      const supabase = createClient()

      // Update profile
      const updateData: any = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        updated_at: new Date().toISOString(),
      }

      // Only update location for students
      if (!isAdmin) {
        updateData.location_id = formData.location_id || null
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update email if changed
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        })

        if (emailError) throw emailError
        toast.success('Profile updated! Check your email to confirm the new email address.')
      } else {
        toast.success('Profile updated successfully!')
      }

      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')

    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsChangingPassword(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      toast.success('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')

    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" className="text-white hover:bg-white/10 hidden lg:inline-flex">
        <Link href={isAdmin ? "/admin" : "/dashboard"}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </Button>

      {/* Profile Information */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
        <h2 className="text-2xl font-bold font-mono mb-6">Profile Information</h2>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-gray-300">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Full Name</span>
              </div>
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email Address</span>
              </div>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
              placeholder="your.email@example.com"
            />
            <p className="text-xs text-gray-400">
              Changing your email will require verification
            </p>
          </div>

          {/* Brocamp Location - Only for Students */}
          {!isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-300">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Brocamp Location</span>
                </div>
              </Label>
              <Select value={formData.location_id} onValueChange={(value) => setFormData({ ...formData, location_id: value })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-blue-500">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id} className="text-white focus:bg-blue-500/20">
                      {location.name} - {location.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-300">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Phone Number</span>
              </div>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
              placeholder="+91 1234567890"
            />
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
        <h2 className="text-2xl font-bold font-mono mb-2">Change Password</h2>
        <p className="text-gray-400 text-sm mb-6">
          Update your password to keep your account secure
        </p>

        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-gray-300">
              New Password
            </Label>
            <Input
              id="new_password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-gray-300">
              Confirm New Password
            </Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
              placeholder="Confirm new password"
            />
          </div>

          <Button
            type="submit"
            disabled={isChangingPassword}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
        <h2 className="text-2xl font-bold font-mono mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Account ID:</span>
            <span className="text-white font-mono">{user.id.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Role:</span>
            <span className="text-white capitalize">{profile?.role || 'Student'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Member Since:</span>
            <span className="text-white">
              {new Date(profile?.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
