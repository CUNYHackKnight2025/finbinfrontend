"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, CreditCard, Home, LogOut, Menu, MessageSquare, PiggyBank, Settings, User, X } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState("User")

  useEffect(() => {
    // Get user info from localStorage or fetch from API
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUserName(user.name)
      } catch (error) {
        console.error("Failed to parse user data", error)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Transactions", href: "/dashboard/transactions", icon: <CreditCard className="h-5 w-5" /> },
    { name: "Savings Buckets", href: "/dashboard/buckets", icon: <PiggyBank className="h-5 w-5" /> },
    { name: "Analysis", href: "/dashboard/analysis", icon: <BarChart3 className="h-5 w-5" /> },
    { name: "AI Assistant", href: "/dashboard/assistant", icon: <MessageSquare className="h-5 w-5" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">FINBIN</h1>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">View Profile</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile header and content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <header className="bg-card border-b md:hidden">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold">FINBIN</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <nav className="px-4 pb-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
              <Button variant="outline" className="w-full justify-start mt-4" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

