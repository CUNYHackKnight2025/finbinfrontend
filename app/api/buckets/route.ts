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

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.userId || !body.name || !body.targetAmount || !body.deadline) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create new bucket
    const newBucket = {
      id: buckets.length + 1,
      userId: body.userId,
      name: body.name,
      targetAmount: body.targetAmount,
      currentSavedAmount: body.currentSavedAmount || 0,
      priorityScore: body.priorityScore || 0.5,
      deadline: body.deadline,
      status: body.status || "In Progress",
    }

    buckets.push(newBucket)

    return NextResponse.json(newBucket)
  } catch (error) {
    console.error("Error creating bucket:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

