export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'student' | 'admin' | 'super_admin'
          location_id: string | null
          batch_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'student' | 'admin' | 'super_admin'
          location_id?: string | null
          batch_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'student' | 'admin' | 'super_admin'
          location_id?: string | null
          batch_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      complaints: {
        Row: {
          id: string
          title: string
          description: string
          category_id: string
          location_id: string
          status: 'new' | 'under_review' | 'in_progress' | 'resolved' | 'closed' | 'urgent'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          is_anonymous: boolean
          created_by: string
          assigned_to: string | null
          attachments: string[] | null
          ai_sentiment: number | null
          ai_category_confidence: number | null
          upvotes_count: number
          views_count: number
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category_id: string
          location_id: string
          status?: 'new' | 'under_review' | 'in_progress' | 'resolved' | 'closed' | 'urgent'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          is_anonymous?: boolean
          created_by: string
          assigned_to?: string | null
          attachments?: string[] | null
          ai_sentiment?: number | null
          ai_category_confidence?: number | null
          upvotes_count?: number
          views_count?: number
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category_id?: string
          location_id?: string
          status?: 'new' | 'under_review' | 'in_progress' | 'resolved' | 'closed' | 'urgent'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          is_anonymous?: boolean
          created_by?: string
          assigned_to?: string | null
          attachments?: string[] | null
          ai_sentiment?: number | null
          ai_category_confidence?: number | null
          upvotes_count?: number
          views_count?: number
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          complaint_id: string
          user_id: string
          content: string
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          complaint_id: string
          user_id: string
          content: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          complaint_id?: string
          user_id?: string
          content?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      upvotes: {
        Row: {
          id: string
          complaint_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          complaint_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          complaint_id?: string
          user_id?: string
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          complaint_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          complaint_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          complaint_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          complaint_id: string | null
          title: string
          message: string
          type: 'status_update' | 'comment' | 'assignment' | 'resolution' | 'upvote'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          complaint_id?: string | null
          title: string
          message: string
          type: 'status_update' | 'comment' | 'assignment' | 'resolution' | 'upvote'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          complaint_id?: string | null
          title?: string
          message?: string
          type?: 'status_update' | 'comment' | 'assignment' | 'resolution' | 'upvote'
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
