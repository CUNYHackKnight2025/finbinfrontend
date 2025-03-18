import { NextResponse } from "next/server"

// Mock data for demo purposes
const buckets = [
  {
    id: 1,
    userId: 1,
    name: "Emergency Fund",
    targetAmount: 10000.0,
    currentSavedAmount: 2000.0,
    priorityScore: 0.9,
    deadline: "2024-12-31T00:00:00",
    status: "In Progress",
  },
  {
    id: 2,
    userId: 1,
    name: "Vacation",
    targetAmount: 3000.0,
    currentSavedAmount: 1500.0,
    priorityScore: 0.6,
    deadline: "2024-06-30T00:00:00",
    status: "In Progress",
  },
  {
    id: 3,
    userId: 1,
    name: "New Car",
    targetAmount: 20000.0,
    currentSavedAmount: 5000.0,
    priorityScore: 0.7,
    deadline: "2025-12-31T00:00:00",
    status: "In Progress",
  },
]

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = Number.parseInt(params.userId)

    // Validate userId
    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    // Find buckets for user
    const userBuckets = buckets.filter((b) => b.userId === userId)

    return NextResponse.json(userBuckets)
  } catch (error) {
    console.error("Error fetching buckets:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

