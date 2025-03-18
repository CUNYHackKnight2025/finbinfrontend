"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import type { Transaction } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { Plus } from "lucide-react"

interface TransactionListProps {
  transactions?: Transaction[]
}

export default function TransactionList({ transactions: propTransactions }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(!propTransactions)
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    description: "",
    category: "",
    transactionDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (propTransactions) {
      setTransactions(propTransactions)
      setIsLoading(false)
      return
    }

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

    if (!propTransactions) {
      fetchTransactions()
    }
  }, [propTransactions])

  const handleAddTransaction = async () => {
    try {
      // Get user info from localStorage
      const userString = localStorage.getItem("user")
      if (!userString) {
        throw new Error("User information not found")
      }

      const user = JSON.parse(userString)

      const addedTransaction = await apiClient<Transaction>("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          amount: Number.parseFloat(newTransaction.amount),
          description: newTransaction.description,
          category: newTransaction.category,
          transactionDate: new Date(newTransaction.transactionDate).toISOString(),
          isReconciled: false,
        }),
      })

      setTransactions([addedTransaction, ...transactions])
      setIsAddingTransaction(false)
      setNewTransaction({
        amount: "",
        description: "",
        category: "",
        transactionDate: new Date().toISOString().split("T")[0],
      })

      toast({
        title: "Success",
        description: "Transaction added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add transaction",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <p>Loading transactions...</p>
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-0">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </div>
        <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>Enter the details of your transaction below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="col-span-3"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Grocery shopping"
                  className="col-span-3"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Groceries">Groceries</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Rent/Mortgage">Rent/Mortgage</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Subscriptions">Subscriptions</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="col-span-3"
                  value={newTransaction.transactionDate}
                  onChange={(e) => setNewTransaction({ ...newTransaction, transactionDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingTransaction(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction}>Add Transaction</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-0">
        {transactions.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No transactions found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className={`text-right ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

