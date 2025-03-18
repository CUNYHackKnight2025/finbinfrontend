import { NextResponse } from "next/server"
import crypto from "crypto"

// In a real app, this would be a database
const users: any[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email)
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Generate salt and hash password
    const salt = crypto.randomBytes(16).toString("hex")
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      passwordHash: hash,
      passwordSalt: salt,
      resetToken: null,
      resetTokenExpires: null,
    }

    users.push(newUser)

    // Generate JWT token (simplified for demo)
    const token = `demo-token-${newUser.id}-${Date.now()}`

    // Return user info and token (excluding password)
    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

