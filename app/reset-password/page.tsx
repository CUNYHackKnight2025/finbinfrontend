"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import type { ResetPasswordDTO, VerifyResetTokenDTO } from "@/lib/types"

const resetPasswordSchema = z
  .object({
    NewPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    ConfirmPassword: z.string(),
  })
  .refine((data) => data.NewPassword === data.ConfirmPassword, {
    message: "Passwords do not match",
    path: ["ConfirmPassword"],
  })

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      NewPassword: "",
      ConfirmPassword: "",
    },
  })

  // Verify token when component mounts
  useState(() => {
    async function verifyToken() {
      if (!token) {
        setIsTokenValid(false)
        return
      }

      try {
        const result = await apiClient<{ valid: boolean }>("/api/auth/verify-reset-token", {
          method: "POST",
          body: JSON.stringify({ Token: token } as VerifyResetTokenDTO),
        })

        setIsTokenValid(result.valid)
      } catch (error) {
        setIsTokenValid(false)
        toast({
          title: "Error",
          description: "The password reset link is invalid or has expired.",
          variant: "destructive",
        })
      }
    }

    verifyToken()
  }, [token])

  async function onSubmit(data: z.infer<typeof resetPasswordSchema>) {
    if (!token) {
      toast({
        title: "Error",
        description: "Reset token is missing",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await apiClient("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          Token: token,
          NewPassword: data.NewPassword,
          ConfirmPassword: data.ConfirmPassword,
        } as ResetPasswordDTO),
      })

      toast({
        title: "Success",
        description: "Your password has been reset successfully.",
      })

      router.push("/login")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isTokenValid === false) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Invalid Request</CardTitle>
            <CardDescription className="text-center">
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>Please request a new password reset link.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/forgot-password" className="text-primary underline underline-offset-4">
              Request New Link
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isTokenValid === null) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Verifying Link</CardTitle>
            <CardDescription className="text-center">
              Please wait while we verify your password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
          <CardDescription className="text-center">Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="NewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ConfirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary underline underline-offset-4">
              Back to Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

