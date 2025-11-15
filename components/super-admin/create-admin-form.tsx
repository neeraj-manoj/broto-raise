'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserPlus, Loader2, Shield, Star } from 'lucide-react'
import { toast } from 'sonner'
import { BROCAMP_LOCATIONS } from '@/lib/constants'

interface CreateAdminFormProps {
  onSuccess?: () => void
}

export function CreateAdminForm({ onSuccess }: CreateAdminFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    role: 'admin' as 'admin' | 'super_admin',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          locationId: formData.location,
          role: formData.role,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }

      toast.success(`${formData.role === 'super_admin' ? 'Super Admin' : 'Admin'} account created successfully!`)

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: '',
        role: 'admin',
      })

      // Trigger refresh callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="font-mono text-white flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create Admin Account
        </CardTitle>
        <CardDescription className="text-gray-400">
          Create a new administrator or super administrator account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-gray-300">Brocamp Location</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => setFormData({ ...formData, location: value })}
              required
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-blue-500">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                {BROCAMP_LOCATIONS.map((location) => (
                  <SelectItem key={location.id} value={location.id} className="text-white focus:bg-blue-500/20 focus:text-white">
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-300">Admin Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'super_admin') => setFormData({ ...formData, role: value })}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="admin" className="text-white focus:bg-blue-500/20 focus:text-white">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span>Admin</span>
                  </div>
                </SelectItem>
                <SelectItem value="super_admin" className="text-white focus:bg-purple-500/20 focus:text-white">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-400" />
                    <span>Super Admin</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {formData.role === 'super_admin'
                ? 'Full access including admin management'
                : 'Full access to complaints but cannot manage admins'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
              minLength={6}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
              minLength={6}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          <Button
            type="submit"
            className={`w-full ${formData.role === 'super_admin' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create {formData.role === 'super_admin' ? 'Super Admin' : 'Admin'} Account
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
