import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = Number.parseInt(params.userId)

    // Validate userId
    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    // In a real app, we would analyze the user's financial data
    // For demo purposes, we'll return predefined recommendations

    const recommendations = [
      {
        id: 1,
        category: "Savings",
        title: "Increase Emergency Fund",
        description:
          "Your emergency fund is below the recommended 3-month expense coverage. Consider allocating more to your Emergency Fund bucket.",
        potentialImpact: "High",
        difficulty: "Medium",
      },
      {
        id: 2,
        category: "Expenses",
        title: "Reduce Subscription Services",
        description:
          "You're spending $85 monthly on subscription services. Consider reviewing and canceling unused subscriptions.",
        potentialImpact: "Medium",
        difficulty: "Low",
      },
      {
        id: 3,
        category: "Debt",
        title: "Refinance Loans",
        description:
          "Current interest rates are lower than your existing loans. Refinancing could save you $150 monthly.",
        potentialImpact: "High",
        difficulty: "Medium",
      },
      {
        id: 4,
        category: "Income",
        title: "Explore Side Income",
        description: "Based on your skills, you could earn an additional $500-$1000 monthly through freelance work.",
        potentialImpact: "High",
        difficulty: "High",
      },
    ]

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

