'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, Minimize2, Maximize2, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { UserStats, ScreenContext } from '@/lib/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface BroBotChatProps {
  userAvatarUrl?: string | null
  userRole?: 'student' | 'admin' | 'super_admin'
  userName?: string | null
  currentPage?: string
  userStats?: UserStats
  screenContext?: ScreenContext
}

export function BroBotChat({ userAvatarUrl, userRole = 'student', userName, currentPage, userStats, screenContext }: BroBotChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Generate a random initial greeting based on user role
  const getInitialGreeting = () => {
    const firstName = userName?.split(' ')[0] || ''
    const greeting = firstName ? `${firstName}! ` : ''

    if (userRole === 'admin') {
      const adminGreetings = [
        `Hey there${firstName ? ', ' + firstName : ''}! 👋 I'm BroBot, your admin assistant for BrotoRaise. Need help managing complaints, using AI features, or understanding admin workflows? I'm here for you!`,
        `Hello${firstName ? ', ' + firstName : ''}! 😊 I'm BroBot, ready to help you with admin tasks. Whether it's responding to complaints, using AI assistance, or managing submissions, feel free to ask!`,
        `Hi${firstName ? ', ' + firstName : ''}! 🤖 I'm BroBot, your AI assistant for admin work. Got questions about responding to complaints, student profiles, or admin features? I'm here to help!`,
      ]
      return adminGreetings[Math.floor(Math.random() * adminGreetings.length)]
    }

    if (userRole === 'super_admin') {
      const superAdminGreetings = [
        `Welcome${firstName ? ', ' + firstName : ''}! ✨ I'm BroBot, your super admin assistant. Need help with system management, admin oversight, or analytics? I'm here for you!`,
        `Hey there${firstName ? ', ' + firstName : ''}! 🚀 I'm BroBot, ready to help with super admin tasks. Whether it's managing admins, viewing all complaints, or system analytics, just ask!`,
        `Hello${firstName ? ', ' + firstName : ''}! 🌟 I'm BroBot, your AI assistant for super admin duties. Got questions about system features, admin management, or complaint oversight? I'm here to help!`,
      ]
      return superAdminGreetings[Math.floor(Math.random() * superAdminGreetings.length)]
    }

    // Student greetings (default)
    const studentGreetings = [
      `Hey there${firstName ? ', ' + firstName : ''}! 👋 I'm BroBot, your friendly guide here at BrotoRaise. Need help raising a complaint, understanding the process, or just have a quick question? I'm here for you!`,
      `Hello${firstName ? ', ' + firstName : ''}! 😊 I'm BroBot, ready to help you with anything related to BrotoRaise. Whether it's raising a complaint or just understanding how things work, feel free to ask!`,
      `Hi${firstName ? ', ' + firstName : ''}! 🤖 I'm BroBot, your AI assistant for BrotoRaise. Got questions about complaints, categories, or how the system works? I'm here to help!`,
      `Welcome${firstName ? ', ' + firstName : ''}! ✨ I'm BroBot, here to make your BrotoRaise experience smooth. Need guidance on raising complaints or tracking submissions? Just ask!`,
      `Hey${firstName ? ', ' + firstName : ''}! 🚀 I'm BroBot, your helpful companion at BrotoRaise. Whether you need to file a complaint or have questions about the process, I've got you covered!`,
      `Greetings${firstName ? ', ' + firstName : ''}! 🌟 I'm BroBot, your personal assistant for BrotoRaise. Need help with complaints, want to know about features, or have any questions? Let's chat!`,
    ]
    return studentGreetings[Math.floor(Math.random() * studentGreetings.length)]
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: getInitialGreeting(),
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quickQuestions, setQuickQuestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Generate role-specific quick questions on mount
  useEffect(() => {
    const generateQuickQuestions = async () => {
      try {
        const response = await fetch('/api/brobot/quick-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userRole })
        })
        const data = await response.json()
        if (data.questions && data.questions.length > 0) {
          setQuickQuestions(data.questions)
        } else {
          // Fallback to role-specific defaults
          setQuickQuestions(getDefaultQuestions())
        }
      } catch (error) {

        setQuickQuestions(getDefaultQuestions())
      }
    }

    const getDefaultQuestions = () => {
      if (userRole === 'admin') {
        return [
          "How do I use AI to respond to complaints?",
          "What's the difference between Generate and Enhance?",
          "How do I view student profiles?",
          "How do I change complaint status?",
        ]
      } else if (userRole === 'super_admin') {
        return [
          "How do I manage admins?",
          "How can I view system analytics?",
          "What admin actions can I perform?",
          "How do I access all complaints?",
        ]
      } else {
        return [
          "How do I raise a complaint?",
          "What categories are available?",
          "Can I submit anonymously?",
          "How long until I get a response?",
        ]
      }
    }

    generateQuickQuestions()
  }, [userRole])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/brobot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          history: messages.slice(-5), // Send last 5 messages for context
          userRole: userRole, // Send user role for context-aware responses
          userName: userName, // Send user name for personalized responses
          currentPage: currentPage, // Send current page for context-aware help
          userStats: userStats, // Send user statistics
          screenContext: screenContext // Send screen context data
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "Sorry bro, I'm having trouble responding right now. Try again in a moment!",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! Something went wrong on my end. Can you try asking that again?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open BroBot chat assistant"
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full p-4 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        <Bot className="h-7 w-7 md:h-6 md:w-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 flex flex-col",
        isMinimized ? "w-72 md:w-80 h-16" : "w-[95vw] md:w-96 h-[70vh] md:h-[600px] max-h-[calc(100vh-8rem)] md:max-h-[calc(100vh-3rem)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="h-6 w-6 text-white" />
            <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-green-400 rounded-full border-2 border-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-white">BroBot</h3>
            <p className="text-xs text-blue-100">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5",
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white/5 text-white rounded-bl-sm'
                  )}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="text-sm prose prose-invert prose-sm max-w-none
                      prose-p:leading-relaxed prose-p:my-2 prose-p:first:mt-0 prose-p:last:mb-0
                      prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-2
                      prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                      prose-strong:text-white prose-strong:font-bold
                      prose-em:text-gray-300 prose-em:italic
                      prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
                      prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-4
                      prose-li:my-1
                      prose-code:text-blue-300 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                      prose-pre:bg-white/10 prose-pre:p-3 prose-pre:rounded-lg prose-pre:my-2
                      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-gray-300
                      prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-300"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    {userAvatarUrl ? (
                      <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-blue-500/30">
                        <Image
                          src={userAvatarUrl}
                          alt="Your avatar"
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center border-2 border-gray-500/30">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl rounded-bl-sm px-4 py-2.5">
                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && quickQuestions.length > 0 && (
            <div className="px-4 pb-3 flex-shrink-0">
              <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question)
                      // Auto-send the question
                      const userMessage: Message = {
                        id: Date.now().toString(),
                        role: 'user',
                        content: question,
                        timestamp: new Date()
                      }
                      setMessages(prev => [...prev, userMessage])
                      setIsLoading(true)

                      fetch('/api/brobot/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          message: question,
                          history: messages.slice(-5),
                          userRole: userRole,
                          userName: userName,
                          currentPage: currentPage,
                          userStats: userStats,
                          screenContext: screenContext
                        })
                      })
                        .then(res => res.json())
                        .then(data => {
                          const assistantMessage: Message = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: data.response || 'Sorry, I encountered an error.',
                            timestamp: new Date()
                          }
                          setMessages(prev => [...prev, assistantMessage])
                        })
                        .catch(error => {

                          const errorMessage: Message = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: 'Sorry, I encountered an error. Please try again.',
                            timestamp: new Date()
                          }
                          setMessages(prev => [...prev, errorMessage])
                        })
                        .finally(() => {
                          setIsLoading(false)
                          setInput('')
                        })
                    }}
                    className="text-xs text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-gray-300 hover:text-white transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
