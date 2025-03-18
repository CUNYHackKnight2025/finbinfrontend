"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { apiClient } from "@/lib/api-client"
import type { Bucket } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, ArrowUp, ArrowDown, Trash } from "lucide-react"
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
import { Slider } from "@/components/ui/slider"

export default function BucketsPage() {
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingBucket, setIsAddingBucket] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [newBucket, setNewBucket] = useState({
    name: "",
    targetAmount: "",
    priorityScore: 0.5,
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split("T")[0],
  })

  useEffect(() => {
    // Check if this is a demo token
    const token = localStorage.getItem("token")
    setIsDemoMode(token?.startsWith("dummy-token-") || false)

    async function fetchBuckets() {
      try {
        // Get user info from localStorage
        const userString = localStorage.getItem("user")
        if (!userString) {
          throw new Error("User information not found")
        }

        const user = JSON.parse(userString)

        // Based on the API docs, we need to use the user ID
        const data = await apiClient<Bucket[]>(`/api/buckets/${user.id}`)
        setBuckets(data)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load savings buckets",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBuckets()
  }, [])

  const handleAddBucket = async () => {
    try {
      // Get user info from localStorage
      const userString = localStorage.getItem("user")
      if (!userString) {
        throw new Error("User information not found")
      }

      const user = JSON.parse(userString)

      const addedBucket = await apiClient<Bucket>("/api/buckets", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          name: newBucket.name,
          targetAmount: Number.parseFloat(newBucket.targetAmount),
          currentSavedAmount: 0,
          priorityScore: newBucket.priorityScore,
          deadline: new Date(newBucket.deadline).toISOString(),
          status: "In Progress",
        }),
      })

      setBuckets([...buckets, addedBucket])
      setIsAddingBucket(false)
      setNewBucket({
        name: "",
        targetAmount: "",
        priorityScore: 0.5,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split("T")[0],
      })

      toast({
        title: "Success",
        description: "Savings bucket added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add savings bucket",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePriority = async (bucketId: number, newPriority: number) => {
    try {
      // Get user info from localStorage
      const userString = localStorage.getItem("user")
      if (!userString) {
        throw new Error("User information not found")
      }

      const user = JSON.parse(userString)

      await apiClient(`/api/buckets/${user.id}/${bucketId}/priority`, {
        method: "PUT",
        body: JSON.stringify(newPriority),
      })

      // Update local state
      setBuckets(buckets.map((bucket) => (bucket.id === bucketId ? { ...bucket, priorityScore: newPriority } : bucket)))

      toast({
        title: "Success",
        description: "Bucket priority updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update bucket priority",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBucket = async (bucketId: number) => {
    try {
      // Get user info from localStorage
      const userString = localStorage.getItem("user")
      if (!userString) {
        throw new Error("User information not found")
      }

      const user = JSON.parse(userString)

      await apiClient(`/api/buckets/${user.id}/${bucketId}`, {
        method: "DELETE",
      })

      // Update local state
      setBuckets(buckets.filter((bucket) => bucket.id !== bucketId))

      toast({
        title: "Success",
        description: "Bucket deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete bucket",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading savings buckets...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Sort buckets by priority score (descending)
  const sortedBuckets = [...buckets].sort((a, b) => b.priorityScore - a.priorityScore)

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Savings Buckets</h1>
          <Dialog open={isAddingBucket} onOpenChange={setIsAddingBucket}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Bucket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Savings Bucket</DialogTitle>
                <DialogDescription>Set up a new savings goal with a target amount and deadline.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bucket-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="bucket-name"
                    placeholder="Emergency Fund"
                    className="col-span-3"
                    value={newBucket.name}
                    onChange={(e) => setNewBucket({ ...newBucket, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="target-amount" className="text-right">
                    Target Amount
                  </Label>
                  <Input
                    id="target-amount"
                    type="number"
                    step="0.01"
                    placeholder="1000.00"
                    className="col-span-3"
                    value={newBucket.targetAmount}
                    onChange={(e) => setNewBucket({ ...newBucket, targetAmount: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <div className="col-span-3">
                    <Slider
                      id="priority"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[newBucket.priorityScore]}
                      onValueChange={(value) => setNewBucket({ ...newBucket, priorityScore: value[0] })}
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deadline" className="text-right">
                    Deadline
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    className="col-span-3"
                    value={newBucket.deadline}
                    onChange={(e) => setNewBucket({ ...newBucket, deadline: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingBucket(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBucket}>Create Bucket</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isDemoMode && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <span className="font-medium">Demo Mode:</span> You can create, prioritize, and delete savings buckets.
              All changes will be saved for your current session.
            </p>
          </div>
        )}

        {buckets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">You don't have any savings buckets yet.</p>
              <Button onClick={() => setIsAddingBucket(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Bucket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBuckets.map((bucket) => (
              <Card key={bucket.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{bucket.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpdatePriority(bucket.id, Math.min(1, bucket.priorityScore + 0.1))}
                        disabled={bucket.priorityScore >= 1}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpdatePriority(bucket.id, Math.max(0, bucket.priorityScore - 0.1))}
                        disabled={bucket.priorityScore <= 0}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteBucket(bucket.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Priority: {bucket.priorityScore >= 0.7 ? "High" : bucket.priorityScore >= 0.4 ? "Medium" : "Low"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">
                        {Math.round((bucket.currentSavedAmount / bucket.targetAmount) * 100)}%
                      </span>
                    </div>
                    <Progress value={(bucket.currentSavedAmount / bucket.targetAmount) * 100} className="h-2" />
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Saved</p>
                        <p className="font-medium">{formatCurrency(bucket.currentSavedAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Target</p>
                        <p className="font-medium">{formatCurrency(bucket.targetAmount)}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-medium">{formatDate(bucket.deadline)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {buckets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Optimize Your Savings</CardTitle>
              <CardDescription>AI-powered recommendations for your savings goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="font-medium">Adjust Your Priorities</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on your financial situation, we recommend prioritizing your Emergency Fund first, followed by
                    Debt Repayment.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="font-medium">Increase Your Savings Rate</h3>
                  <p className="text-sm text-muted-foreground">
                    You could reach your savings goals 3 months faster by increasing your monthly contributions by just
                    $50.
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  Get Personalized Savings Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

