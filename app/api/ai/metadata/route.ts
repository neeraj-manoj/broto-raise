import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { AI_CONFIG } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Generate metadata with AI
    const metadata = await generateMetadata(title, description)

    return NextResponse.json(metadata)
  } catch (error) {
    return NextResponse.json(
      { error: 'AI metadata generation failed' },
      { status: 500 }
    )
  }
}

async function generateMetadata(
  title: string,
  description: string
): Promise<{ category: string | null; priority: string | null }> {
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY

  // Try Hugging Face AI with OpenAI-compatible API
  if (HF_API_KEY) {
    try {

      const client = new OpenAI({
        baseURL: 'https://router.huggingface.co/v1',
        apiKey: HF_API_KEY,
      })

      const models = [
        'microsoft/Phi-3.5-mini-instruct',
        'meta-llama/Llama-3.1-8B-Instruct',
        'mistralai/Mistral-7B-Instruct-v0.3',
        'Qwen/Qwen2.5-7B-Instruct'
      ]

      const systemPrompt = `You are an AI that categorizes student complaints for a complaint management system.

Available categories:
- mentor: Issues with mentors, teaching quality, guidance, instruction methods
- admin: Administrative issues, fees, payments, documents, paperwork, registration
- academic-counsellor: Career guidance, academic counseling, course selection, future planning
- working-hub: Facilities issues (WiFi, AC, computers, rooms, equipment, infrastructure, seating, cleanliness)
- peer: Issues with other students, peer behavior, conflicts, harassment
- other: Anything else that doesn't fit above categories

Priority levels:
- urgent: Emergency, critical, severe safety/health issues, harassment, immediate action needed
- high: Important, significant problems affecting learning, repeated issues
- medium: Standard issues, normal problems that need attention
- low: Minor inconveniences, suggestions, can wait

Respond with ONLY valid JSON in this exact format:
{"category": "category-id", "priority": "priority-level"}

Use the exact category IDs above. Be accurate based on the complaint content.`

      const fullText = `Title: ${title}\n\nDescription: ${description}`

      for (const modelName of models) {
        try {
          const completion = await client.chat.completions.create({
            model: modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: fullText }
            ],
            max_tokens: 100,
            temperature: AI_CONFIG.temperature.consistent,
          })

          const response = completion.choices[0]?.message?.content?.trim() || ''

          // Extract JSON from response
          let jsonMatch = response.match(/\{[^}]+\}/)
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0])

              // Validate category
              const validCategories = ['mentor', 'admin', 'academic-counsellor', 'working-hub', 'peer', 'other']
              const validPriorities = ['urgent', 'high', 'medium', 'low']

              if (validCategories.includes(parsed.category) && validPriorities.includes(parsed.priority)) {
                return parsed
              }
            } catch (e) {
            }
          }

        } catch (error: any) {
          continue
        }
      }
    } catch (error) {
    }
  }

  // Fallback to keyword-based classification
  return generateMetadataFallback(title, description)
}

function generateMetadataFallback(title: string, description: string): { category: string; priority: string } {
  const fullText = `${title} ${description}`.toLowerCase()

  // Category detection with comprehensive keywords
  let category = 'other'

  // Mentor-related
  if (/\b(mentor|teacher|instructor|tutor|teaching|lecture|class|explain|guidance|doubt|session|trainer)\b/i.test(fullText)) {
    category = 'mentor'
  }
  // Admin-related
  else if (/\b(admin|fee|payment|document|certificate|registration|admission|office|paperwork|form|receipt|refund|billing)\b/i.test(fullText)) {
    category = 'admin'
  }
  // Academic counsellor
  else if (/\b(counselor|counsellor|career|guidance|future|placement|job|course selection|academic advice|planning)\b/i.test(fullText)) {
    category = 'academic-counsellor'
  }
  // Working hub/facilities
  else if (/\b(wifi|internet|ac|air condition|computer|laptop|lab|room|seat|chair|table|facility|infrastructure|equipment|projector|bathroom|washroom|toilet|clean|maintenance|repair|broken|damaged)\b/i.test(fullText)) {
    category = 'working-hub'
  }
  // Peer issues
  else if (/\b(student|peer|classmate|colleague|bully|harass|conflict|fight|behavior|disturb|noise from student)\b/i.test(fullText)) {
    category = 'peer'
  }

  // Priority detection with comprehensive keywords
  let priority = 'medium'

  // Urgent indicators
  if (/\b(urgent|emergency|critical|immediate|asap|severe|serious|dangerous|unsafe|harassment|bully|threat|health|safety|broken down|not working at all)\b/i.test(fullText)) {
    priority = 'urgent'
  }
  // High priority indicators
  else if (/\b(important|significant|major|repeated|again|still|weeks|days|affecting|impact|problem|issue|bad|terrible|worst)\b/i.test(fullText)) {
    priority = 'high'
  }
  // Low priority indicators
  else if (/\b(minor|small|slight|suggestion|feedback|could|maybe|would be nice|improvement|enhance)\b/i.test(fullText)) {
    priority = 'low'
  }

  return { category, priority }
}
