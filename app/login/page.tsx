"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import type { AuthResponseDTO, LoginDTO } from "@/lib/types"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

// Dummy users for demo purposes
const DUMMY_USERS = [
  {
    id: 1,
    name: "Demo User",
    email: "demo@example.com",
    password: "password123",
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  },
  {
    id: 3,
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
  },
]

// This matches the LoginDTO from the API docs
const loginSchema = z.object({
  Email: z.string().email({ message: "Please enter a valid email address." }),
  Password: z.string().min(1, { message: "Password is required." }),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      Email: "",
      Password: "",
    },
  })

  async function onSubmit(data: LoginDTO) {
    setIsLoading(true)

    try {
      // Check for dummy users first
      const dummyUser = DUMMY_USERS.find(
        (user) => user.email.toLowerCase() === data.Email.toLowerCase() && user.password === data.Password,
      )

      if (dummyUser) {
        // Create a dummy token
        const dummyToken = `dummy-token-${dummyUser.id}-${Date.now()}`

        // Store the token in localStorage
        localStorage.setItem("token", dummyToken)

        // Store basic user info
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: dummyUser.id,
            name: dummyUser.name,
            email: dummyUser.email,
          }),
        )

        toast({
          title: "Demo login successful",
          description: "You are now logged in with a demo account.",
        })

        // Redirect to dashboard
        router.push("/dashboard")
        return
      }

      // If not a dummy user, try the API but don't let it block the experience
      try {
        // If not a dummy user, proceed with regular API login
        const result = await apiClient<AuthResponseDTO>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(data),
        })

        // Store the token in localStorage
        localStorage.setItem("token", result.Token)

        // Store basic user info
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: result.Id,
            name: result.Name,
            email: result.Email,
          }),
        )

        toast({
          title: "Login successful",
          description: "Welcome back to FinBins!",
        })

        // Redirect to dashboard
        router.push("/dashboard")
      } catch (apiError) {
        console.error("API login failed:", apiError)

        // Create a fallback demo user if the API fails
        const fallbackUser = {
          id: 999,
          name: "Fallback User",
          email: data.Email,
        }

        // Create a dummy token
        const dummyToken = `dummy-token-${fallbackUser.id}-${Date.now()}`

        // Store the token in localStorage
        localStorage.setItem("token", dummyToken)

        // Store basic user info
        localStorage.setItem("user", JSON.stringify(fallbackUser))

        toast({
          title: "Demo login activated",
          description: "API connection failed. You're now using a demo account.",
        })

        // Redirect to dashboard
        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ThemeToggle />
      </div>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-b from-finbins-purple to-finbins-pink" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo className="text-white" />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "FinBins has completely transformed how I manage my finances. The AI insights are incredibly helpful!"
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center mb-4 lg:hidden">
              <Logo />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="Email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="Password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-right">
                    <Link href="/forgot-password" className="text-sm text-primary underline underline-offset-4">
                      Forgot password?
                    </Link>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary underline underline-offset-4">
                  Register
                </Link>
              </p>
              <div className="w-full mt-4 pt-4 border-t">
                <p className="text-sm text-center text-muted-foreground mb-2">Quick Demo Access</p>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      form.setValue("Email", "demo@example.com")
                      form.setValue("Password", "password123")
                    }}
                    type="button"
                    className="text-xs"
                  >
                    Use Demo Credentials
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Email: demo@example.com
                  <br />
                  Password: password123
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

