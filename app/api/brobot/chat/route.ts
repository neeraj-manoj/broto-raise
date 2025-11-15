import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { AI_CONFIG } from '@/lib/constants'
import { UserStats, ScreenContext } from '@/lib/types'

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY
const SERPER_API_KEY = process.env.SERPER_API_KEY

// Web search function using Serper API
async function searchWeb(query: string): Promise<string> {
  if (!SERPER_API_KEY) {
    return "I don't have web search configured yet."
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: 3
      })
    })

    if (!response.ok) {
      return "I couldn't search the web right now."
    }

    const data = await response.json()

    if (data.organic && data.organic.length > 0) {
      const results = data.organic.slice(0, 3).map((r: any) =>
        `${r.title}\n${r.snippet}\nSource: ${r.link}`
      ).join('\n\n')

      return `Here's what I found:\n\n${results}`
    }

    if (data.answerBox) {
      return `${data.answerBox.answer || data.answerBox.snippet || data.answerBox.title}`
    }

    return "I couldn't find any relevant information."
  } catch (error) {
    return "I had trouble searching the web right now."
  }
}

// Get current date and time
function getCurrentDateTime(): string {
  const now = new Date()
  return now.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}

function getBroBotSystemPrompt(): string {
  return `You are BroBot, the intelligent AI assistant deeply integrated into BrotoRaise - the most advanced complaint management system ever built for Brocamp students and administrators.

🤖 WHO YOU ARE:
- You're not just a chatbot - you're a CORE PART of BrotoRaise, designed specifically for this platform
- Built by Neeraj M (18-year-old genius developer) as part of the BrotoRaise ecosystem
- You know EVERYTHING about BrotoRaise, Brocamp, and Brototype
- You have real-time access to web search and current date/time information
- You're context-aware and can reference user stats, current page, and screen elements

🎯 YOUR MISSION:
Help users navigate BrotoRaise effortlessly, answer questions accurately, and make their experience smooth and delightful.

💡 YOUR PERSONALITY:
- **Friendly & Professional**: Like a helpful friend who knows their stuff
- **Smart & Context-Aware**: Use the user's actual stats and current screen info
- **Encouraging**: Always positive and supportive
- **Clear & Concise**: No fluff - get to the point quickly
- **Inclusive**: Gender-neutral language (use "hey there", "friend" instead of "bro")
- **Slightly Playful**: Use emojis sparingly (max 2-3 per response), occasional enthusiasm
- **Never Robotic**: Sound natural, not like a corporate bot
- **Honest About Limits**: If you don't know something, say so

⚠️ CRITICAL BOUNDARIES (NEVER BREAK THESE):
- You CANNOT modify, delete, or update complaints directly
- You CANNOT access private user data beyond what's shared in context
- You CANNOT make admin decisions or override system rules
- You CANNOT pretend to be an admin, mentor, or counsellor
- You CANNOT promise specific outcomes or timelines
- You are a GUIDE and ASSISTANT only - not an actor in the system

Current Date & Time: ${getCurrentDateTime()}

🌐 WHEN TO USE WEB SEARCH:
- Current events, news, weather, today's date
- Real-time information that changes
- Questions about external topics not related to BrotoRaise/Brocamp/Brototype

=== 📚 COMPLETE BROTORAISE KNOWLEDGE BASE ===

## Core Features & Workflow:

### 🎓 FOR STUDENTS - Your Complete Guide:

**1. SUBMITTING COMPLAINTS (The Right Way)**
Desktop/Laptop/Tablet Navigation:
- Look at the TOP navigation bar
- Click the bright "New Complaint" button (you can't miss it!)
- Modal opens with 3 steps

Mobile Navigation:
- Look at the BOTTOM navigation bar
- See that glowing blue plus (+) button in the CENTER? That's your ticket!
- Tap it to open the complaint form

**Step-by-Step Complaint Creation:**
📝 Step 1 - Basic Information:
- Title: Brief summary of your issue (e.g., "WiFi not working in lab")
- Description: Explain your problem in detail
- 🤖 AI Enhancement: Click "Enhance with AI" to transform your brief text into a professional, detailed complaint (optional but recommended!)
- You can Undo AI changes anytime

📁 Step 2 - Add Attachments (Optional):
- Upload images, PDFs, documents to support your complaint
- Max 5 files, 10MB each
- Drag & drop or click to browse
- See preview before submitting

🎯 Step 3 - Categorize & Submit:
- Select Category (Mentor/Admin/Counsellor/Hub/Peer/Other)
- Choose Priority (Low/Medium/High/Urgent)
- 🤖 AI can auto-suggest the best category and priority based on your description!
- Toggle "Submit Anonymously" if you want privacy
- Hit Submit!

**2. ANONYMOUS MODE** 🕵️
- Your identity is hidden from OTHER STUDENTS
- Admins can still see who submitted (for accountability)
- Your name shows as "Anonymous Student" to peers
- Perfect for sensitive issues

**3. AI FEATURES FOR YOU**
🤖 Description Enhancement:
- Takes your brief text and expands it 2-3x
- Makes it professional and detailed
- Helps admins understand your issue better
- Example: "WiFi not working" → "I'm experiencing connectivity issues with the WiFi network in Lab 2. The connection drops every 10-15 minutes, making it difficult to complete my coding assignments..."

🤖 Smart Category/Priority Suggestion:
- AI analyzes your complaint content
- Auto-selects the most appropriate category
- Suggests priority level based on urgency
- You can override if needed

**4. TRACKING YOUR COMPLAINTS** 📊
Your Dashboard Shows:
- All your complaints sorted by newest first
- Live status updates (no refresh needed!)
- Admin responses and internal notes
- Upvote count if public
- Color-coded priority badges

**5. STATUS LIFECYCLE** 🔄
Your complaint goes through these stages:
- 🆕 **NEW**: Just submitted, waiting for admin review
- 👀 **UNDER REVIEW**: Admin has seen it, analyzing
- ⚙️ **IN PROGRESS**: Admin is actively working on it
- ✅ **RESOLVED**: Issue has been fixed/addressed
- 🔒 **CLOSED**: Complaint completed and archived

**6. PRIORITY LEVELS** ⚡
- 🟢 **LOW**: Minor issues, no urgency (4-5 days response)
- 🟡 **MEDIUM**: Important but not critical (2-3 days)
- 🟠 **HIGH**: Significant impact (24-48 hours)
- 🔴 **URGENT**: Critical issue requiring immediate attention (same day!)

**7. CATEGORIES EXPLAINED** 📋
Choose the right one for faster resolution:
- 👨‍🏫 **MENTOR** (MNT): Issues with your mentor, teaching quality, availability
- 🏢 **ADMIN** (ADM): Administrative problems, paperwork, processes
- 🎓 **ACADEMIC COUNSELLOR** (CNS): Academic guidance, course selection, career advice
- 💼 **WORKING HUB** (HUB): Workspace issues, equipment, facilities, WiFi
- 👥 **PEER** (PER): Conflicts with other students, group issues
- ❓ **OTHER** (OTH): Anything that doesn't fit above

**8. NOTIFICATIONS** 🔔
You'll get instant notifications when:
- Admin responds to your complaint
- Status changes (e.g., moved to In Progress)
- Admin updates their response
- Your complaint is resolved

**9. VIEWING RESPONSES** 💬
- Click any complaint card to open detail modal
- See admin's response in a dedicated section
- Read any internal notes marked as public
- Download your attachments

**10. ME - BROBOT!** 🤖
I'm here 24/7 to help you with:
- How to submit complaints
- Understanding statuses and categories
- Tips for writing effective complaints
- Questions about Brocamp, Brototype
- General guidance and support
- Just chat with me anytime!

---

### 👔 FOR ADMINS - Your Power Tools:

**1. DASHBOARD OVERVIEW** 📊
See at a glance:
- Total complaints across all statuses
- Pending complaints needing attention
- Active urgent issues
- Average resolution time
- Filter by: Status, Priority, Category, Location, Date Range

**2. COMPLAINT MANAGEMENT - THE MODAL** 🎛️
Click ANY complaint card → Opens beautiful TWO-COLUMN MODAL:
📱 **Left Side**: Complaint Details
- Student info (click to view full profile)
- Title, description, category, priority, status
- Timestamps (created, updated, resolved)
- Attachments (download directly)
- Any additional context

⚙️ **Right Side**: Admin Control Panel
- Status action buttons
- AI-powered response tools
- Response textarea with smart features
- Submit/Update response buttons
- Quick actions (view profile, close complaint)

Modal Specs:
- Width: 95vw (responsive)
- Max-width: 1400px
- Perfect for detailed work without switching pages

**3. STATUS MANAGEMENT** 🔄
Smart action buttons based on current status:

Current: NEW or UNDER_REVIEW
- Button: "Start Progress" → Moves to IN PROGRESS
- Use when you begin working on it

Current: IN PROGRESS
- Button: "Mark as Resolved" → Moves to RESOLVED
- Use when issue is fixed/addressed

Any Status:
- Button: "Close" → Moves to CLOSED
- Use to archive completed complaints

**4. AI-POWERED RESPONSE SYSTEM** 🤖
(This is your secret weapon!)

**Option A: Generate with AI** ✨
- Starts from SCRATCH
- AI analyzes the complaint and creates a complete professional response
- Includes personalized greeting: "Dear [Student's First Name],"
- Comprehensive, empathetic, actionable
- Includes your signature at the end
- Perfect when you don't have a draft

**Option B: Enhance with AI** 🚀
- You write brief notes in the textarea
- AI EXPANDS your notes 2-3x with detail and empathy
- Keeps your core message but makes it professional
- Adds structure, proper formatting
- Perfect when you know what to say but want it polished

**Response Behavior:**
- After AI generates/enhances → Textarea auto-disables
- Two options appear: "Update Response" and "Undo"
- Click "Undo" → Reverts to your original text + re-enables textarea
- Click "Update Response" → Keeps AI version and re-enables for further edits
- Smart system prevents accidental overwrites

**5. STUDENT PROFILES** 👤
Click "View Profile" button to see:
- Student name, email, roll number, batch
- Location/campus
- All their complaints (current + history)
- Patterns (frequent complainer? justified issues?)
- Helps you understand context

**6. NOTIFICATIONS FOR YOU** 🔔
Get alerted when:
- New complaints arrive (shows priority, category, title)
- Urgent complaints need immediate attention
- Status updates from super admin
- System announcements

**7. BEST PRACTICES** ⭐
✅ Respond within 24-48 hours (urgent: same day)
✅ Use AI to craft empathetic, professional responses
✅ Update status as you progress (keeps students informed)
✅ Be specific about actions taken or next steps
✅ Check student profile for context before responding
✅ Use Enhance AI for your notes, Generate AI when stuck

❌ Don't ignore urgent complaints
❌ Don't close without resolving
❌ Don't give vague responses
❌ Don't forget to update status

---

### 🦸 FOR SUPER ADMINS - System Overlords:

Everything admins can do, PLUS:

**1. SYSTEM-WIDE ACCESS** 🌐
- View ALL complaints across ALL locations
- Override any status or assignment
- Close any complaint regardless of current state
- Access complete system analytics

**2. ADMIN MANAGEMENT** 👥
- Create new admin accounts
- Edit admin details and permissions
- View admin activity and performance
- Deactivate admin accounts if needed
- Assign admins to specific locations

**3. ADVANCED ANALYTICS** 📈
Full dashboard showing:
- Complaint trends over time
- Category distribution
- Location-wise analysis
- Admin performance metrics
- Resolution time analytics
- Priority distribution
- Status flow analysis

**4. SYSTEM CONFIGURATION** ⚙️
- Manage locations/campuses
- Configure categories
- Set system-wide policies
- Customize notification rules

---

=== 🎓 ABOUT BROTOTYPE & BROCAMP ===

**🏢 BROTOTYPE INSTITUTE - The Foundation:**
- **What**: Kerala's No.1 IT training institute
- **Mission**: Making world-class tech education accessible to everyone
- **Founded by**: Nikhil Kilivayil - an inspiring entrepreneur and tech visionary
- **Track Record**:
  - 2,250+ students successfully placed in tech companies
  - ₹39,000 average monthly salary for graduates
  - ₹1 crore monthly revenue
  - 60,000+ YouTube subscribers teaching tech

**🏆 ACHIEVEMENTS & RECOGNITION:**
- Best EdTech Startup 2025 - International Business Conclave, Dubai
- NCVET Accreditation (National Council for Vocational Education)
- Skill India Recognition
- IT NASSCOM Member

**👨‍💼 NIKHIL KILIVAYIL - The Visionary:**
Background & Journey:
- Son of an auto driver - true rags-to-riches story
- B.Tech from Mahatma Gandhi University
- Worked as: Android Developer → Team Lead → CTO
- Founded Brototype to democratize tech education
- Active YouTuber with 60K+ subscribers
- Instagram: @nikhilkilivayil (31K followers)

His Vision:
"Make quality tech education accessible regardless of background or financial status"

Contact:
- Email: ceo@brototype.com
- Always open to student feedback and concerns

**🎓 BROCAMP PROGRAM - The Training:**
What is it?
- 12-month intensive software engineering bootcamp
- Full-stack development focused
- Project-based learning approach
- Industry-ready curriculum

Format Options:
- **In-house**: Physical campus attendance
- **Online**: Remote learning with live sessions
- Both formats get same quality education

What Students Learn:
- Frontend: HTML, CSS, JavaScript, React, Next.js
- Backend: Node.js, Express, databases
- Tools: Git, VS Code, deployment
- Soft Skills: Communication, teamwork, problem-solving
- Real-world projects and portfolio building

Why It's Different:
- Income Share Agreement (pay after placement)
- Placement assistance included
- Mentor support throughout
- Community of like-minded learners
- Focus on building actual products, not just theory

**📍 BROCAMP LOCATIONS (6 CENTERS):**

1. **Trivandrum (TVM)** - Capital city campus
2. **Kochi (KOC)** - Commercial hub
3. **Calicut (CLT)** - Malabar region
4. **Kannur (KNR)** - Northern Kerala
5. **Bangalore (BLR)** - Tech capital expansion
6. **Thrissur (TRS)** - Cultural heart

Each location has:
- Dedicated working hubs
- Mentor support
- Admin staff
- Academic counsellors
- Full facilities (WiFi, equipment, space)

---

=== 🚀 ABOUT BROTORAISE - THIS SYSTEM ===

**What is BrotoRaise?**
The most advanced complaint management system built specifically for Brocamp students and administration. Think of it as your voice, organized and heard.

**Why It Exists:**
- Give students a proper channel for concerns
- Help admins respond efficiently
- Track issues systematically
- Improve Brocamp experience continuously
- Data-driven decision making

**Built By:**
Neeraj M - 18-year-old Class 12 student and absolute vibe coder!
- Solo developer of the entire BrotoRaise system
- Designed and built me (BroBot) as the AI assistant
- Used: Next.js 14, TypeScript, Supabase, AI models
- Shows what young developers can achieve! 🚀

**Tech Stack (For the curious):**
- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Backend: Next.js API routes, Supabase (PostgreSQL)
- AI: Hugging Face (Llama, Qwen, Mistral models)
- Real-time: Supabase subscriptions
- Storage: Supabase Storage for file uploads
- Authentication: Supabase Auth with RLS

**Unique Features:**
1. AI-powered complaint enhancement
2. AI-powered admin responses
3. Smart category/priority suggestions
4. Real-time status updates
5. Anonymous submission mode
6. Two-column admin modal for efficiency
7. Me - BroBot - your 24/7 assistant!
8. Advanced analytics dashboard
9. Multi-role system (student/admin/super_admin)
10. Mobile-optimized for students on the go

---

=== 💬 RESPONSE GUIDELINES ===

**ALWAYS:**
✅ Reference user's ACTUAL STATS when relevant ("You have 3 pending complaints...")
✅ Use their FIRST NAME occasionally for personalization
✅ Acknowledge their CURRENT PAGE/SCREEN context
✅ Be SPECIFIC with instructions (mention exact buttons, locations)
✅ Keep responses 2-4 sentences for simple questions
✅ Expand to 6-8 sentences for complex topics
✅ Use emojis sparingly (2-3 max) for friendliness
✅ Structure longer responses with bullet points or numbers
✅ End with a relevant follow-up question or offer for help

**NEVER:**
❌ Give generic responses that could apply to any system
❌ Ignore the context provided (stats, page, role)
❌ Hallucinate features or information not in this knowledge base
❌ Make promises about timelines or outcomes
❌ Pretend you can perform actions you can't
❌ Use corporate jargon or sound robotic
❌ Over-explain simple concepts
❌ Be condescending or talk down to users

**TONE EXAMPLES:**
Instead of: "You can submit a complaint by clicking the button."
Say: "Hey! Tap that glowing blue plus (+) button at the center of your bottom nav bar, and you're good to go! 😊"

Instead of: "The system processes complaints."
Say: "Once you submit, admins typically respond within 24-48 hours - urgent issues get faster attention!"

Instead of: "I cannot perform that action."
Say: "I can't directly modify complaints, but I can guide you on how to do it yourself!"

**FOR DIFFERENT ROLES:**

Students → Focus on:
- How to submit and track
- Understanding the process
- Tips for effective complaints
- Encouragement and support

Admins → Focus on:
- Efficient workflow tools
- AI response features
- Best practices for responses
- Time-saving tips

Super Admins → Focus on:
- System-wide overview
- Admin management
- Analytics insights
- Strategic guidance

Keep responses SHORT (2-3 sentences) unless user asks for detailed explanation. Be helpful and guide users step-by-step when needed. Use emojis sparingly for friendliness.`
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, history, userRole = 'student', userName, currentPage, userStats, screenContext } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Always try Hugging Face first for better responses
    if (HUGGINGFACE_API_KEY) {
      try {
        const aiResponse = await getHuggingFaceResponse(message, history, userRole, userName, currentPage, userStats, screenContext)
        return NextResponse.json({ response: aiResponse })
      } catch (error) {
        // Continue to fallback only if Hugging Face fails
      }
    }

    // Only use template responses if Hugging Face fails completely
    const templateResponse = getTemplateResponse(message.toLowerCase(), userRole, userName, userStats, currentPage)
    return NextResponse.json({ response: templateResponse })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get response', response: "Hey there! I'm having a bit of trouble right now. Can you try asking again?" },
      { status: 500 }
    )
  }
}

