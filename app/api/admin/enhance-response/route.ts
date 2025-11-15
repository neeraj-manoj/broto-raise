import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { AI_CONFIG } from '@/lib/constants'

const client = new OpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: process.env.HUGGINGFACE_API_KEY,
})

const models = [
  'meta-llama/Llama-3.1-8B-Instruct',
  'Qwen/Qwen2.5-7B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3'
]

export async function POST(request: Request) {
  try {
    const { currentResponse, complaintTitle, complaintDescription, studentName, adminName, adminRole } = await request.json()

    const studentGreeting = studentName ? `Dear ${studentName.split(' ')[0]},` : 'Dear student,'
    const adminSignature = adminName ? `Best regards,\n${adminName}\n${adminRole === 'super_admin' ? 'Senior Administrator' : 'Administrator'}, Brocamp` : 'Best regards,\nBrocamp Administration Team'

    const prompt = `You are an admin assistant helping to EXPAND and ELABORATE admin responses to student complaints at Brocamp mentorship facility.

Complaint Context:
- Title: ${complaintTitle}
- Description: ${complaintDescription}

Admin's Brief Response Draft:
"${currentResponse}"

Your task is to EXPAND this into a comprehensive, detailed reply by:
1. Starting with: "${studentGreeting}"
2. EXPANDING the content: Add more details, explanations, and context based on what the admin wrote
3. Including specific action steps or timeline if relevant
4. Adding empathy and acknowledgment of the student's specific concern
5. Explaining WHY actions are being taken (if applicable)
6. Making it sound professional yet warm and approachable
7. Adding follow-up information or next steps
8. Ending with: "${adminSignature}"

IMPORTANT:
- Write a LONGER, MORE DETAILED version (at least 2-3x the original length)
- Keep the core message but ELABORATE significantly
- Make it 3-5 well-developed sentences (not including greeting and signature)
- Return ONLY the complete response with greeting and signature
- Do not include quotes or meta-commentary

Example format:
${studentGreeting}

[Expanded content here with 3-5 detailed sentences]

${adminSignature}`

    let response: string | null = null
    let lastError = null

    // Try each model in sequence
    for (const model of models) {
      try {
        const chatCompletion = await client.chat.completions.create({
          model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: AI_CONFIG.temperature.creative,
        })

        response = chatCompletion.choices[0]?.message?.content?.trim() || null

        // Remove quotes if the AI wrapped the response
        if (response) {
          // Remove surrounding quotes
          if (response.startsWith('"') && response.endsWith('"')) {
            response = response.slice(1, -1)
          }
          if (response.startsWith("'") && response.endsWith("'")) {
            response = response.slice(1, -1)
          }

          // Break if we got a valid response
          if (response.length > 10) {
            break
          }
        }
      } catch (error: any) {
        lastError = error
        continue // Try next model
      }
    }

    // If all models failed, return original with minor formatting
    if (!response || response.length < 10) {
      // Basic enhancement: capitalize first letter, ensure proper punctuation
      response = currentResponse.trim()
      if (response && !response.endsWith('.') && !response.endsWith('!') && !response.endsWith('?')) {
        response += '.'
      }
      if (response && response.length > 0) {
        response = response.charAt(0).toUpperCase() + response.slice(1)
      }
    }

    if (!response || response.length === 0) {
      throw new Error('Failed to generate valid response')
    }

    return NextResponse.json({ response })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to enhance response' },
      { status: 500 }
    )
  }
}
