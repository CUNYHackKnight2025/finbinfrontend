"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { apiClient } from "@/lib/api-client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

// Define the recommendation type
interface Recommendation {
  id: number
  category: string
  title: string
  description: string
  potentialImpact: string
  difficulty: string
}

export default function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [incomeAnalysis, setIncomeAnalysis] = useState<any>(null)
  const [expenseAnalysis, setExpenseAnalysis] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Check if this is a demo token
    const token = localStorage.getItem("token")
    setIsDemoMode(token?.startsWith("dummy-token-") || false)

    async function fetchData() {
      try {
        // Get user info from localStorage
        const userString = localStorage.getItem("user")
        if (!userString) {
          throw new Error("User information not found")
        }

        const user = JSON.parse(userString)

        // Fetch recommendations from the API
        try {
          const recommendationsData = await apiClient<Recommendation[]>(`/api/ai-analysis/recommendations/${user.id}`)
          // Ensure recommendations is an array
          setRecommendations(Array.isArray(recommendationsData) ? recommendationsData : [])
        } catch (error) {
          console.error("Failed to load recommendations:", error)
          setRecommendations([])
        }

        // Fetch income analysis
        try {
          const incomeData = await apiClient(`/api/ai-analysis/income/${user.id}`)
          setIncomeAnalysis(incomeData)
        } catch (error) {
          console.error("Failed to load income analysis:", error)
          // Set default values for demo mode
          if (isDemoMode) {
            setIncomeAnalysis({
              summary:
                "Your income has increased by 15.5% over the past 6 months. The main contributor to this growth was your salary increase in March and additional investment income in May and June.",
              diversification:
                "Your income is primarily from your salary (92%). Consider diversifying your income sources by exploring side income opportunities or increasing your investment income.",
            })
          }
        }

        // Fetch expense analysis
        try {
          const expenseData = await apiClient(`/api/ai-analysis/expenses/${user.id}`)
          setExpenseAnalysis(expenseData)
        } catch (error) {
          console.error("Failed to load expense analysis:", error)
          // Set default values for demo mode
          if (isDemoMode) {
            setExpenseAnalysis({
              summary:
                "Housing represents 48% of your monthly expenses, which is slightly above the recommended 30-35%. Your food expenses are within the recommended range, but entertainment expenses have increased by 25% in the last month.",
              potentialSavings:
                "You could save approximately $250 per month by reducing your subscription services ($50), optimizing your utility usage ($75), and reducing dining out expenses ($125).",
            })
          }
        }

        // Fetch summary
        try {
          const summaryData = await apiClient(`/api/ai-analysis/summary/${user.id}`)
          setSummary(summaryData)
        } catch (error) {
          console.error("Failed to load summary:", error)
          // Set default values for demo mode
          if (isDemoMode) {
            setSummary({
              savingsRate:
                "Your current savings rate is 18% of your income, which is above the recommended 15%. You've increased your savings rate by 5% over the past 6 months, which is excellent progress.",
              savingsGoals:
                "At your current savings rate, you'll reach your Emergency Fund goal in approximately 10 months. Your Vacation fund is 50% complete and on track to be fully funded by your deadline.",
            })
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load analysis data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isDemoMode])

  // Mock data for charts
  const incomeData = [
    { name: "Jan", amount: 4500 },
    { name: "Feb", amount: 4500 },
    { name: "Mar", amount: 4800 },
    { name: "Apr", amount: 4500 },
    { name: "May", amount: 5000 },
    { name: "Jun", amount: 5200 },
  ]

  const expenseData = [
    { name: "Housing", value: 1200, color: "#8884d8" },
    { name: "Food", value: 400, color: "#82ca9d" },
    { name: "Transportation", value: 150, color: "#ffc658" },
    { name: "Utilities", value: 200, color: "#ff8042" },
    { name: "Insurance", value: 150, color: "#0088fe" },
    { name: "Entertainment", value: 100, color: "#00C49F" },
    { name: "Other", value: 300, color: "#FFBB28" },
  ]

  const savingsData = [
    { name: "Jan", amount: 500 },
    { name: "Feb", amount: 600 },
    { name: "Mar", amount: 400 },
    { name: "Apr", amount: 700 },
    { name: "May", amount: 800 },
    { name: "Jun", amount: 900 },
  ]

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading analysis...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Financial Analysis</h1>

        {isDemoMode && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <span className="font-medium">Demo Mode:</span> This page displays simulated financial analysis data. In a
              real account, this would be based on your actual financial information.
            </p>
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                  <CardDescription>Personalized financial insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.length > 0 ? (
                      recommendations.map((rec) => (
                        <div key={rec.id} className="border-l-4 border-primary pl-4 py-2">
                          <h3 className="font-medium">{rec.title}</h3>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                          <div className="flex justify-between mt-2 text-xs">
                            <span className="text-muted-foreground">
                              Impact:{" "}
                              <span
                                className={`font-medium ${rec.potentialImpact === "High" ? "text-green-500" : rec.potentialImpact === "Medium" ? "text-yellow-500" : "text-blue-500"}`}
                              >
                                {rec.potentialImpact}
                              </span>
                            </span>
                            <span className="text-muted-foreground">
                              Difficulty:{" "}
                              <span
                                className={`font-medium ${rec.difficulty === "Low" ? "text-green-500" : rec.difficulty === "Medium" ? "text-yellow-500" : "text-red-500"}`}
                              >
                                {rec.difficulty}
                              </span>
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No recommendations available at this time.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Health Score</CardTitle>
                  <CardDescription>Based on your financial data</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold">72</div>
                        <div className="text-sm text-muted-foreground">Good</div>
                      </div>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="10"
                        strokeDasharray="282.7"
                        strokeDashoffset="79.2"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Savings Rate</span>
                      <span className="font-medium">18% (Good)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Debt-to-Income</span>
                      <span className="font-medium">28% (Good)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Emergency Fund</span>
                      <span className="font-medium">2 months (Needs Improvement)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Investment Allocation</span>
                      <span className="font-medium">15% (Good)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle>Income Trends</CardTitle>
                <CardDescription>Your income over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, "Income"]} />
                      <Bar dataKey="amount" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Income Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      {incomeAnalysis?.summary ||
                        "Your income has increased by 15.5% over the past 6 months. The main contributor to this growth was your salary increase in March and additional investment income in May and June."}
                    </p>
                  </div>
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Income Diversification</h3>
                    <p className="text-sm text-muted-foreground">
                      {incomeAnalysis?.diversification ||
                        "Your income is primarily from your salary (92%). Consider diversifying your income sources by exploring side income opportunities or increasing your investment income."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Your spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Expense Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      {expenseAnalysis?.summary ||
                        "Housing represents 48% of your monthly expenses, which is slightly above the recommended 30-35%. Your food expenses are within the recommended range, but entertainment expenses have increased by 25% in the last month."}
                    </p>
                  </div>
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Potential Savings</h3>
                    <p className="text-sm text-muted-foreground">
                      {expenseAnalysis?.potentialSavings ||
                        "You could save approximately $250 per month by reducing your subscription services ($50), optimizing your utility usage ($75), and reducing dining out expenses ($125)."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="savings">
            <Card>
              <CardHeader>
                <CardTitle>Savings Growth</CardTitle>
                <CardDescription>Your savings over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={savingsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, "Savings"]} />
                      <Bar dataKey="amount" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Savings Rate</h3>
                    <p className="text-sm text-muted-foreground">
                      {summary?.savingsRate ||
                        "Your current savings rate is 18% of your income, which is above the recommended 15%. You've increased your savings rate by 5% over the past 6 months, which is excellent progress."}
                    </p>
                  </div>
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Savings Goals</h3>
                    <p className="text-sm text-muted-foreground">
                      {summary?.savingsGoals ||
                        "At your current savings rate, you'll reach your Emergency Fund goal in approximately 10 months. Your Vacation fund is 50% complete and on track to be fully funded by your deadline."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

