"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
})

// Password update schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function SettingsPage() {
  const router = useRouter()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Get user info from localStorage (client-side only)
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const userString = localStorage.getItem("user")
      return userString ? JSON.parse(userString) : { name: "", email: "" }
    }
    return { name: "", email: "" }
  })

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
    },
  })

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onProfileSubmit(data: z.infer<typeof profileSchema>) {
    setIsUpdatingProfile(true)

    try {
      // Get user ID from localStorage
      const userString = localStorage.getItem("user")
      if (!userString) {
        throw new Error("User information not found")
      }

      const user = JSON.parse(userString)

      // Update user profile
      const result = await apiClient(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          Name: data.name,
          Email: data.email,
        }),
      })

      // Update local storage
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          name: data.name,
          email: data.email,
        }),
      )

      setUser({
        ...user,
        name: data.name,
        email: data.email,
      })

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  async function onPasswordSubmit(data: z.infer<typeof passwordSchema>) {
    setIsUpdatingPassword(true)

    try {
      // Get user ID from localStorage
      const userString = localStorage.getItem("user")
      if (!userString) {
        throw new Error("User information not found")
      }

      const user = JSON.parse(userString)

      // Update password
      await apiClient(`/api/users/${user.id}/change-password`, {
        method: "POST",
        body: JSON.stringify({
          CurrentPassword: data.currentPassword,
          NewPassword: data.newPassword,
        }),
      })

      // Reset form
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  async function handleDeleteAccount() {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // Get user ID from localStorage
        const userString = localStorage.getItem("user")
        if (!userString) {
          throw new Error("User information not found")
        }

        const user = JSON.parse(userString)

        // Delete account
        await apiClient(`/api/users/${user.id}`, {
          method: "DELETE",
        })

        // Clear localStorage
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        toast({
          title: "Account deleted",
          description: "Your account has been deleted successfully.",
        })

        // Redirect to home page
        router.push("/")
      } catch (error) {
        toast({
          title: "Delete failed",
          description: error instanceof Error ? error.message : "Failed to delete account",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} disabled={isUpdatingProfile} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Your email" {...field} disabled={isUpdatingProfile} />
                        </FormControl>
                        <FormDescription>This is the email address you use to log in to your account.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} disabled={isUpdatingPassword} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} disabled={isUpdatingPassword} />
                        </FormControl>
                        <FormDescription>Password must be at least 8 characters long.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} disabled={isUpdatingPassword} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Actions in this section can lead to permanent data loss. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Deleting your account will remove all your data from our system. This action cannot be undone.
        </CardFooter>
      </Card>
    </div>
  )
}

