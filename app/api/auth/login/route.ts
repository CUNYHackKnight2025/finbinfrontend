import { NextResponse } from "next/server"

// In a real app, this would be a database
const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // password: "password"
    passwordSalt: "salt",
  },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = users.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // In a real app, we would hash the password with the stored salt
    // For demo purposes, we'll just check if the password is "password"
    if (password !== "password") {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT token (simplified for demo)
    const token = `demo-token-${user.id}-${Date.now()}`

    // Return user info and token (excluding password)
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

