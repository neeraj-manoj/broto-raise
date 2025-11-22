export default function AdminLoading() {
  return (
    <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
      <div className="mb-8">
        <div className="h-10 w-48 bg-white/5 rounded animate-pulse mb-2" />
        <div className="h-5 w-full max-w-md bg-white/5 rounded animate-pulse" />
      </div>

      {/* Stats Skeleton */}
      <div className="animate-pulse h-32 bg-white/5 rounded-lg" />

      {/* List Skeleton */}
      <div className="animate-pulse h-64 bg-white/5 rounded-lg mt-8" />
    </main>
  )
}
