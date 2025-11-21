'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetStatus, setResetStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Get user profile to determine role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        toast.success('Login successful!')

        // Show redirecting state
        setIsRedirecting(true)

        // Redirect based on role
        if (profile?.role === 'super_admin') {
          router.push('/super-admin')
        } else if (profile?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
        return // Don't execute finally block
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
    // Remove finally block to prevent resetting loading state on success
  }

  const handleGitHubLogin = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
      }
      // Don't set isLoading to false here as we're redirecting
    } catch (err) {
      setError('An unexpected error occurred')

      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="font-mono text-white">Sign In</CardTitle>
        <CardDescription className="text-gray-400">Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={async () => {
                  const email = formData.email
                  if (!email) {
                    toast.error('Please enter your email first')
                    return
                  }

                  // Show dialog immediately
                  setShowResetDialog(true)
                  setResetStatus('loading')

                  // Send reset email
                  const supabase = createClient()
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/reset-password`,
                  })

                  if (error) {
                    setResetStatus('error')
                    setTimeout(() => {
                      setShowResetDialog(false)
                      toast.error(error.message)
                    }, 2000)
                  } else {
                    setResetStatus('success')
                  }
                }}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading || isRedirecting}>
            {(isLoading || isRedirecting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRedirecting ? 'Redirecting...' : isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-500 font-mono">OR</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30 flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Login with GitHub
          </Button>
        </form>
      </CardContent>

      {/* Password Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-gray-900 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-mono">Password Reset</DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              {resetStatus === 'loading' && 'Sending reset link...'}
              {resetStatus === 'success' && 'Check your email!'}
              {resetStatus === 'error' && 'Something went wrong'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-8">
            {resetStatus === 'loading' && (
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 animate-pulse" />
                </div>
              </div>
            )}

            {resetStatus === 'success' && (
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center animate-in zoom-in duration-300">
                  <CheckCircle2 className="h-12 w-12 text-green-500 animate-in zoom-in duration-500" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full border-2 border-green-500/30 animate-ping" />
                </div>
              </div>
            )}

            {resetStatus === 'error' && (
              <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {resetStatus === 'success' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-300">
                We've sent a password reset link to
              </p>
              <p className="text-sm font-semibold text-blue-400">
                {formData.email}
              </p>
              <p className="text-xs text-gray-500 pt-2">
                Click the link in the email to reset your password
              </p>
              <Button
                onClick={() => setShowResetDialog(false)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
              >
                Got it!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
