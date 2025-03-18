"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bell, CreditCard, Home, LogOut, Menu, PieChart, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [userName, setUserName] = useState("")
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Check if user is logged in
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Check if this is a demo token
    setIsDemoMode(token.startsWith("dummy-token-"))

    // Get user name
    const userString = localStorage.getItem("user")
    if (userString) {
      const user = JSON.parse(userString)
      setUserName(user.name || "User")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })
    router.push("/login")
  }

  // Don't render anything on the server
  if (!isClient) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <div className="p-6">
              <Logo />
            </div>
            <nav className="grid gap-2 px-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/transactions"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
              >
                <CreditCard className="h-5 w-5" />
                Transactions
              </Link>
              <Link
                href="/dashboard/buckets"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
              >
                <PieChart className="h-5 w-5" />
                Buckets
              </Link>
              <Link
                href="/dashboard/analysis"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
              >
                <PieChart className="h-5 w-5" />
                Analysis
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </nav>
            <div className="mt-auto p-4">
              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <Logo />
        {isDemoMode && <div className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-md">DEMO</div>}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="flex-1 md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Logo />
              {isDemoMode && (
                <div className="absolute top-14 right-4 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-md">
                  DEMO
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/transactions"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
                >
                  <CreditCard className="h-4 w-4" />
                  Transactions
                </Link>
                <Link
                  href="/dashboard/buckets"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
                >
                  <PieChart className="h-4 w-4" />
                  Buckets
                </Link>
                <Link
                  href="/dashboard/analysis"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
                >
                  <PieChart className="h-4 w-4" />
                  Analysis
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/10"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </nav>
            </div>
            <div className="mt-auto p-4">
              <div className="flex items-center gap-2 rounded-lg border p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 truncate">
                  <div className="text-sm font-medium">{userName}</div>
                  <div className="truncate text-xs text-muted-foreground">Manage your account</div>
                </div>
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            </div>
          </div>
        </aside>
        <main className="flex flex-col">
          <div className="flex-1">{children}</div>
        </main>
      </div>
    </div>
  )
}

