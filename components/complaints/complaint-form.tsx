'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, FileUp, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COMPLAINT_CATEGORIES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FileUpload } from './file-upload'

interface ComplaintFormProps {
  userId: string
  userLocation?: string
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

export function ComplaintForm({ userId, userLocation }: ComplaintFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    isAnonymous: false,
    locationId: userLocation || '',
  })

  // AI enhancement state
  const [aiEnhanced, setAiEnhanced] = useState(false)
  const [originalDescription, setOriginalDescription] = useState('')
  const [lastEnhancedDescription, setLastEnhancedDescription] = useState('')

  // AI metadata generation state
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState<string | null>(null)
  const [aiSuggestedPriority, setAiSuggestedPriority] = useState<string | null>(null)
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false)

  // Handle step transition with AI metadata generation
  const handleNextToCategory = async () => {
    if (!formData.title || !formData.description) return

    setIsGeneratingMetadata(true)
    toast.loading('✨ Analyzing complaint...', { id: 'ai-metadata' })

    try {
      const response = await fetch('/api/ai/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Update form with AI suggestions if available
        if (result.category || result.priority) {
          setFormData(prev => ({
            ...prev,
            ...(result.category && { category: result.category }),
            ...(result.priority && { priority: result.priority }),
          }))
          // Track what AI suggested
          setAiSuggestedCategory(result.category)
          setAiSuggestedPriority(result.priority)
          toast.success('✨ AI suggestions applied!', { id: 'ai-metadata' })
        } else {
          toast.dismiss('ai-metadata')
        }
      } else {
        toast.dismiss('ai-metadata')
      }
    } catch (error) {

      toast.dismiss('ai-metadata')
    } finally {
      setIsGeneratingMetadata(false)
      setStep(2)
    }
  }

  // AI Enhancement using Hugging Face
  const handleAIEnhance = async () => {
    if (!formData.description) {
      toast.error('Please enter a description first')
      return
    }

    if (formData.description.length < 20) {
      toast.error('Please write at least 20 characters for AI to enhance')
      return
    }

    setIsAnalyzing(true)
    setOriginalDescription(formData.description)

    try {
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description
        })
      })

      if (!response.ok) {
        throw new Error('AI enhancement failed')
      }

      const result = await response.json()

      // Update description with enhanced version
      setFormData(prev => ({
        ...prev,
        description: result.enhancedDescription
      }))

      setLastEnhancedDescription(result.enhancedDescription)
      setAiEnhanced(true)
      toast.success('✨ Description enhanced by AI!')
    } catch (error) {
      toast.error('AI enhancement failed - please try again')

    } finally {
      setIsAnalyzing(false)
    }
  }

  // Undo AI enhancement
  const handleUndoEnhancement = () => {
    setFormData(prev => ({
      ...prev,
      description: originalDescription
    }))
    setAiEnhanced(false)
    setOriginalDescription('')
    setLastEnhancedDescription('')
    toast.info('Reverted to original description')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description')
      return
    }
    if (!formData.category) {
      toast.error('Please select a category')
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('complaints')
        .insert({
          title: formData.title,
          description: formData.description,
          category_id: formData.category,
          priority: formData.priority,
          is_anonymous: formData.isAnonymous,
          created_by: userId,
          student_id: userId,
          location_id: formData.locationId,
          status: 'new',
          // Attachments - store complete file metadata
          attachments: uploadedFiles.map(f => ({
            id: f.id,
            name: f.name,
            size: f.size,
            type: f.type,
            url: f.url
          })),
        })
        .select()
        .single()

      if (error) throw error

      // Create confirmation notification for student
      await supabase.from('notifications').insert({
        user_id: userId,
        complaint_id: data.id,
        type: 'status_update',
        title: 'Complaint Submitted',
        message: `Your complaint "${formData.title}" has been submitted successfully and is awaiting review.`,
      })

      // Notify all admins and super admins about the new complaint
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['admin', 'super_admin'])

      if (admins && admins.length > 0) {
        const studentName = formData.isAnonymous ? 'A student' : 'A student'
        const priorityLabel = formData.priority.toUpperCase()
        const categoryName = COMPLAINT_CATEGORIES.find(c => c.id === formData.category)?.name || formData.category

        await supabase.from('notifications').insert(
          admins.map(admin => ({
            user_id: admin.id,
            complaint_id: data.id,
            type: 'status_update',
            title: 'New Complaint Received',
            message: `${studentName} submitted a ${priorityLabel} priority complaint in ${categoryName}: "${formData.title}"`,
          }))
        )
      }

      toast.success('Complaint submitted successfully!')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error('Failed to submit complaint')

    } finally {
      setIsSubmitting(false)
    }
  }

  const applySuggestion = (field: 'category' | 'priority', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    toast.success(`Applied AI suggestion: ${value}`)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" className="text-white hover:bg-white/10 mb-4 h-9 px-3">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-black font-mono mb-2">New Complaint</h1>
        <p className="text-gray-400 text-sm md:text-base">
          Report your concern and we'll address it promptly
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 md:gap-4 overflow-x-visible pb-2">
        <StepIndicator number={1} label="Details" active={step === 1} completed={step > 1} />
        <div className="flex-1 h-px bg-white/10" />
        <StepIndicator number={2} label="Category" active={step === 2} completed={step > 2} />
        <div className="flex-1 h-px bg-white/10" />
        <StepIndicator number={3} label="Review" active={step === 3} completed={false} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Details */}
        {step === 1 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-mono mb-4">Complaint Details</h2>
              <p className="text-gray-400 text-sm">
                Describe your concern clearly so we can address it effectively
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Title <span className="text-red-400">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief summary of your complaint"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
                maxLength={100}
              />
              <p className="text-xs text-gray-500">{formData.title.length}/100 characters</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-gray-300">
                  Description <span className="text-red-400">*</span>
                </Label>
                <div className="flex gap-2">
                  {originalDescription && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleUndoEnhancement}
                      className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      Undo
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAIEnhance}
                    disabled={
                      isAnalyzing ||
                      !formData.description ||
                      formData.description.length < 20 ||
                      (aiEnhanced && formData.description === lastEnhancedDescription)
                    }
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Enhance
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your complaint..."
                value={formData.description}
                onChange={(e) => {
                  const newDesc = e.target.value
                  setFormData({ ...formData, description: newDesc })
                  // If user changes the description after AI enhancement, reset the enhanced state
                  if (aiEnhanced && newDesc !== lastEnhancedDescription) {
                    setAiEnhanced(false)
                  }
                }}
                rows={8}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-gray-500">
                {formData.description.length}/2000 characters
                {aiEnhanced && <span className="ml-2 text-blue-400">✨ Enhanced by AI</span>}
              </p>
            </div>

            {/* AI Enhancement Info */}
            {aiEnhanced && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-400 mb-1">AI Enhanced</h4>
                    <p className="text-sm text-gray-300">
                      Your description has been improved for clarity and professionalism. Review the changes and click &quot;Undo&quot; if you prefer the original.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-gray-300">
                <div className="flex items-center gap-2">
                  <FileUp className="h-4 w-4" />
                  <span>Attachments (Optional)</span>
                </div>
              </Label>
              <p className="text-xs text-gray-400 mb-3">
                Upload images, documents, or screenshots to support your complaint
              </p>
              <FileUpload
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
                maxFiles={5}
                maxSizeMB={10}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleNextToCategory}
                disabled={!formData.title || !formData.description || isGeneratingMetadata}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                {isGeneratingMetadata ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Continue to Category'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Category & Priority */}
        {step === 2 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-mono mb-4">Categorization</h2>
              <p className="text-gray-400 text-sm">
                Help us route your complaint to the right department
              </p>
              {(aiSuggestedCategory || aiSuggestedPriority) && (
                <div className="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">AI-suggested selections applied</span>
                    <span className="text-gray-400">• You can change them if needed</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300 flex items-center gap-2">
                Category <span className="text-red-400">*</span>
                {aiSuggestedCategory && formData.category === aiSuggestedCategory && (
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Selected
                  </Badge>
                )}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData({ ...formData, category: value })
                }}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-blue-500">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-white focus:bg-blue-500/20">
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <div>
                          <div className="font-medium">{cat.name}</div>
                          <div className="text-xs text-gray-400">{cat.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-gray-300 flex items-center gap-2">
                Priority Level
                {aiSuggestedPriority && formData.priority === aiSuggestedPriority && (
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Selected
                  </Badge>
                )}
              </Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  <SelectItem value="low" className="text-white focus:bg-blue-500/20">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      <span>Low - Can wait</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium" className="text-white focus:bg-blue-500/20">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-400" />
                      <span>Medium - Normal priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high" className="text-white focus:bg-blue-500/20">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-400" />
                      <span>High - Needs attention</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent" className="text-white focus:bg-blue-500/20">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-400" />
                      <span>Urgent - Immediate action</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!formData.category}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Review Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-mono mb-4">Review & Submit</h2>
                <p className="text-gray-400 text-sm">
                  Please review your complaint before submitting
                </p>
              </div>

              <div className="space-y-4">
                <ReviewField label="Title" value={formData.title} />
                <ReviewField label="Description" value={formData.description} multiline />
                <ReviewField
                  label="Category"
                  value={COMPLAINT_CATEGORIES.find(c => c.id === formData.category)?.name || ''}
                />
                <ReviewField
                  label="Priority"
                  value={formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                />
                {uploadedFiles.length > 0 && (
                  <ReviewField
                    label="Attachments"
                    value={`${uploadedFiles.length} file(s) uploaded`}
                  />
                )}
              </div>

              {/* Anonymous Toggle */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {formData.isAnonymous ? (
                      <EyeOff className="h-5 w-5 text-purple-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-purple-400" />
                    )}
                    <div>
                      <h4 className="font-bold text-purple-400">Submit Anonymously</h4>
                      <p className="text-sm text-gray-400">
                        Your identity will be hidden from other students
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={formData.isAnonymous ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
                    className={formData.isAnonymous
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                    }
                  >
                    {formData.isAnonymous ? 'Anonymous' : 'Public'}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="border-white/20 text-white hover:bg-white/10"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

function StepIndicator({ number, label, active, completed }: {
  number: number
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono transition-all ${
        completed
          ? 'bg-green-500 text-white'
          : active
            ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
            : 'bg-white/10 text-gray-500'
      }`}>
        {completed ? <CheckCircle2 className="h-5 w-5" /> : number}
      </div>
      <span className={`text-xs font-medium ${active ? 'text-white' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )
}

function ReviewField({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="border-l-2 border-blue-500 pl-4">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className={`text-white ${multiline ? 'whitespace-pre-wrap' : ''}`}>
        {multiline && value.length > 200 ? value.substring(0, 200) + '...' : value}
      </div>
    </div>
  )
}
