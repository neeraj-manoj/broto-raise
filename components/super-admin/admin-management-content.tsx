'use client'

import { useState } from 'react'
import { CreateAdminForm } from '@/components/super-admin/create-admin-form'
import { AdminsList } from '@/components/super-admin/admins-list'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AdminManagementContent() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)

  const handleAdminCreated = () => {
    // Trigger refresh of admins list
    setRefreshKey(prev => prev + 1)
    // Close the form on mobile after creation
    setIsCreateFormOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Mobile: Collapsible Create Admin Form */}
      <div className="lg:hidden">
        <Button
          onClick={() => setIsCreateFormOpen(!isCreateFormOpen)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-between"
        >
          <span>Create Admin Account</span>
          {isCreateFormOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
        {isCreateFormOpen && (
          <div className="mt-4">
            <CreateAdminForm onSuccess={handleAdminCreated} />
          </div>
        )}
      </div>

      {/* Desktop: Side-by-side layout */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-8">
        {/* Create Admin Form */}
        <div>
          <CreateAdminForm onSuccess={handleAdminCreated} />
        </div>

        {/* Admins List */}
        <div key={refreshKey}>
          <AdminsList />
        </div>
      </div>

      {/* Mobile: Full-width Admins List */}
      <div className="lg:hidden" key={refreshKey}>
        <AdminsList />
      </div>
    </div>
  )
}
