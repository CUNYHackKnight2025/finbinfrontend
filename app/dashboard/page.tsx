"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import type { FinancialSummary } from "@/lib/types"
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, PiggyBank, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Get user ID from localStorage
    const userString = localStorage.getItem("user")
    if (!userString) {
      return
    }

    const user = JSON.parse(userString)
    setUserId(user.id)

    // Check if this is a demo token
    const token = localStorage.getItem("token")
    setIsDemoMode(token?.startsWith("dummy-token-") || false)

    // Fetch financial summary
    async function fetchSummary() {
      try {
        const data = await apiClient<FinancialSummary>(`/api/financial-summary/${user.id}`)
        setSummary(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load financial summary",
          variant: "destructive",
        })
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummary()
  }, [])

  // Calculate total income and expenses
  const totalIncome = summary ? summary.Income.Salary + summary.Income.Investments + summary.Income.BusinessIncome : 0
  const totalExpenses = summary
    ? summary.Expenses.RentMortgage +
      summary.Expenses.Utilities +
      summary.Expenses.Insurance +
      summary.Expenses.LoanPayments +
      summary.Expenses.Groceries +
      summary.Expenses.Transportation +
      summary.Expenses.Subscriptions +
      summary.Expenses.Entertainment
    : 0
  const monthlySavings = totalIncome - totalExpenses

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/ai-assistant">
            <Button variant="outline">Ask AI Assistant</Button>
          </Link>
        </div>
      </div>
      {isDemoMode && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
          <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Demo Mode Active
          </h3>
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            You're currently using FinBins in demo mode. All data is simulated and changes won't be saved permanently.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-4 w-4 bg-muted rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-36 bg-muted rounded mb-2"></div>
                <div className="h-4 w-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summary ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Monthly income from all sources</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Monthly expenses across all categories</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-2xl font-bold">${monthlySavings.toFixed(2)}</div>
                  {monthlySavings > 0 ? (
                    <ArrowUpRight className="ml-2 h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="ml-2 h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {monthlySavings > 0 ? "Positive cash flow" : "Negative cash flow"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(summary.SavingsBalance + summary.InvestmentBalance - summary.DebtBalance).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Total assets minus liabilities</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Savings</CardTitle>
                <CardDescription>Your current savings balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${summary.SavingsBalance.toFixed(2)}</div>
                <div className="mt-4">
                  <Link href="/dashboard/buckets">
                    <Button variant="outline" className="w-full">
                      Manage Savings Buckets
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Investments</CardTitle>
                <CardDescription>Your current investment portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${summary.InvestmentBalance.toFixed(2)}</div>
                <div className="mt-4">
                  <Link href="/dashboard/analysis">
                    <Button variant="outline" className="w-full">
                      View Investment Analysis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Debt</CardTitle>
                <CardDescription>Your current debt balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${summary.DebtBalance.toFixed(2)}</div>
                <div className="mt-4">
                  <Link href="/dashboard/analysis">
                    <Button variant="outline" className="w-full">
                      View Debt Reduction Plan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your recent financial activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading transactions...</p>
                </div>
                <div className="mt-4">
                  <Link href="/dashboard/transactions">
                    <Button variant="outline" className="w-full">
                      View All Transactions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Financial Insights</CardTitle>
                <CardDescription>AI-powered recommendations for your finances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Ask our AI assistant for personalized insights</p>
                </div>
                <div className="mt-4">
                  <Link href="/dashboard/ai-assistant">
                    <Button variant="outline" className="w-full">
                      Chat with AI Assistant
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-xl font-semibold mb-2">No financial data found</h3>
          <p className="text-muted-foreground mb-6">Let's set up your financial profile to get started</p>
          <Link href="/onboarding">
            <Button>Complete Onboarding</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

