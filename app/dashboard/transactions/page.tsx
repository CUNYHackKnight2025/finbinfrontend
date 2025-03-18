"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import TransactionList from "@/components/transaction-list"
import { apiClient } from "@/lib/api-client"
import type { Transaction } from "@/lib/types"
import { Search, Filter, Download } from "lucide-react"

export default function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  useEffect(() => {
    async function fetchTransactions() {
      try {
        // Get user info from localStorage
        const userString = localStorage.getItem("user")
        if (!userString) {
          throw new Error("User information not found")
        }

        const user = JSON.parse(userString)

        // Based on the API docs, we need to use the user ID
        const data = await apiClient<Transaction[]>(`/api/transactions/${user.id}`)
        setTransactions(data)
        setFilteredTransactions(data)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load transactions",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  useEffect(() => {
    // Apply filters
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter) {
      filtered = filtered.filter((transaction) => transaction.category === categoryFilter)
    }

    if (dateFilter) {
      const now = new Date()
      let startDate: Date

      switch (dateFilter) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1))
          break
        default:
          startDate = new Date(0) // Beginning of time
      }

      filtered = filtered.filter((transaction) => new Date(transaction.transactionDate) >= startDate)
    }

    setFilteredTransactions(filtered)
  }, [searchTerm, categoryFilter, dateFilter, transactions])

  // Get unique categories
  const categories = Array.from(new Set(transactions.map((t) => t.category).filter(Boolean)))

  // Calculate totals
  const totalIncome = filteredTransactions.reduce((sum, t) => (t.amount > 0 ? sum + t.amount : sum), 0)
  const totalExpenses = filteredTransactions.reduce((sum, t) => (t.amount < 0 ? sum + Math.abs(t.amount) : sum), 0)
  const netAmount = totalIncome - totalExpenses

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Transactions</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">${totalIncome.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">${totalExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netAmount >= 0 ? "text-green-500" : "text-red-500"}`}>
                ${netAmount.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View and filter your transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category as string}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {isLoading ? (
              <p className="text-center py-4">Loading transactions...</p>
            ) : (
              <TransactionList transactions={filteredTransactions} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

