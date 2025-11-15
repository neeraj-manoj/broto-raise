'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
}

interface EditAdminDialogProps {
  admin: AdminUser
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditAdminDialog({ admin, open, onOpenChange, onSuccess }: EditAdminDialogProps) {
  const [fullName, setFullName] = useState(admin.full_name)
  const [locationId, setLocationId] = useState(admin.location_id)
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)

  useEffect(() => {
    if (open) {
      setFullName(admin.full_name)
      setLocationId(admin.location_id)
      fetchLocations()
    }
  }, [open, admin])

  const fetchLocations = async () => {
    setIsLoadingLocations(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('city', { ascending: true })

      if (error) throw error
      setLocations(data || [])
    } catch (error) {

      toast.error('Failed to load locations')
    } finally {
      setIsLoadingLocations(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !locationId) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          location_id: locationId
        })
        .eq('id', admin.id)

      if (error) throw error

      toast.success('Admin details updated successfully')
      onSuccess()
    } catch (error) {

      toast.error('Failed to update admin details')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Edit Admin Details</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update administrator information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-fullname" className="text-white">Full Name</Label>
            <Input
              id="edit-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email" className="text-white">Email</Label>
            <Input
              id="edit-email"
              value={admin.email}
              disabled
              className="bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location" className="text-white">Brocamp Location</Label>
            <Select value={locationId} onValueChange={setLocationId} disabled={isLoadingLocations}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                {locations.map((location) => (
                  <SelectItem
                    key={location.id}
                    value={location.id}
                    className="text-white hover:bg-white/10"
                  >
                    {location.name}, {location.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
