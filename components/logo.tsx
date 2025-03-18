"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"

export function Logo({ className = "", showText = true }: { className?: string; showText?: boolean }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Link href="/dashboard" className={`flex items-center ${className}`}>
      <div className="relative h-10 w-10">
        <Image
          src={
            isDark
              ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DarkMode_-_FinBins-1FQCeMEJVVXbOV9Mh1yiR0hOwaaTsn.png"
              : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lightmode_-_FinBins-6Hww80uaEjQScdSBy96uw2FZTQ2XL8.png"
          }
          alt="FinBins Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && <span className="ml-2 text-xl font-bold">FINBINS</span>}
    </Link>
  )
}

