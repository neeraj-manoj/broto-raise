import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { AI_CONFIG } from '@/lib/constants'

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { userRole = 'student' } = await request.json()

    // Try AI generation with strict validation
    if (HUGGINGFACE_API_KEY) {
      try {
        const aiQuestions = await generateSmartQuestions(userRole)
        if (aiQuestions.length === 4) {
          return NextResponse.json({ questions: aiQuestions })
        }
      } catch (error) {
        // Fall through to fallback
      }
    }

    // Fallback to curated questions
    const questions = getDefaultQuestions(userRole)
    return NextResponse.json({ questions })

  } catch (error) {
    return NextResponse.json(
      { questions: getDefaultQuestions('student') },
      { status: 500 }
    )
  }
}

async function generateSmartQuestions(userRole: string): Promise<string[]> {
  const client = new OpenAI({
    baseURL: 'https://router.huggingface.co/v1',
    apiKey: HUGGINGFACE_API_KEY,
  })

  // Define EXACT features that exist - AI must only use these
  const featureBank = getFeatureBank(userRole)

  const systemPrompt = `You are a question generator for BrotoRaise complaint system.
Your job: Create 4 varied, natural questions using ONLY the features provided.

STRICT RULES:
1. ONLY mention features from the list given
2. Never invent or assume features
3. Questions must be 5-12 words
4. Natural, conversational tone
5. End with "?"
6. Vary the question starters (How/What/Can/Where/etc)
7. Each question should cover different aspects

${featureBank}

Return ONLY 4 questions, one per line, no numbering.`

  const models = [
    'meta-llama/Llama-3.1-8B-Instruct',
    'Qwen/Qwen2.5-7B-Instruct',
  ]

  for (const modelName of models) {
    try {
      const completion = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate 4 questions for ${userRole}.` }
        ],
        max_tokens: 200,
        temperature: AI_CONFIG.temperature.creative_high,
      })

      const response = completion.choices[0]?.message?.content || ''
      const questions = response
        .split('\n')
        .map(q => q.trim().replace(/^\d+[\.\)]\s*/, '')) // Remove numbering
        .filter(q => q.length > 10 && q.length < 100 && q.endsWith('?'))
        .slice(0, 4)

      // Validate questions against allowed keywords
      const validQuestions = validateQuestions(questions, userRole)

      if (validQuestions.length === 4) {
        return validQuestions
      }
    } catch (error) {
      continue
    }
  }

  throw new Error('Could not generate valid questions')
}

function getFeatureBank(userRole: string): string {
  if (userRole === 'admin') {
    return `Available Admin Features:
- "Generate with AI" button - creates complete response automatically
- "Enhance with AI" button - expands your brief notes 2-3x longer
- "Undo" button - reverts AI changes
- Status updates: NEW, UNDER REVIEW, IN PROGRESS, RESOLVED, CLOSED
- "View Profile" button - see student details and history
- Two-column complaint modal (details left, response right)
- Admin response textarea for typing replies
- Student notifications when you respond
- Filter complaints by category, status, priority
- Download complaint attachments`
  } else if (userRole === 'super_admin') {
    return `Available Super Admin Features:
- All regular admin features (AI tools, status changes, profiles)
- View ALL complaints system-wide
- Dashboard statistics (total, pending, in progress, resolved, urgent)
- "Admin Management" tab for managing admin users
- Purple-themed interface (vs blue for regular admins)
- System-wide complaint filtering and search
- Analytics overview
- Admin activity monitoring`
  } else {
    return `Available Student Features:
- "New Complaint" button to submit issues
- 6 Categories: Mentor, Admin, Academic Counsellor, Working Hub, Peer, Other
- 4 Priority levels: LOW, MEDIUM, HIGH, URGENT
- "Submit Anonymously" toggle to hide your name
- "Enhance with AI" button to improve your description
- "My Complaints" page to track submissions
- Real-time status updates (NEW → IN PROGRESS → RESOLVED)
- File attachments (images/documents)
- View admin responses and replies
- Notification when admin responds`
  }
}

function validateQuestions(questions: string[], userRole: string): string[] {
  // Keywords that MUST appear for each role
  const allowedKeywords = getAllowedKeywords(userRole)

  return questions.filter(q => {
    const lowerQ = q.toLowerCase()
    // Check if question mentions at least one allowed keyword
    return allowedKeywords.some(keyword => lowerQ.includes(keyword.toLowerCase()))
  })
}

function getAllowedKeywords(userRole: string): string[] {
  if (userRole === 'admin') {
    return [
      'generate', 'enhance', 'ai', 'undo', 'status', 'profile', 'view',
      'respond', 'reply', 'modal', 'student', 'notification', 'filter',
      'attachment', 'download', 'review', 'progress', 'resolved', 'closed'
    ]
  } else if (userRole === 'super_admin') {
    return [
      'admin', 'manage', 'all complaints', 'statistics', 'stats', 'dashboard',
      'system', 'analytics', 'overview', 'monitoring', 'activity', 'generate',
      'enhance', 'ai', 'status', 'profile', 'view', 'filter', 'search'
    ]
  } else {
    return [
      'complaint', 'submit', 'anonymous', 'category', 'categories', 'priority',
      'enhance', 'ai', 'track', 'status', 'attachment', 'file', 'response',
      'notification', 'mentor', 'admin', 'counsellor', 'hub', 'peer', 'urgent'
    ]
  }
}

function getDefaultQuestions(userRole: string): string[] {
  if (userRole === 'admin') {
    return [
      "How do I use AI to respond?",
      "What's Generate vs Enhance AI?",
      "How do I change status?",
      "How do I view student profiles?",
    ]
  } else if (userRole === 'super_admin') {
    return [
      "What can super admins do?",
      "How do I view all complaints?",
      "What stats are available?",
      "How do I manage admins?",
    ]
  } else {
    return [
      "How do I raise a complaint?",
      "Can I submit anonymously?",
      "What categories are available?",
      "How does AI Enhancement work?",
    ]
  }
}
