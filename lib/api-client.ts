// API client utility to handle all API requests with the correct base URL

// Define development and production URLs
const DEV_API_URL = "http://localhost:5263"
const PROD_API_URL = "https://finbinserver-c7fadze8cwhuf3eu.eastus2-01.azurewebsites.net"

// Always use the production URL
const API_BASE_URL = "https://finbinserver-c7fadze8cwhuf3eu.eastus2-01.azurewebsites.net"

// Store demo data in memory for the current session
const demoStore = {
  buckets: [
    {
      id: 1,
      userId: 1,
      name: "Emergency Fund",
      targetAmount: 10000.0,
      currentSavedAmount: 2000.0,
      priorityScore: 0.9,
      deadline: new Date(Date.now() + 180 * 86400000).toISOString(), // 6 months from now
      status: "In Progress",
    },
    {
      id: 2,
      userId: 1,
      name: "Vacation",
      targetAmount: 3000.0,
      currentSavedAmount: 1500.0,
      priorityScore: 0.6,
      deadline: new Date(Date.now() + 90 * 86400000).toISOString(), // 3 months from now
      status: "In Progress",
    },
    {
      id: 3,
      userId: 1,
      name: "New Car",
      targetAmount: 20000.0,
      currentSavedAmount: 5000.0,
      priorityScore: 0.7,
      deadline: new Date(Date.now() + 365 * 86400000).toISOString(), // 1 year from now
      status: "In Progress",
    },
  ],
  transactions: [
    {
      id: 1,
      userId: 1,
      amount: -50.0,
      description: "Grocery Shopping",
      category: "Groceries",
      transactionDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      reference: "REF123",
      notes: "Weekly shopping",
      isReconciled: true,
    },
    {
      id: 2,
      userId: 1,
      amount: -120.0,
      description: "Electric Bill",
      category: "Utilities",
      transactionDate: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
      reference: "UTIL456",
      notes: "Monthly payment",
      isReconciled: true,
    },
    {
      id: 3,
      userId: 1,
      amount: 2500.0,
      description: "Salary Deposit",
      category: "Income",
      transactionDate: new Date(Date.now() - 15 * 86400000).toISOString(), // 15 days ago
      reference: "SAL789",
      notes: "Monthly salary",
      isReconciled: true,
    },
  ],
  recommendations: [
    {
      id: 1,
      category: "Savings",
      title: "Increase Emergency Fund",
      description:
        "Your emergency fund is below the recommended 3-month expense coverage. Consider allocating more to your Emergency Fund bucket.",
      potentialImpact: "High",
      difficulty: "Medium",
    },
    {
      id: 2,
      category: "Expenses",
      title: "Reduce Subscription Services",
      description:
        "You're spending $85 monthly on subscription services. Consider reviewing and canceling unused subscriptions.",
      potentialImpact: "Medium",
      difficulty: "Low",
    },
    {
      id: 3,
      category: "Debt",
      title: "Refinance Loans",
      description:
        "Current interest rates are lower than your existing loans. Refinancing could save you $150 monthly.",
      potentialImpact: "High",
      difficulty: "Medium",
    },
    {
      id: 4,
      category: "Income",
      title: "Explore Side Income",
      description: "Based on your skills, you could earn an additional $500-$1000 monthly through freelance work.",
      potentialImpact: "High",
      difficulty: "High",
    },
  ],
  nextId: 4, // Next ID to use for new items
}

// Add this function after the API_BASE_URL constant
function isDummyToken(token: string): boolean {
  return token.startsWith("dummy-token-")
}

// Get user ID from token
function getUserIdFromToken(token: string): number {
  if (isDummyToken(token)) {
    const parts = token.split("-")
    if (parts.length >= 3) {
      return Number.parseInt(parts[2], 10)
    }
  }
  return 1 // Default user ID
}

// Add this function to generate mock API responses
function generateMockResponse(endpoint: string, options: RequestInit = {}): any {
  // Extract the user ID from the token if available
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const userId = token ? getUserIdFromToken(token) : 1

  // Handle different endpoints
  if (endpoint.includes("/api/financial-summary/")) {
    return {
      Id: 1,
      SavingsBalance: 5000.0,
      InvestmentBalance: 15000.0,
      DebtBalance: 8000.0,
      UserId: userId,
      Income: {
        Id: 1,
        Salary: 5000.0,
        Investments: 200.0,
        BusinessIncome: 0.0,
        FinancialSummaryId: 1,
      },
      Expenses: {
        Id: 1,
        RentMortgage: 1200.0,
        Utilities: 200.0,
        Insurance: 150.0,
        LoanPayments: 300.0,
        Groceries: 400.0,
        Transportation: 150.0,
        Subscriptions: 50.0,
        Entertainment: 100.0,
        FinancialSummaryId: 1,
      },
    }
  }

  // Handle transactions endpoints
  if (endpoint.includes("/api/transactions")) {
    // Filter transactions by user ID
    return demoStore.transactions.filter((t) => t.userId === userId)
  }

  // Handle buckets endpoints
  if (endpoint.includes("/api/buckets")) {
    // Check if it's a specific bucket ID
    const bucketIdMatch = endpoint.match(/\/api\/buckets\/\d+\/(\d+)/)
    if (bucketIdMatch) {
      const bucketId = Number.parseInt(bucketIdMatch[1], 10)
      return demoStore.buckets.find((b) => b.id === bucketId && b.userId === userId)
    }

    // Return all buckets for the user
    return demoStore.buckets.filter((b) => b.userId === userId)
  }

  // Handle recommendations endpoint
  if (endpoint.includes("/api/ai-analysis/recommendations/")) {
    return demoStore.recommendations
  }

  // Default empty response
  return {}
}

