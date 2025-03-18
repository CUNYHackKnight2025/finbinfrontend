"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import type { Bucket } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { Plus } from "lucide-react"

export default function BucketList() {
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingBucket, setIsAddingBucket] = useState(false)
  const [newBucket, setNewBucket] = useState({
    name: "",
    targetAmount: "",
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split("T")[0],
  })

  useEffect(() => {
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
          priorityScore: 0.5,
          deadline: new Date(newBucket.deadline).toISOString(),
          status: "In Progress",
        }),
      })

      setBuckets([...buckets, addedBucket])
      setIsAddingBucket(false)
      setNewBucket({
        name: "",
        targetAmount: "",
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

  if (isLoading) {
    return <p>Loading savings buckets...</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Savings Buckets</CardTitle>
          <CardDescription>Track your savings goals</CardDescription>
        </div>
        <Dialog open={isAddingBucket} onOpenChange={setIsAddingBucket}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Bucket
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
      </CardHeader>
      <CardContent>
        {buckets.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No savings buckets found</p>
        ) : (
          <div className="space-y-4">
            {buckets.map((bucket) => (
              <div key={bucket.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{bucket.name}</h3>
                    <p className="text-sm text-muted-foreground">Deadline: {formatDate(bucket.deadline)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(bucket.currentSavedAmount)} / {formatCurrency(bucket.targetAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((bucket.currentSavedAmount / bucket.targetAmount) * 100)}% complete
                    </p>
                  </div>
                </div>
                <Progress value={(bucket.currentSavedAmount / bucket.targetAmount) * 100} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

