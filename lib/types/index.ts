import { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Complaint = Database['public']['Tables']['complaints']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Upvote = Database['public']['Tables']['upvotes']['Row']
export type Feedback = Database['public']['Tables']['feedback']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Extended types with relations
export interface ComplaintWithRelations extends Complaint {
  profiles: Profile | null
  comments: CommentWithProfile[]
  upvotes: Upvote[]
  feedback: Feedback[]
  hasUserUpvoted?: boolean
}

export interface CommentWithProfile extends Comment {
  profiles: Profile | null
}

export interface NotificationWithComplaint extends Notification {
  complaints: Complaint | null
}

// Form types
export interface ComplaintFormData {
  title: string
  description: string
  category_id: string
  location_id: string
  is_anonymous: boolean
  attachments?: File[]
}

export interface ProfileFormData {
  full_name: string
  location_id: string | null
  batch_name: string | null
  phone: string | null
}

export interface FeedbackFormData {
  complaint_id: string
  rating: number
  comment?: string
}

// AI Response types
export interface SentimentAnalysis {
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  score: number
}

export interface CategoryPrediction {
  category_id: string
  confidence: number
}

export interface AIAnalysisResult {
  sentiment: SentimentAnalysis
  suggestedCategory?: CategoryPrediction
  suggestedPriority: 'low' | 'medium' | 'high' | 'urgent'
  keywords: string[]
}

// Analytics types
export interface LocationStats {
  location_id: string
  location_name: string
  total_complaints: number
  resolved_complaints: number
  avg_resolution_time: number
  resolution_rate: number
}

export interface CategoryStats {
  category_id: string
  category_name: string
  count: number
  percentage: number
}

export interface DashboardStats {
  total_complaints: number
  new_complaints: number
  in_progress_complaints: number
  resolved_complaints: number
  urgent_complaints: number
  avg_resolution_time: number
  satisfaction_rate: number
  location_stats: LocationStats[]
  category_stats: CategoryStats[]
  recent_complaints: ComplaintWithRelations[]
  trending_complaints: ComplaintWithRelations[]
}

// BroBot types
export interface UserStats {
  total: number
  pending: number
  inProgress: number
  resolved: number
  urgent?: number
  activeUrgent?: number
  avgResolutionTime?: number
}

export interface ScreenContext {
  page?: string
  pageType?: string
  section?: string
  fields?: string[]
  categories?: string[]
  priorities?: string[]
  features?: string[]
  data?: Record<string, unknown>
}
