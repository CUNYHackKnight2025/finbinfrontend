import { NextResponse } from "next/server"

// Mock data for demo purposes
const transactions = [
  {
    id: 1,
    userId: 1,
    amount: -50.0,
    description: "Grocery Shopping",
    category: "Groceries",
    transactionDate: "2023-09-15T14:30:00",
    reference: "REF123",
    notes: "Weekly shopping",
    isReconciled: true,
  },
  {
    id: 2,
    userId: 1,
    amount: -120.0,
    description: "Electric Bill",
    category: "Utilities",
    transactionDate: "2023-09-10T09:15:00",
    reference: "UTIL456",
    notes: "Monthly payment",
    isReconciled: true,
  },
  {
    id: 3,
    userId: 1,
    amount: 2500.0,
    description: "Salary Deposit",
    category: "Income",
    transactionDate: "2023-09-01T08:00:00",
    reference: "SAL789",
    notes: "Monthly salary",
    isReconciled: true,
  },
]

export async function GET(request: Request) {
  try {
    // In a real app, we would filter by the authenticated user
    // For demo purposes, we'll return all transactions
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.userId || !body.amount || !body.description || !body.transactionDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create new transaction
    const newTransaction = {
      id: transactions.length + 1,
      userId: body.userId,
      amount: body.amount,
      description: body.description,
      category: body.category || null,
      transactionDate: body.transactionDate,
      reference: body.reference || null,
      notes: body.notes || null,
      isReconciled: body.isReconciled || false,
    }

    transactions.push(newTransaction)

    return NextResponse.json(newTransaction)
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

