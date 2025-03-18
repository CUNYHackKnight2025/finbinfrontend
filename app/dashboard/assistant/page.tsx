"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { apiClient } from "@/lib/api-client"
import { Send, Bot, User } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Demo AI responses for common financial questions
const demoResponses: Record<string, string> = {
  default:
    "I'm your FINBIN AI assistant. I can help you with financial advice, budgeting tips, and analyzing your spending patterns.",
  save: "Based on your current spending patterns, you could save an additional $250 per month by reducing your subscription services and dining out expenses. Would you like me to suggest a savings plan?",
  invest:
    "With your current risk profile and financial goals, I would recommend allocating 60% to index funds, 30% to bonds, and 10% to individual stocks. Would you like more specific investment recommendations?",
  debt: "I recommend prioritizing paying off your high-interest debt first. Based on your current income and expenses, you could be debt-free in approximately 18 months by allocating an additional $300 per month to debt repayment.",
  budget:
    "Your top spending categories last month were housing (35%), food (20%), and transportation (15%). Your food spending is 25% higher than the recommended amount for your income level. Would you like suggestions to reduce this expense?",
  emergency:
    "Financial experts recommend having 3-6 months of expenses saved in an emergency fund. Based on your monthly expenses of $2,400, you should aim for $7,200-$14,400 in your emergency fund.",
  retirement:
    "Based on your current savings rate and retirement goals, you're on track to reach your target retirement savings by age 67. Increasing your monthly contributions by just $100 could help you retire 2 years earlier.",
  credit:
    "Your simulated credit score is in the 'good' range. To improve it, focus on making all payments on time, reducing your credit utilization ratio to below 30%, and avoiding opening too many new accounts.",
  tax: "Based on your income and deductions, you might be able to save approximately $1,200 in taxes by maximizing your retirement contributions and taking advantage of available tax credits.",
  insurance:
    "Your current insurance coverage appears adequate, but you might consider increasing your liability coverage and adding an umbrella policy for better protection of your growing assets.",
  mortgage:
    "With current interest rates, refinancing your mortgage could save you approximately $150 per month. However, you should consider the closing costs and how long you plan to stay in your home.",
  car: "Based on your financial situation, you could comfortably afford a car payment of up to $350 per month. Remember to factor in insurance, maintenance, and fuel costs when budgeting for a vehicle purchase.",
  college:
    "For your children's education fund, consider a 529 plan which offers tax advantages. Starting with $200 monthly contributions now could grow to approximately $58,000 in 18 years, assuming a 6% annual return.",
  wedding:
    "For a wedding budget, the average cost is around $28,000, but you can have a wonderful celebration for much less by prioritizing what matters most to you and being creative with venue and catering options.",
  vacation:
    "Based on your savings rate, you could save enough for a $3,000 vacation in about 6 months by setting aside $500 monthly in your 'Vacation' savings bucket.",
  house:
    "To save for a house down payment, aim for at least 20% of the home's value to avoid private mortgage insurance. For a $300,000 home, that's $60,000. At your current savings rate, this would take approximately 4 years.",
  help: "I can help with various financial topics including budgeting, saving, investing, debt management, retirement planning, and more. Just ask me a specific question about your finances!",
}

// Function to get a demo response based on keywords in the question
function getDemoResponse(question: string): string {
  const lowerQuestion = question.toLowerCase()

  // Check for keywords and return appropriate responses
  if (lowerQuestion.includes("save") || lowerQuestion.includes("saving")) {
    return demoResponses.save
  } else if (lowerQuestion.includes("invest") || lowerQuestion.includes("investment")) {
    return demoResponses.invest
  } else if (lowerQuestion.includes("debt") || lowerQuestion.includes("loan")) {
    return demoResponses.debt
  } else if (lowerQuestion.includes("budget") || lowerQuestion.includes("spending")) {
    return demoResponses.budget
  } else if (lowerQuestion.includes("emergency")) {
    return demoResponses.emergency
  } else if (lowerQuestion.includes("retire") || lowerQuestion.includes("retirement")) {
    return demoResponses.retirement
  } else if (lowerQuestion.includes("credit") || lowerQuestion.includes("score")) {
    return demoResponses.credit
  } else if (lowerQuestion.includes("tax")) {
    return demoResponses.tax
  } else if (lowerQuestion.includes("insurance")) {
    return demoResponses.insurance
  } else if (lowerQuestion.includes("mortgage") || lowerQuestion.includes("refinance")) {
    return demoResponses.mortgage
  } else if (lowerQuestion.includes("car") || lowerQuestion.includes("vehicle")) {
    return demoResponses.car
  } else if (lowerQuestion.includes("college") || lowerQuestion.includes("education")) {
    return demoResponses.college
  } else if (lowerQuestion.includes("wedding") || lowerQuestion.includes("marry")) {
    return demoResponses.wedding
  } else if (lowerQuestion.includes("vacation") || lowerQuestion.includes("travel")) {
    return demoResponses.vacation
  } else if (lowerQuestion.includes("house") || lowerQuestion.includes("home")) {
    return demoResponses.house
  } else if (lowerQuestion.includes("help") || lowerQuestion.includes("what can you do")) {
    return demoResponses.help
  }

  // Default response for other questions
  return `Based on your financial profile, I'd recommend focusing on building your emergency fund first, then paying down high-interest debt. Your question about "${question}" is important, and I'd be happy to provide more specific advice if you could provide more details.`
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your FINBIN AI assistant. How can I help you with your finances today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if this is a demo token
    const token = localStorage.getItem("token")
    setIsDemoMode(token?.startsWith("dummy-token-") || false)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Get user info from localStorage
      const userString = localStorage.getItem("user")
      if (!userString) {
        throw new Error("User information not found")
      }

      const user = JSON.parse(userString)

      let response: string

      if (isDemoMode) {
        // Use demo responses for demo mode
        response = getDemoResponse(input)

        // Add a slight delay to simulate processing
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } else {
        // Real API call for non-demo mode
        const data = await apiClient<{ response: string }>(`/api/ai-chat/${user.id}`, {
          method: "POST",
          body: JSON.stringify({ question: input }),
        })
        response = data.response
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from assistant",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <h1 className="text-3xl font-bold mb-6">AI Financial Assistant</h1>

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Chat with FINBIN AI</CardTitle>
            <CardDescription>Ask questions about your finances, get recommendations, or seek advice</CardDescription>
            {isDemoMode && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-900/20 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <span className="font-medium">Demo Mode:</span> Try asking about saving money, investing, debt
                  management, or budgeting.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}

