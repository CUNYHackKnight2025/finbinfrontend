import { NextResponse } from "next/server"

// Mock data for demo purposes
const financialSummaries = [
  {
    id: 1,
    savingsBalance: 5000.0,
    investmentBalance: 15000.0,
    debtBalance: 8000.0,
    userId: 1,
    income: {
      id: 1,
      salary: 5000.0,
      investments: 200.0,
      businessIncome: 0.0,
      financialSummaryId: 1,
    },
    expenses: {
      id: 1,
      rentMortgage: 1200.0,
      utilities: 200.0,
      insurance: 150.0,
      loanPayments: 300.0,
      groceries: 400.0,
      transportation: 150.0,
      subscriptions: 50.0,
      entertainment: 100.0,
      financialSummaryId: 1,
    },
  },
]

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = Number.parseInt(params.userId)

    // Validate userId
    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    // Find financial summary for user
    const summary = financialSummaries.find((s) => s.userId === userId)

    if (!summary) {
      return NextResponse.json({ message: "Financial summary not found" }, { status: 404 })
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error fetching financial summary:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

