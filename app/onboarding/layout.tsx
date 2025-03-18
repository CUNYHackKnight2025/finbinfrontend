import type React from "react"
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">FINBIN</h1>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

