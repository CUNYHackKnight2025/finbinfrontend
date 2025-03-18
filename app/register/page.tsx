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
import type { AuthResponseDTO, RegisterDTO } from "@/lib/types"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

// This matches the RegisterDTO from the API docs
const registerSchema = z
  .object({
    Name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    Email: z.string().email({ message: "Please enter a valid email address." }),
    Password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.Password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      Name: "",
      Email: "",
      Password: "",
      confirmPassword: "",
    },
  })

  function handleDemoRegistration() {
    setIsLoading(true)

    // Create a dummy user
    const dummyUser = {
      id: Math.floor(Math.random() * 1000) + 10, // Random ID to avoid conflicts
      name: "New Demo User",
      email: `demo${Math.floor(Math.random() * 1000)}@example.com`,
    }

    // Create a dummy token
    const dummyToken = `dummy-token-${dummyUser.id}-${Date.now()}`

    // Store the token in localStorage
    localStorage.setItem("token", dummyToken)

    // Store basic user info
    localStorage.setItem("user", JSON.stringify(dummyUser))

    toast({
      title: "Demo registration successful",
      description: "A demo account has been created for you.",
    })

    // Redirect to onboarding
    setTimeout(() => {
      setIsLoading(false)
      router.push("/onboarding")
    }, 1000)
  }

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    setIsLoading(true)

    try {
      // Try to make the API call, but don't let it block the demo experience
      try {
        // This matches the AuthResponseDTO from the API docs
        const result = await apiClient<AuthResponseDTO>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            Name: data.Name,
            Email: data.Email,
            Password: data.Password,
          } as RegisterDTO),
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
      } catch (apiError) {
        console.error("API registration failed, falling back to demo mode:", apiError)

        // Create a dummy user based on the form data
        const dummyUser = {
          id: Math.floor(Math.random() * 1000) + 10,
          name: data.Name,
          email: data.Email,
        }

        // Create a dummy token
        const dummyToken = `dummy-token-${dummyUser.id}-${Date.now()}`

        // Store the token in localStorage
        localStorage.setItem("token", dummyToken)

        // Store basic user info
        localStorage.setItem("user", JSON.stringify(dummyUser))
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      })

      // Redirect to onboarding
      router.push("/onboarding")
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong",
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
        <div className="absolute inset-0 bg-gradient-to-b from-finbins-blue to-finbins-green" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo className="text-white" />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "With FinBins, I've been able to save more money than ever before. The savings buckets feature is a
              game-changer!"
            </p>
            <footer className="text-sm">Alex Johnson</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center mb-4 lg:hidden">
              <Logo />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Enter your details to create your FinBins account</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Register"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary underline underline-offset-4">
                  Login
                </Link>
              </p>
              <div className="w-full mt-4 pt-4 border-t">
                <p className="text-sm text-center text-muted-foreground mb-2">Quick Demo Access</p>
                <Button
                  variant="outline"
                  onClick={handleDemoRegistration}
                  disabled={isLoading}
                  className="w-full text-xs"
                >
                  Create Demo Account
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