// Handle demo bucket operations
function handleDemoBucketOperation(endpoint: string, options: RequestInit = {}): any {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const userId = token ? getUserIdFromToken(token) : 1

  // Handle bucket creation
  if (endpoint === "/api/buckets" && options.method === "POST") {
    const body = options.body ? JSON.parse(options.body as string) : {}
    const newBucket = {
      id: demoStore.nextId++,
      userId,
      name: body.name,
      targetAmount: Number.parseFloat(body.targetAmount) || 0,
      currentSavedAmount: Number.parseFloat(body.currentSavedAmount) || 0,
      priorityScore: Number.parseFloat(body.priorityScore) || 0.5,
      deadline: body.deadline || new Date(Date.now() + 180 * 86400000).toISOString(),
      status: body.status || "In Progress",
    }

    demoStore.buckets.push(newBucket)
    return newBucket
  }

  // Handle bucket update (priority)
  const priorityMatch = endpoint.match(/\/api\/buckets\/\d+\/(\d+)\/priority/)
  if (priorityMatch && options.method === "PUT") {
    const bucketId = Number.parseInt(priorityMatch[1], 10)
    const newPriority = options.body ? JSON.parse(options.body as string) : 0.5

    const bucketIndex = demoStore.buckets.findIndex((b) => b.id === bucketId && b.userId === userId)
    if (bucketIndex !== -1) {
      demoStore.buckets[bucketIndex].priorityScore = newPriority
      return { success: true, bucket: demoStore.buckets[bucketIndex] }
    }
  }

  // Handle bucket deletion
  const deleteMatch = endpoint.match(/\/api\/buckets\/\d+\/(\d+)/)
  if (deleteMatch && options.method === "DELETE") {
    const bucketId = Number.parseInt(deleteMatch[1], 10)

    const bucketIndex = demoStore.buckets.findIndex((b) => b.id === bucketId && b.userId === userId)
    if (bucketIndex !== -1) {
      demoStore.buckets.splice(bucketIndex, 1)
      return { success: true }
    }
  }

  // Handle transaction creation
  if (endpoint === "/api/transactions" && options.method === "POST") {
    const body = options.body ? JSON.parse(options.body as string) : {}
    const newTransaction = {
      id: demoStore.nextId++,
      userId,
      amount: Number.parseFloat(body.amount) || 0,
      description: body.description || "New Transaction",
      category: body.category || "Other",
      transactionDate: body.transactionDate || new Date().toISOString(),
      reference: body.reference || "",
      notes: body.notes || "",
      isReconciled: body.isReconciled || false,
    }

    demoStore.transactions.push(newTransaction)
    return newTransaction
  }

  return { success: false, error: "Operation not supported in demo mode" }
}

/**
 * Fetch wrapper with authentication and base URL handling
 */
export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Get the token from localStorage (if available)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // Check if this is a dummy token
  if (token && isDummyToken(token)) {
    console.log(`Using mock data for endpoint: ${endpoint}`)

    // For POST requests that create new resources or other operations
    if (options.method === "POST" || options.method === "PUT" || options.method === "DELETE") {
      // Handle bucket and transaction operations
      if (endpoint.includes("/api/buckets") || endpoint.includes("/api/transactions")) {
        return handleDemoBucketOperation(endpoint, options) as T
      }

      // For other POST requests, just return a success response
      return { success: true } as unknown as T
    }

    // For GET requests, return mock data
    return generateMockResponse(endpoint, options) as T
  }

  // Prepare headers with authentication if token exists
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  // Build the full URL
  const url = `${API_BASE_URL}${endpoint}`

  console.log(`Making API request to: ${url}`)
  console.log("Request options:", {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.parse(options.body as string) : undefined,
  })

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Log response status
  console.log(`Response status: ${response.status}`)

  // Handle non-2xx responses
  if (!response.ok) {
    // Try to get error message from response
    let errorMessage
    try {
      const errorData = await response.json()
      console.error("Error response:", errorData)
      errorMessage = errorData.message || `API error: ${response.status}`
    } catch (e) {
      errorMessage = `API error: ${response.status}`
    }

    throw new Error(errorMessage)
  }

  // Parse and return the response data
  const data = await response.json()
  console.log("Response data:", data)
  return data
}

