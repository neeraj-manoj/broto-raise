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

    if (description.length < 20) {
      return NextResponse.json(
        { error: 'Description too short to enhance' },
        { status: 400 }
      )
    }

    // Enhance the description with AI
    const enhancedDescription = await enhanceDescription(title, description)

    return NextResponse.json({ enhancedDescription })
  } catch (error) {
    return NextResponse.json(
      { error: 'AI enhancement failed' },
      { status: 500 }
    )
  }
}

async function enhanceDescription(title: string, description: string): Promise<string> {
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY

  // Try Hugging Face AI with OpenAI-compatible API
  if (HF_API_KEY) {
    try {
      const client = new OpenAI({
        baseURL: 'https://router.huggingface.co/v1',
        apiKey: HF_API_KEY,
      })

      const models = [
        'meta-llama/Llama-3.1-8B-Instruct',
        'Qwen/Qwen2.5-7B-Instruct',
        'mistralai/Mistral-7B-Instruct-v0.3'
      ]

      const systemPrompt = `You are an AI writing assistant. Your job is to EXPAND and ELABORATE student complaint descriptions to make them more detailed, professional and clear.

Rules:
- EXPAND the description significantly (2-3x longer than the original)
- Add more context, details, and specific information based on what's provided
- Make it professional and well-structured
- Do NOT add greetings, salutations, or letter formatting
- Do NOT add "Dear Administrator" or similar
- Do NOT repeat the title in the description
- Use first person if the original does ("I", "my", etc.)
- Include specific details about impact, frequency, or circumstances if mentioned
- Output ONLY the expanded description text, nothing else

Example:
Brief: "WiFi keeps disconnecting during sessions"
Expanded: "I have been experiencing frequent WiFi disconnections during my mentorship sessions over the past week. The connection drops approximately every 15-20 minutes, which significantly disrupts my ability to follow along with the coding exercises and causes me to miss important explanations from the mentor. This has happened consistently across multiple sessions, and I've noticed other students in the same area facing similar issues. The problem seems to worsen during peak hours in the afternoon."`

      const userPrompt = `Expand and elaborate this brief complaint description into a detailed, professional version (2-3x longer). Add more context and specifics while keeping the core message. Output ONLY the expanded text:

${description}`

      for (const modelName of models) {
        try {
          const completion = await client.chat.completions.create({
            model: modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 500,
            temperature: AI_CONFIG.temperature.creative,
          })

          const enhanced = completion.choices[0]?.message?.content?.trim() || ''

          if (enhanced && enhanced.length > 20) {
            // Clean up the response
            let cleaned = enhanced
              .replace(/^(Professional version:|Rewritten:|Enhanced:|Here's the rewritten complaint:)\s*/i, '')
              .replace(/^["']|["']$/g, '')
              .trim()

            return cleaned
          }

        } catch (error: any) {
          continue
        }
      }
    } catch (error) {
      // Fall through to fallback
    }
  }

  // Fallback to smart local enhancement
  return improveDescriptionLocally(description)
}

function improveDescriptionLocally(description: string): string {
  let improved = description.trim()

  // Skip if too short
  if (improved.length < 10) {
    return improved
  }

  // Capitalize first letter of each sentence
  improved = improved.replace(/(^\w|[.!?]\s+\w)/g, (match) => match.toUpperCase())

  // Add proper spacing after punctuation
  improved = improved.replace(/([.!?,;:])([^\s])/g, '$1 $2')

  // Remove multiple spaces
  improved = improved.replace(/\s+/g, ' ')

  // Add period at end if missing
  if (!/[.!?]$/.test(improved)) {
    improved += '.'
  }

  // Common informal -> formal replacements
  const replacements: Record<string, string> = {
    "don't": "do not",
    "can't": "cannot",
    "won't": "will not",
    "isn't": "is not",
    "aren't": "are not",
    "wasn't": "was not",
    "weren't": "were not",
    "hasn't": "has not",
    "haven't": "have not",
    "wouldn't": "would not",
    "shouldn't": "should not",
    "couldn't": "could not",
    " u ": " you ",
    " ur ": " your ",
    " r ": " are ",
    " y ": " why ",
    "pls": "please",
    "plz": "please",
    "thx": "thank you",
    "thanks": "thank you",
  }

  // Apply replacements (case-insensitive)
  Object.entries(replacements).forEach(([informal, formal]) => {
    const regex = new RegExp(`\\b${informal}\\b`, 'gi')
    improved = improved.replace(regex, formal)
  })

  // Improve common phrases
  improved = improved
    .replace(/\bbad\b/gi, 'unsatisfactory')
    .replace(/\bgood\b/gi, 'satisfactory')
    .replace(/\bvery bad\b/gi, 'highly unsatisfactory')
    .replace(/\bvery good\b/gi, 'excellent')
    .replace(/\bnot working\b/gi, 'not functioning properly')
    .replace(/\bbroken\b/gi, 'damaged')

  // Add formal opening if too casual
  if (!/^(I am|We are|The|This|There|I would)/i.test(improved)) {
    if (/^(food|wifi|room|class|mentor|teacher|admin|facility|bathroom|ac|computer|laptop)/i.test(improved)) {
      improved = 'The ' + improved.charAt(0).toLowerCase() + improved.slice(1)
    } else if (/^(need|want|have|got|facing|experiencing)/i.test(improved)) {
      improved = 'I am ' + improved.charAt(0).toLowerCase() + improved.slice(1)
    }
  }

  return improved
}