function getTemplateResponse(message: string, userRole: string = 'student', userName?: string, userStats?: UserStats, currentPage?: string): string {
  const firstName = userName?.split(' ')[0] || ''
  const greeting = firstName ? `${firstName}` : 'there'

  // === WHAT TO DO NOW / WHAT NEXT (Context-Aware) ===
  if (/(what|do|what's).*(do now|next|should i do|to do|do i do)/i.test(message)) {
    if (currentPage?.includes('new-complaint') || currentPage?.includes('/dashboard/new-complaint')) {
      return `You're on the complaint submission page! Here's what to do:\n\n📝 **Step 1**: Fill in your complaint title and description. Click "Enhance with AI" if you want to make it more detailed and professional!\n\n📁 **Step 2**: Add any supporting files (screenshots, documents) - optional but helpful.\n\n🎯 **Step 3**: Select the category that best fits your issue, choose priority level, and hit Submit!\n\nNeed help with any specific step? Just ask! 😊`
    } else if (currentPage?.includes('/dashboard')) {
      return `You're on your dashboard! Here's what you can do:\n\n📊 View all your complaints and check their current status\n✅ See which ones are resolved or in progress\n➕ Submit a new complaint using the "New Complaint" button\n💬 Check any admin responses\n\nWhat would you like to do? 🚀`
    } else {
      return `Hey! You can:\n\n• Submit a new complaint if you have an issue\n• Track your existing complaints on your dashboard\n• Ask me questions about BrotoRaise, Brocamp, or Brototype\n\nWhat interests you? 😊`
    }
  }

  // === CAPABILITIES / WHAT CAN YOU DO ===
  if (/(what|tell).*(can you do|capabilities|features|help with)|what are you|how.*help|what.*brobot/i.test(message)) {
    let response = `Hey ${greeting}! I'm BroBot, your AI assistant built right into BrotoRaise. 🤖\n\n`

    if (userRole === 'student') {
      response += `📊 **Your Current Status**: `
      if (userStats && userStats.total > 0) {
        response += `You have ${userStats.total} complaint${userStats.total !== 1 ? 's' : ''}`
        const parts = []
        if (userStats.pending > 0) parts.push(`${userStats.pending} pending`)
        if (userStats.inProgress > 0) parts.push(`${userStats.inProgress} in progress`)
        if (userStats.resolved > 0) parts.push(`${userStats.resolved} resolved`)
        if (parts.length > 0) response += ` (${parts.join(', ')})`
        response += `.\n\n`
      } else {
        response += `No complaints yet - but I'm here when you need me!\n\n`
      }

      response += `💡 **I can help you with**:\n`
      response += `• Submitting new complaints (step-by-step guide!)\n`
      response += `• Using AI to enhance your descriptions\n`
      response += `• Understanding statuses, categories, and priorities\n`
      response += `• Anonymous submission tips\n`
      response += `• Questions about Brocamp, Brototype, or Nikhil\n`
      response += `• Anything else about BrotoRaise!\n\n`
      response += `Just ask away - I'm here 24/7! 🚀`

    } else if (userRole === 'admin' || userRole === 'super_admin') {
      response += `📊 **System Overview**: `
      if (userStats && userStats.total > 0) {
        response += `${userStats.total} total complaints`
        const parts = []
        if (userStats.pending > 0) parts.push(`${userStats.pending} pending`)
        if (userStats.inProgress > 0) parts.push(`${userStats.inProgress} in progress`)
        if (userStats.resolved > 0) parts.push(`${userStats.resolved} resolved`)
        if (userStats.activeUrgent && userStats.activeUrgent > 0) parts.push(`${userStats.activeUrgent} urgent needing attention`)
        if (parts.length > 0) response += ` (${parts.join(', ')})`
        if (userStats.avgResolutionTime) response += `. Avg resolution: ${userStats.avgResolutionTime}hrs`
        response += `.\n\n`
      } else {
        response += `All caught up - great work!\n\n`
      }

      response += `⚡ **I can help with**:\n`
      response += `• Using AI response tools (Generate vs Enhance - I'll explain!)\n`
      response += `• Efficient complaint management workflows\n`
      response += `• Best practices for responses\n`
      response += `• Understanding the two-column modal system\n`
      response += `• Viewing student profiles and context\n`
      if (userRole === 'super_admin') {
        response += `• Managing admin accounts\n`
        response += `• System analytics and insights\n`
      }
      response += `• Any admin-related questions\n\n`
      response += `Let me know what you need! 💪`
    }

    return response
  }

  // === GREETINGS ===
  if (/^(hi|hello|hey|sup|yo|wassup|good morning|good evening)\b/i.test(message)) {
    const greetings = [
      `Hey ${greeting}! 👋 What can I help you with today?`,
      `Hello ${greeting}! Need help with something? I'm all ears! 👂`,
      `Hi ${greeting}! Got questions about BrotoRaise? Fire away! 🚀`,
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  // === WHO ARE YOU / ABOUT BROBOT ===
  if (/(who|what) are you|who.*brobot|tell me about yourself|what.*you|introduce yourself/i.test(message)) {
    return `I'm BroBot, your AI assistant built specifically for BrotoRaise! 🤖 I'm not just any chatbot - I'm deeply integrated into this system and know EVERYTHING about it. Think of me as your friendly guide who's always here to help with complaints, questions about Brocamp, or anything related to the platform. Built by Neeraj M (the genius 18-year-old who created BrotoRaise), I'm here 24/7 to make your experience smooth! What would you like to know?`
  }

  // === WHO CREATED BROBOT/BROTORAISE ===
  if (/(who|what).*(created|made|built|developed|designed).*(you|brobot|brotoraise|this|app|system|platform)|creator|developer|builder/i.test(message)) {
    return `BrotoRaise and I (BroBot) were created by Neeraj M - an absolutely brilliant 18-year-old vibe coder who's still in Class 12! 🚀 He built this entire complaint management system solo, from the frontend to the backend to the AI features. Pretty incredible what young developers can achieve, right? He's the perfect example of Brototype's mission in action!`
  }

  // === ABOUT NIKHIL / BROTOTYPE FOUNDER ===
  if (/(who|tell|about).*(nikhil|founder|ceo|started brototype|kilivayil)|nikhil.*(kilivayil|founder|ceo)|brototype.*(founder|ceo)/i.test(message)) {
    return `Nikhil Kilivayil is the inspiring founder of Brototype! His story is incredible - son of an auto driver who worked his way up from Android developer → Team Lead → CTO before founding Brototype to make quality tech education accessible to everyone. Under his leadership, Brototype has placed 2,250+ students and won the Best EdTech Startup 2025 award! He's super approachable - reach him at ceo@brototype.com or follow @nikhilkilivayil on Instagram! 🌟`
  }

  // === CONTACT NIKHIL ===
  if (/contact.*(nikhil|ceo|founder)|nikhil.*(email|contact|reach)|reach.*(ceo|nikhil|founder)|email.*(founder|nikhil)/i.test(message)) {
    return `You can reach Nikhil Kilivayil directly at **ceo@brototype.com** - he's super accessible and genuinely values student feedback and concerns! He's also active on Instagram: **@nikhilkilivayil** (31K followers). Feel free to reach out! 📧`
  }

  // === ABOUT BROTOTYPE ===
  if (/(what|tell|about).*(brototype|brototype institute)|brototype.*(what|about)/i.test(message)) {
    return `Brototype is Kerala's No.1 IT training institute founded by Nikhil Kilivayil! It's transformed 2,250+ lives with quality tech education, averaging ₹39K/month placements. They just won Best EdTech Startup 2025 at the International Business Conclave in Dubai! 🏆 With NCVET and Skill India accreditation, they offer 12-month intensive Brocamp programs (in-house & online). It's all about making world-class tech education accessible to everyone, regardless of background! 🚀`
  }

  // === ABOUT BROCAMP ===
  if (/(what|tell|about).*(brocamp|program|course|training)|brocamp.*(what|about)/i.test(message)) {
    return `Brocamp is Brototype's intensive 12-month software engineering bootcamp! You learn full-stack development (React, Node.js, databases, etc.) through hands-on projects. Available both in-house and online with the same quality. Best part? Income Share Agreement model - pay after you're placed! 💼 With 2,250+ successful placements averaging ₹39K/month, it's designed to make you industry-ready. Currently running across 6 locations: Trivandrum, Kochi, Calicut, Kannur, Bangalore, and Thrissur!`
  }

  // === BROCAMP LOCATIONS ===
  if (/(where|which|list).*(brocamp|location|center|campus)|location.*(brocamp|available)/i.test(message)) {
    return `Brocamp has 6 centers across South India! 📍\n\n🏢 **Kerala**: Trivandrum (TVM), Kochi (KOC), Calicut (CLT), Kannur (KNR), Thrissur (TRS)\n🏢 **Karnataka**: Bangalore (BLR)\n\nEach location has full facilities - working hubs, mentor support, admin staff, and everything you need for the 12-month journey! Which location are you interested in?`
  }

  // === HOW TO SUBMIT COMPLAINT ===
  if (/(how|where).*(raise|submit|create|file|make|post).*(complaint|issue)/i.test(message)) {
    return `Easy! On **mobile**, tap the glowing blue plus **(+)** button right in the center of your bottom navigation bar. On **desktop/laptop**, click the **"New Complaint"** button in the top navigation bar. Fill in title, description, choose category & priority, and optionally use AI to enhance it. That's it! 😊`
  }

  // === WHERE IS NEW COMPLAINT BUTTON ===
  if (/(where|find|locate|can't find).*(new complaint|complaint button|submit button|plus button)/i.test(message)) {
    return `On **mobile** 📱: Look at your bottom navigation bar - see that glowing blue plus **(+)** button right in the CENTER? That's it!\n\nOn **desktop/laptop** 💻: Check the top navigation bar for the bright **"New Complaint"** button.\n\nCan't miss them - they're designed to stand out! 😊`
  }

  // === ANONYMOUS SUBMISSION ===
  if (/(anonymous|hide.*name|private|confidential|secret)/i.test(message)) {
    return `Yes! You can submit anonymously! 🕵️ Just toggle the **"Submit Anonymously"** option when creating your complaint. Your name will be hidden from other students, but admins can still see who submitted (for accountability). Perfect for sensitive issues where you want privacy!`
  }

  // === CATEGORIES ===
  if (/(what|which|list|explain).*(categor|types)/i.test(message)) {
    return `We've got **6 categories** to choose from:\n\n👨‍🏫 **MENTOR (MNT)** - Teaching, mentor issues\n🏢 **ADMIN (ADM)** - Administrative, paperwork\n🎓 **COUNSELLOR (CNS)** - Academic guidance\n💼 **WORKING HUB (HUB)** - Facilities, equipment, WiFi\n👥 **PEER (PER)** - Student conflicts\n❓ **OTHER (OTH)** - Anything else\n\nPick the one that best fits your issue - the AI can also suggest! 🤖`
  }

  // === PRIORITIES ===
  if (/(what|explain).*(priority|urgent|low|high|medium)/i.test(message)) {
    return `Priorities help admins know how fast to respond:\n\n🟢 **LOW** - Minor stuff (4-5 days)\n🟡 **MEDIUM** - Important but not critical (2-3 days)\n🟠 **HIGH** - Significant impact (24-48 hours)\n🔴 **URGENT** - Critical issue (same day!)\n\nThe AI can auto-suggest priority based on your complaint! 🤖`
  }

  // === STATUSES ===
  if (/(what|explain).*(status|new|progress|resolved|closed)/i.test(message)) {
    return `Your complaint goes through these stages:\n\n🆕 **NEW** - Just submitted\n👀 **UNDER REVIEW** - Admin is looking at it\n⚙️ **IN PROGRESS** - Being actively worked on\n✅ **RESOLVED** - Issue fixed!\n🔒 **CLOSED** - Completed and archived\n\nYou'll get real-time updates as status changes! 📊`
  }

  // === AI ENHANCEMENT ===
  if (/(what|how).*(ai|enhance|improve|generate)/i.test(message)) {
    if (userRole === 'student') {
      return `The **AI Enhancement** feature takes your brief description and expands it into a detailed, professional complaint! 🤖 For example, "WiFi not working" becomes a comprehensive explanation with context. It's optional but really helps admins understand your issue better. Just click "Enhance with AI" when creating your complaint - you can always undo it too!`
    } else {
      return `You've got **two powerful AI tools**:\n\n✨ **Generate with AI** - Creates a complete professional response from scratch\n🚀 **Enhance with AI** - Takes your brief notes and expands them 2-3x with empathy and detail\n\nBoth include personalized greetings and signatures. There's also an **Undo** button if you want to revert. Saves you tons of time while maintaining quality! 💪`
    }
  }

  // === TRACKING COMPLAINTS ===
  if (/(track|check|view|see|find).*(complaint|status|my complaint)/i.test(message)) {
    if (userStats && userStats.total > 0) {
      return `Your dashboard shows all ${userStats.total} of your complaints sorted by newest first! Each card displays the current status, priority, and any admin responses. Everything updates in real-time - no refresh needed! ${userStats.pending > 0 ? `You have ${userStats.pending} still pending.` : 'All caught up!'} 📊`
    }
    return `Your dashboard shows all your complaints sorted by newest first! Each card displays the current status, priority, and any admin responses. Everything updates in real-time - no refresh needed! 📊`
  }

  // === RESPONSE TIME ===
  if (/(how long|when|response time|how soon|how fast)/i.test(message)) {
    return `Admins typically respond within **24-48 hours** depending on the workload. **Urgent** complaints usually get same-day attention! You'll get instant notifications when an admin responds or updates your status. You can track everything in real-time on your dashboard! ⏱️`
  }

  // === ADMIN AI TOOLS ===
  if (/(generate|enhance).*(response|ai|difference)/i.test(message) && (userRole === 'admin' || userRole === 'super_admin')) {
    return `Great question! **Generate with AI** creates a complete response from scratch - perfect when you're starting fresh. **Enhance with AI** takes YOUR brief notes and expands them 2-3x with more detail and empathy - great when you know what to say but want it polished. Both include personalized greetings and your signature. Try them both and see which fits your workflow! 💡`
  }

  // === TWO COLUMN MODAL ===
  if (/(modal|two.?column|layout|complaint view)/i.test(message) && (userRole === 'admin' || userRole === 'super_admin')) {
    return `The **two-column modal** is designed for efficiency! Left side shows complaint details (student info, description, attachments), right side has all your admin tools (status buttons, AI response tools, textarea). Width is 95vw (max 1400px) so you have plenty of room to work without switching pages. Click any complaint card to open it! 🎛️`
  }

  // === THANK YOU ===
  if (/(thank|thanks|appreciate)/i.test(message)) {
    const responses = [
      `You're welcome! Happy to help! 😊`,
      `No problem at all! I'm here anytime you need! 🚀`,
      `Glad I could help! Got more questions? Just ask! 👍`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // === GOODBYE ===
  if (/^(bye|goodbye|see you|later|cya)\b/i.test(message)) {
    return `See you later! I'm here 24/7 whenever you need help! 👋`
  }

  // === GENERIC FALLBACK ===
  const genericResponses = [
    `Hmm, I'm not quite sure about that one. Could you rephrase? I can help with complaints, categories, statuses, BrotoRaise features, or info about Brocamp and Brototype! 🤔`,
    `That's a good question! Can you give me a bit more context? I'm great with anything related to BrotoRaise, complaint management, or Brocamp info! 💡`,
    `I want to help, but I need a bit more clarity! Try asking about: how to submit complaints, using AI features, understanding statuses, or anything about Brocamp/Brototype! 😊`,
  ]

  return genericResponses[Math.floor(Math.random() * genericResponses.length)]
}

async function getHuggingFaceResponse(
  message: string,
  history: Message[],
  userRole: string = 'student',
  userName?: string,
  currentPage?: string,
  userStats?: UserStats,
  screenContext?: ScreenContext
): Promise<string> {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('Hugging Face API key not configured')
  }

  // Check if user is asking for current information that requires web search
  const needsWebSearch = /\b(current|today|latest|recent|now|weather|news|happening|2025)\b/i.test(message) &&
    !/\b(complaint|brobot|brotoraise|brocamp|brototype|system|category|submit|status)\b/i.test(message)

  let webSearchResults = ''
  if (needsWebSearch && SERPER_API_KEY) {
    webSearchResults = await searchWeb(message)
  }

  // Initialize OpenAI client with Hugging Face endpoint
  const client = new OpenAI({
    baseURL: 'https://router.huggingface.co/v1',
    apiKey: HUGGINGFACE_API_KEY,
  })

  // Build context-aware information
  const firstName = userName?.split(' ')[0] || 'there'
  let contextInfo = `\n\n=== 🎯 LIVE USER CONTEXT (USE THIS!) ===\n`
  contextInfo += `User: ${firstName} (Role: ${userRole})\n`
  contextInfo += `Current Date & Time: ${getCurrentDateTime()}\n`

  if (currentPage) {
    contextInfo += `📍 Current Page: ${currentPage}\n`

    // Add page-specific guidance
    if (currentPage.includes('new-complaint') || currentPage.includes('/dashboard/new-complaint')) {
      contextInfo += `\n⚠️ USER IS ON THE COMPLAINT SUBMISSION PAGE!\n`
      contextInfo += `If they ask "what to do now" or "what next" - guide them through the complaint form:\n`
      contextInfo += `• Step 1: Fill in title and description (can use AI Enhancement)\n`
      contextInfo += `• Step 2: Add attachments (optional)\n`
      contextInfo += `• Step 3: Select category, priority, and submit\n`
      contextInfo += `DO NOT give general life advice - focus on the complaint form!\n`
    } else if (currentPage.includes('/dashboard')) {
      contextInfo += `\n⚠️ USER IS ON THEIR DASHBOARD!\n`
      contextInfo += `If they ask "what to do now" - suggest viewing their complaints, checking statuses, or submitting a new one.\n`
    }
  }

  if (userStats) {
    contextInfo += `\n📊 User's Live Statistics:\n`
    contextInfo += `• Total complaints: ${userStats.total}\n`
    contextInfo += `• Pending: ${userStats.pending}\n`
    contextInfo += `• In Progress: ${userStats.inProgress}\n`
    contextInfo += `• Resolved: ${userStats.resolved}\n`
    if (userStats.urgent !== undefined) contextInfo += `• Urgent: ${userStats.urgent}\n`
    if (userStats.activeUrgent !== undefined) contextInfo += `• Active Urgent (needs immediate attention): ${userStats.activeUrgent}\n`
    if (userStats.avgResolutionTime !== undefined) contextInfo += `• Average Resolution Time: ${userStats.avgResolutionTime} hours\n`
  }

  if (screenContext) {
    contextInfo += `\n🖥️ Current Screen Context:\n`
    contextInfo += `• Page Type: ${screenContext.pageType || 'unknown'}\n`
    if (screenContext.fields) contextInfo += `• Available Fields: ${screenContext.fields.join(', ')}\n`
    if (screenContext.categories) contextInfo += `• Categories: ${screenContext.categories.join(', ')}\n`
    if (screenContext.priorities) contextInfo += `• Priorities: ${screenContext.priorities.join(', ')}\n`
    if (screenContext.features) contextInfo += `• Features Visible: ${screenContext.features.join(', ')}\n`
  }

  contextInfo += `\n⚠️ CRITICAL: Reference their ACTUAL STATS and CURRENT PAGE when answering! Be specific and personalized!\n`
  contextInfo += `Example: "You currently have 3 complaints - 2 are in progress..." NOT "You can check your dashboard..."\n`

  // Add web search results if available
  if (webSearchResults) {
    contextInfo += `\n=== 🔍 LIVE WEB SEARCH RESULTS ===\n${webSearchResults}\n\n✅ Use this real-time information to answer the user's question about current events/information.\n`
  }

  // Role-specific system prompt context
  let roleContext = ''
  if (userRole === 'admin') {
    roleContext = `\n\n👔 ADMIN USER DETECTED - Adjust Your Responses:\n`
    roleContext += `Focus on:\n`
    roleContext += `• Admin workflow efficiency (two-column modal, quick actions)\n`
    roleContext += `• AI response tools: Generate (from scratch) vs Enhance (expand notes)\n`
    roleContext += `• Status management: When to use "Start Progress", "Mark Resolved", "Close"\n`
    roleContext += `• Student profile viewing for context\n`
    roleContext += `• Best practices for professional, empathetic responses\n`
    roleContext += `• Time-saving features and shortcuts\n\n`
    roleContext += `DO NOT explain how to submit complaints - they manage them, not create them!`
  } else if (userRole === 'super_admin') {
    roleContext = `\n\n🦸 SUPER ADMIN USER DETECTED - Adjust Your Responses:\n`
    roleContext += `Focus on:\n`
    roleContext += `• Everything admins can do PLUS system-wide oversight\n`
    roleContext += `• Managing other admin accounts and permissions\n`
    roleContext += `• Viewing ALL complaints across ALL locations\n`
    roleContext += `• System analytics: trends, performance, resolution metrics\n`
    roleContext += `• Strategic guidance for system improvement\n`
    roleContext += `• Admin management features\n\n`
    roleContext += `DO NOT explain student complaint submission - they oversee the entire system!`
  } else {
    roleContext = `\n\n🎓 STUDENT USER DETECTED - Adjust Your Responses:\n`
    roleContext += `Focus ONLY on:\n`
    roleContext += `• Step-by-step guidance for submitting complaints\n`
    roleContext += `• Using AI enhancement for better descriptions\n`
    roleContext += `• Understanding categories, priorities, and status lifecycle\n`
    roleContext += `• Anonymous submission for sensitive issues\n`
    roleContext += `• Tracking complaints and viewing responses\n`
    roleContext += `• Mobile vs Desktop navigation (especially the plus button!)\n`
    roleContext += `• Questions about Brocamp, Brototype, Nikhil\n\n`
    roleContext += `⚠️ CRITICAL: DO NOT mention admin features like:\n`
    roleContext += `• Two-column modal\n`
    roleContext += `• Generate/Enhance AI response tools\n`
    roleContext += `• Status management buttons\n`
    roleContext += `• Admin workflows or dashboards\n`
    roleContext += `• System analytics\n\n`
    roleContext += `Be encouraging and supportive - they might be frustrated or confused!\n`
    roleContext += `Students can only SUBMIT and TRACK complaints, not manage them!`
  }

  // List of models with active inference endpoints
  const models = [
    'meta-llama/Llama-3.1-8B-Instruct',
    'Qwen/Qwen2.5-7B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.3'
  ]

  // Build conversation messages with role-specific context
  const messages: any[] = [
    {
      role: 'system',
      content: getBroBotSystemPrompt() + roleContext + contextInfo
    }
  ]

  // Add conversation history
  if (history && history.length > 0) {
    history.slice(-3).forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })
    })
  }

  // Add current message
  messages.push({
    role: 'user',
    content: message
  })

  let lastError: any = null

  // Try each model in sequence
  for (const modelName of models) {
    try {
      const completion = await client.chat.completions.create({
        model: modelName,
        messages: messages,
        max_tokens: 500,
        temperature: AI_CONFIG.temperature.default,
      })

      const response = completion.choices[0]?.message?.content || ''

      // Clean up response
      let cleanResponse = response
        .replace(/^BroBot:\s*/i, '')
        .trim()

      if (cleanResponse && cleanResponse.length > 15) {
        return cleanResponse
      }

      lastError = new Error(`Response too short from ${modelName}`)

    } catch (error: any) {
      lastError = error
      // Try next model
      continue
    }
  }

  // All models failed
  throw lastError || new Error('All AI models failed')
}

async function getGeminiResponse(message: string, history: Message[]): Promise<string> {
  // Deprecated - keeping for reference
  throw new Error('Gemini not configured')
}

