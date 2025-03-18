"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { Progress } from "@/components/ui/progress"
import type { FinancialSummary } from "@/lib/types"

// Step 1: Basic Financial Information
const basicFinancialSchema = z.object({
  SavingsBalance: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  InvestmentBalance: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  DebtBalance: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
})

// Step 2: Income Information
const incomeSchema = z.object({
  Salary: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  Investments: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  BusinessIncome: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
})

// Step 3: Expense Information
const expensesSchema = z.object({
  RentMortgage: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  Utilities: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  Insurance: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  LoanPayments: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  Groceries: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  Transportation: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  Subscriptions: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
  Entertainment: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Must be a valid number",
  }),
})

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [financialData, setFinancialData] = useState({
    SavingsBalance: "",
    InvestmentBalance: "",
    DebtBalance: "",
    Income: {
      Salary: "",
      Investments: "",
      BusinessIncome: "",
    },
    Expenses: {
      RentMortgage: "",
      Utilities: "",
      Insurance: "",
      LoanPayments: "",
      Groceries: "",
      Transportation: "",
      Subscriptions: "",
      Entertainment: "",
    },
  })

  // Form for step 1
  const basicFinancialForm = useForm<z.infer<typeof basicFinancialSchema>>({
    resolver: zodResolver(basicFinancialSchema),
    defaultValues: {
      SavingsBalance: financialData.SavingsBalance,
      InvestmentBalance: financialData.InvestmentBalance,
      DebtBalance: financialData.DebtBalance,
    },
  })

  // Form for step 2
  const incomeForm = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      Salary: financialData.Income.Salary,
      Investments: financialData.Income.Investments,
      BusinessIncome: financialData.Income.BusinessIncome,
    },
  })

  // Form for step 3
  const expensesForm = useForm<z.infer<typeof expensesSchema>>({
    resolver: zodResolver(expensesSchema),
    defaultValues: {
      RentMortgage: financialData.Expenses.RentMortgage,
      Utilities: financialData.Expenses.Utilities,
      Insurance: financialData.Expenses.Insurance,
      LoanPayments: financialData.Expenses.LoanPayments,
      Groceries: financialData.Expenses.Groceries,
      Transportation: financialData.Expenses.Transportation,
      Subscriptions: financialData.Expenses.Subscriptions,
      Entertainment: financialData.Expenses.Entertainment,
    },
  })

  const handleBasicFinancialSubmit = (data: z.infer<typeof basicFinancialSchema>) => {
    setFinancialData({
      ...financialData,
      SavingsBalance: data.SavingsBalance,
      InvestmentBalance: data.InvestmentBalance,
      DebtBalance: data.DebtBalance,
    })
    setStep(2)
  }

  const handleIncomeSubmit = (data: z.infer<typeof incomeSchema>) => {
    setFinancialData({
      ...financialData,
      Income: {
        Salary: data.Salary,
        Investments: data.Investments,
        BusinessIncome: data.BusinessIncome,
      },
    })
    setStep(3)
  }

  const handleExpensesSubmit = async (data: z.infer<typeof expensesSchema>) => {
    setIsSubmitting(true)

    // Update local state first
    const updatedFinancialData = {
      ...financialData,
      Expenses: {
        RentMortgage: data.RentMortgage,
        Utilities: data.Utilities,
        Insurance: data.Insurance,
        LoanPayments: data.LoanPayments,
        Groceries: data.Groceries,
        Transportation: data.Transportation,
        Subscriptions: data.Subscriptions,
        Entertainment: data.Entertainment,
      },
    }

    setFinancialData(updatedFinancialData)

    try {
      // Get user info from localStorage
      const userString = localStorage.getItem("user")
      if (!userString) {
        throw new Error("User information not found")
      }

      const user = JSON.parse(userString)

      // Submit financial data to API - updated endpoint to match backend
      // Based on the API docs, the endpoint is /api/financial-summary/add/{userId}
      await apiClient<FinancialSummary>(`/api/financial-summary/add/${user.id}`, {
        method: "POST",
        body: JSON.stringify({
          Id: 0, // This will be assigned by the server
          SavingsBalance: Number.parseFloat(updatedFinancialData.SavingsBalance) || 0,
          InvestmentBalance: Number.parseFloat(updatedFinancialData.InvestmentBalance) || 0,
          DebtBalance: Number.parseFloat(updatedFinancialData.DebtBalance) || 0,
          UserId: user.id,
          Income: {
            Id: 0, // This will be assigned by the server
            Salary: Number.parseFloat(updatedFinancialData.Income.Salary) || 0,
            Investments: Number.parseFloat(updatedFinancialData.Income.Investments) || 0,
            BusinessIncome: Number.parseFloat(updatedFinancialData.Income.BusinessIncome) || 0,
            FinancialSummaryId: 0, // This will be assigned by the server
          },
          Expenses: {
            Id: 0, // This will be assigned by the server
            RentMortgage: Number.parseFloat(updatedFinancialData.Expenses.RentMortgage) || 0,
            Utilities: Number.parseFloat(updatedFinancialData.Expenses.Utilities) || 0,
            Insurance: Number.parseFloat(updatedFinancialData.Expenses.Insurance) || 0,
            LoanPayments: Number.parseFloat(updatedFinancialData.Expenses.LoanPayments) || 0,
            Groceries: Number.parseFloat(updatedFinancialData.Expenses.Groceries) || 0,
            Transportation: Number.parseFloat(updatedFinancialData.Expenses.Transportation) || 0,
            Subscriptions: Number.parseFloat(updatedFinancialData.Expenses.Subscriptions) || 0,
            Entertainment: Number.parseFloat(updatedFinancialData.Expenses.Entertainment) || 0,
            FinancialSummaryId: 0, // This will be assigned by the server
          },
        }),
      })

      toast({
        title: "Onboarding complete",
        description: "Your financial information has been saved.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save financial information",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Set Up Your Financial Profile</CardTitle>
          <CardDescription className="text-center">
            Help us understand your financial situation to provide personalized insights
          </CardDescription>
          <div className="mt-4">
            <Progress value={(step / 3) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              Step {step} of 3: {step === 1 ? "Basic Information" : step === 2 ? "Income" : "Expenses"}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <Form {...basicFinancialForm}>
              <form onSubmit={basicFinancialForm.handleSubmit(handleBasicFinancialSubmit)} className="space-y-4">
                <FormField
                  control={basicFinancialForm.control}
                  name="SavingsBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Savings Balance ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>Your total savings across all accounts</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={basicFinancialForm.control}
                  name="InvestmentBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Balance ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>Your total investments (stocks, bonds, etc.)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={basicFinancialForm.control}
                  name="DebtBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt Balance ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>Your total outstanding debt</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit">Next</Button>
                </div>
              </form>
            </Form>
          )}

          {step === 2 && (
            <Form {...incomeForm}>
              <form onSubmit={incomeForm.handleSubmit(handleIncomeSubmit)} className="space-y-4">
                <FormField
                  control={incomeForm.control}
                  name="Salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Salary ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>Your monthly income from employment</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={incomeForm.control}
                  name="Investments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Investment Income ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>Income from dividends, interest, etc.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={incomeForm.control}
                  name="BusinessIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Business Income ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>Income from side hustles or business</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit">Next</Button>
                </div>
              </form>
            </Form>
          )}

          {step === 3 && (
            <Form {...expensesForm}>
              <form onSubmit={expensesForm.handleSubmit(handleExpensesSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={expensesForm.control}
                    name="RentMortgage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rent/Mortgage ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expensesForm.control}
                    name="Utilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Utilities ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expensesForm.control}
                    name="Insurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expensesForm.control}
                    name="LoanPayments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Payments ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expensesForm.control}
                    name="Groceries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groceries ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expensesForm.control}
                    name="Transportation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transportation ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expensesForm.control}
                    name="Subscriptions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscriptions ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expensesForm.control}
                    name="Entertainment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entertainment ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Complete Setup"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            This information helps us provide personalized financial insights
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

