import { AdminManagementContent } from '@/components/super-admin/admin-management-content'

export default function AdminManagementPage() {
  return (
    <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black font-mono mb-2">Admin Management</h1>
        <p className="text-gray-400">
          Create and manage administrator accounts
        </p>
      </div>

      <AdminManagementContent />
    </main>
  )
}
