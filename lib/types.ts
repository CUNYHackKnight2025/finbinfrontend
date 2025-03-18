export interface User {
  Id: number
  Name: string
  Email: string
  PasswordHash?: Uint8Array
  PasswordSalt?: Uint8Array
  ResetToken?: string | null
  ResetTokenExpires?: string | null
  FinancialSummary?: FinancialSummary | null
  token?: string // For client-side use
}

export interface Income {
  Id: number
  Salary: number
  Investments: number
  BusinessIncome: number
  FinancialSummaryId: number
}

export interface Expenses {
  Id: number
  RentMortgage: number
  Utilities: number
  Insurance: number
  LoanPayments: number
  Groceries: number
  Transportation: number
  Subscriptions: number
  Entertainment: number
  FinancialSummaryId: number
}

export interface FinancialSummary {
  Id: number
  SavingsBalance: number
  InvestmentBalance: number
  DebtBalance: number
  UserId: number
  Income: Income
  Expenses: Expenses
  TotalIncome?: number
  TotalExpenses?: number
}

export interface Bucket {
  Id: number
  UserId: number
  Name: string
  TargetAmount: number
  CurrentSavedAmount: number
  PriorityScore: number
  Deadline: string
  Status: string
}

export interface Transaction {
  Id: number
  UserId: number
  Amount: number
  Description: string
  Category?: string
  TransactionDate: string
  Reference?: string
  Notes?: string
  IsReconciled: boolean
}

export interface UserHistory {
  Id: number
  UserId: number
  Timestamp: string
  EventType: string
  Description: string
  AdditionalData?: string
  IsSummarized: boolean
}

export interface HistorySummary {
  Id: number
  UserId: number
  CreatedAt: string
  FromDate: string
  ToDate: string
  SummaryText?: string
  SummarizedEntryIds?: string
}

export interface ChatRequest {
  question: string
}

export interface ChatResponse {
  answer: string
}

export interface AuthResponseDTO {
  Id: number
  Name: string
  Email: string
  Token: string
}

export interface LoginDTO {
  Email: string
  Password: string
}

export interface RegisterDTO {
  Name: string
  Email: string
  Password: string
}

export interface ForgotPasswordDTO {
  Email: string
}

export interface VerifyResetTokenDTO {
  Token: string
}

export interface ResetPasswordDTO {
  Token: string
  NewPassword: string
  ConfirmPassword: string
}

export interface ExpenseAdjustment {
  category: string
  currentAmount: number
  suggestedAmount: number
  savings: number
  reason: string
}

