import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = Number.parseInt(params.userId)
    const body = await request.json()

    // Validate userId
    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    // Validate question
    if (!body.question) {
      return NextResponse.json({ message: "Question is required" }, { status: 400 })
    }

    // In a real app, we would use a real AI model to generate responses
    // For demo purposes, we'll return predefined responses based on keywords

    const question = body.question.toLowerCase()
    let response = "I'm sorry, I don't have enough information to answer that question."

    if (question.includes("save") || question.includes("saving")) {
      response =
        "Based on your current spending patterns, you could save an additional $250 per month by reducing your subscription services and dining out expenses. Would you like me to suggest a savings plan?"
    } else if (question.includes("invest") || question.includes("investment")) {
      response =
        "With your current risk profile and financial goals, I would recommend allocating 60% to index funds, 30% to bonds, and 10% to individual stocks. Would you like more specific investment recommendations?"
    } else if (question.includes("debt") || question.includes("loan")) {
      response =
        "I recommend prioritizing paying off your high-interest debt first. Based on your current income and expenses, you could be debt-free in approximately 18 months by allocating an additional $300 per month to debt repayment."
    } else if (question.includes("budget") || question.includes("spending")) {
      response =
        "Your top spending categories last month were housing (35%), food (20%), and transportation (15%). Your food spending is 25% higher than the recommended amount for your income level. Would you like suggestions to reduce this expense?"
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error processing AI chat:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

