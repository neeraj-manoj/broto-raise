import Link from 'next/link'
import { ArrowRight, MessageSquareWarning, Brain, TrendingUp, Users, Clock, Shield, Sparkles, Wand2, FileText, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-1.5 md:gap-2">
            <MessageSquareWarning className="h-5 w-5 md:h-7 md:w-7 text-blue-500" />
            <span className="text-base md:text-2xl font-bold font-mono">
              <span className="bg-white text-gray-900 px-1">BRO</span>TORAISE
            </span>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Button asChild variant="ghost" className="text-white hover:text-blue-400 hover:bg-white/10 h-9 md:h-10 px-3 md:px-4 text-sm md:text-base">
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white h-9 md:h-10 px-3 md:px-4 text-sm md:text-base">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-12 md:pt-20 pb-20 md:pb-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-blue-500/30 bg-blue-500/10 mb-6 md:mb-8">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
            <span className="text-xs md:text-sm text-blue-300 font-mono">AI-POWERED COMPLAINT MANAGEMENT</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-4 md:mb-6 leading-tight font-mono">
            Raise Issues.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              Get Solutions.
            </span>
          </h1>

          <p className="text-base md:text-xl lg:text-2xl text-gray-400 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            A transparent complaint management system for Brocamp students to report concerns,
            track resolutions, and ensure every voice is heard across all locations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 h-14 group">
              <Link href="/auth/login">
                Log In
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 h-14">
              <Link href="/auth/signup">
                Get Started
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-12 md:mb-20">
            <StatCard number="6" label="Brocamp Locations" />
            <StatCard number="AI" label="Powered Intelligence" />
            <StatCard number="24/7" label="Real-Time Tracking" />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 container mx-auto px-4 pb-20 md:pb-32">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 font-mono">
            Built for <span className="text-blue-500">Excellence</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Bot className="h-10 w-10" />}
              title="BroBot Assistant"
              description="24/7 AI chatbot to answer questions, guide you through the system, and provide instant help"
              accent="blue"
            />
            <FeatureCard
              icon={<Wand2 className="h-10 w-10" />}
              title="AI Enhancement"
              description="Improve your complaint descriptions with AI assistance for clarity and professionalism"
              accent="blue"
            />
            <FeatureCard
              icon={<Brain className="h-10 w-10" />}
              title="Smart Admin Responses"
              description="Admins can generate or enhance responses using AI for better communication"
              accent="blue"
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10" />}
              title="Real-Time Updates"
              description="Live notifications and status tracking for complete transparency"
              accent="blue"
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10" />}
              title="Anonymous Mode"
              description="Raise sensitive concerns with complete privacy and protection"
              accent="blue"
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10" />}
              title="Status Tracking"
              description="Track your complaints from NEW to IN PROGRESS to RESOLVED in real-time"
              accent="blue"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-mono">
            Have a Concern? We're Listening
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join students across all Brocamp locations working towards better campus experiences
          </p>
          <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 text-lg px-8 h-14">
            <Link href="/auth/signup">
              Report Your Concern
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-black text-blue-500 mb-2 font-mono">{number}</div>
      <div className="text-sm text-gray-400 font-mono uppercase tracking-wide">{label}</div>
    </div>
  )
}

function FeatureCard({ icon, title, description, accent }: { icon: React.ReactNode; title: string; description: string; accent: string }) {
  return (
    <div className="group relative p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:bg-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/5 rounded-xl transition-all duration-300" />
      <div className="relative">
        <div className="text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white font-mono">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
