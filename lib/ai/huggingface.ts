import { AIAnalysisResult, SentimentAnalysis, CategoryPrediction } from '@/lib/types'
import { COMPLAINT_CATEGORIES, SENTIMENT_CONFIG } from '@/lib/constants'

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models'
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY

/**
 * Analyze sentiment using Hugging Face API
 */
export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  try {
    const response = await fetch(
      `${HUGGING_FACE_API_URL}/distilbert-base-uncased-finetuned-sst-2-english`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      }
    )

    if (!response.ok) {
      throw new Error('Sentiment analysis failed')
    }

    const result = await response.json()
    const sentiment = result[0][0]

    return {
      label: sentiment.label as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
      score: sentiment.score,
    }
  } catch (error) {

    // Return neutral sentiment as fallback
    return { label: 'NEUTRAL', score: 0.5 }
  }
}

/**
 * Categorize complaint using keyword matching and AI
 */
export function categorizeComplaint(title: string, description: string): CategoryPrediction {
  const text = `${title} ${description}`.toLowerCase()
  const scores: Record<string, number> = {}

  // Calculate scores based on keyword matches
  COMPLAINT_CATEGORIES.forEach(category => {
    let score = 0
    category.keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 1
      }
    })
    scores[category.id] = score
  })

  // Find category with highest score
  let maxScore = 0
  let suggestedCategory = 'other'

  Object.entries(scores).forEach(([categoryId, score]) => {
    if (score > maxScore) {
      maxScore = score
      suggestedCategory = categoryId
    }
  })

  // Calculate confidence (0-1)
  const totalMatches = Object.values(scores).reduce((a, b) => a + b, 0)
  const confidence = totalMatches > 0 ? maxScore / totalMatches : 0.3

  return {
    category_id: suggestedCategory,
    confidence: Math.min(confidence, 1),
  }
}

/**
 * Determine priority based on sentiment and keywords
 */
export function determinePriority(
  sentiment: SentimentAnalysis,
  text: string
): 'low' | 'medium' | 'high' | 'urgent' {
  const lowerText = text.toLowerCase()

  // Check for urgent keywords
  const hasUrgentKeyword = SENTIMENT_CONFIG.keywords.urgent.some(keyword =>
    lowerText.includes(keyword)
  )

  if (hasUrgentKeyword) {
    return 'urgent'
  }

  // Check sentiment score
  if (sentiment.label === 'NEGATIVE' && sentiment.score > SENTIMENT_CONFIG.urgentThreshold) {
    return 'urgent'
  }

  if (sentiment.label === 'NEGATIVE' && sentiment.score > 0.6) {
    return 'high'
  }

  if (sentiment.label === 'NEGATIVE') {
    return 'medium'
  }

  return 'low'
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'i', 'me', 'my', 'we', 'our',
  ])

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))

  // Count word frequency
  const wordCounts: Record<string, number> = {}
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1
  })

  // Sort by frequency and return top 5
  return Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word)
}

/**
 * Complete AI analysis of a complaint
 */
export async function analyzeComplaint(
  title: string,
  description: string
): Promise<{
  sentiment: number
  sentimentLabel: 'negative' | 'neutral' | 'positive'
  suggestedCategory: string
  categoryConfidence: number
  suggestedPriority: 'low' | 'medium' | 'high' | 'urgent'
  reasoning: string
}> {
  const text = `${title} ${description}`

  // Perform sentiment analysis
  const sentimentResult = await analyzeSentiment(text)

  // Convert sentiment to 0-1 scale
  const sentiment = sentimentResult.label === 'POSITIVE'
    ? sentimentResult.score
    : sentimentResult.label === 'NEGATIVE'
    ? 1 - sentimentResult.score
    : 0.5

  const sentimentLabel = sentimentResult.label === 'POSITIVE'
    ? 'positive'
    : sentimentResult.label === 'NEGATIVE'
    ? 'negative'
    : 'neutral'

  // Categorize complaint
  const categoryResult = categorizeComplaint(title, description)

  // Determine priority
  const suggestedPriority = determinePriority(sentimentResult, text)

  // Generate reasoning
  const reasoning = `${
    suggestedPriority === 'urgent' ? 'Urgent action needed - ' :
    suggestedPriority === 'high' ? 'High priority - ' :
    suggestedPriority === 'medium' ? 'Standard priority - ' :
    'Low priority - '
  }${sentimentLabel} sentiment detected${
    categoryResult.confidence > 0.7 ? ' with high confidence in category' : ''
  }`

  return {
    sentiment,
    sentimentLabel,
    suggestedCategory: categoryResult.category_id,
    categoryConfidence: categoryResult.confidence,
    suggestedPriority,
    reasoning,
  }
}

/**
 * Generate AI-powered suggestion for complaint description
 */
export async function generateComplaintSuggestion(
  title: string,
  partialDescription: string
): Promise<string> {
  try {
    // Use Hugging Face's GPT-2 model for text generation
    const response = await fetch(`${HUGGING_FACE_API_URL}/gpt2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Complaint: ${title}\nDescription: ${partialDescription}`,
        parameters: {
          max_new_tokens: 50,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Text generation failed')
    }

    const result = await response.json()
    return result[0].generated_text.trim()
  } catch (error) {

    return ''
  }
}

/**
 * Generate AI-assisted response suggestion for admins
 */
export async function generateResponseSuggestion(
  complaintTitle: string,
  complaintDescription: string
): Promise<string> {
  const prompt = `As a Brocamp administrator, write a professional and empathetic response to this student complaint:\n\nTitle: ${complaintTitle}\nDescription: ${complaintDescription}\n\nResponse:`

  try {
    const response = await fetch(`${HUGGING_FACE_API_URL}/gpt2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.8,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Response generation failed')
    }

    const result = await response.json()
    return result[0].generated_text.trim()
  } catch (error) {

    return ''
  }
}
