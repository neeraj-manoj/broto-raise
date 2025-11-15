import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'
import { MessageSquareWarning } from 'lucide-react'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <MessageSquareWarning className="h-8 w-8 text-blue-500" />
              <span className="text-3xl font-black font-mono">
                <span className="bg-white text-gray-900 px-1">BRO</span>TORAISE
              </span>
            </Link>
            <h1 className="text-2xl font-bold mb-2 font-mono">
              Create Account
            </h1>
            <p className="text-gray-400">
              Join the platform and raise your concerns
            </p>
          </div>

          {/* Signup Form */}
          <SignupForm />

          {/* Sign in link */}
          <p className="text-center mt-6 text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
