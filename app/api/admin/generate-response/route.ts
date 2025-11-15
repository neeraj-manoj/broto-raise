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
    const { complaintTitle, complaintDescription, complaintCategory, priority, location, studentName, adminName, adminRole } = await request.json()

    const studentGreeting = studentName ? `Dear ${studentName.split(' ')[0]},` : 'Dear student,'
    const adminSignature = adminName ? `Best regards,\n${adminName}\n${adminRole === 'super_admin' ? 'Senior Administrator' : 'Administrator'}, Brocamp` : 'Best regards,\nBrocamp Administration Team'

    const prompt = `You are an admin assistant helping to draft professional responses to student complaints at Brocamp mentorship facility.

Complaint Details:
- Title: ${complaintTitle}
- Description: ${complaintDescription}
- Category: ${complaintCategory || 'General'}
- Priority: ${priority || 'medium'}
- Location: ${location || 'Campus'}

Please generate a professional, empathetic, and helpful response that:
1. Starts with: "${studentGreeting}"
2. Acknowledges the student's concern specifically
3. Shows understanding of the issue and its impact
4. Explains what action will be taken or has been taken
5. Provides a timeline if applicable (e.g., "within 2-3 business days")
6. Thanks the student for reporting
7. Ends with: "${adminSignature}"

Keep the response concise (3-5 sentences in the main body, not including greeting and signature). Be professional yet warm and approachable.`

    let response = null
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
          max_tokens: 300,
          temperature: AI_CONFIG.temperature.default,
        })

        response = chatCompletion.choices[0]?.message?.content?.trim()

        if (response) {
          break // Success, exit loop
        }
      } catch (error) {
        lastError = error
        continue // Try next model
      }
    }

    // If all models failed, return template response
    if (!response) {
      response = `Thank you for bringing this to our attention. We understand how ${complaintTitle.toLowerCase()} can affect your experience. Our team is looking into this matter and will take appropriate action to resolve it. We'll keep you updated on the progress. We appreciate your patience and for reporting this issue.`
    }

    return NextResponse.json({ response })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
