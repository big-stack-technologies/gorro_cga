"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  TrendingUp, 
  Settings,
  Search,
  MoreVertical,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react"

interface SummaryData {
  referralCode: string
  totalCustomers: number
  customersUnderManagementValue: number
  referralBonusEarned: number
}

interface Customer {
  id: string
  name: string
  email: string
  phoneNumber: string
  joinedAt: string
  kycTier: number
  status: string
  walletBalance: number
}

interface CustomerDetail {
  profile: {
    id: string
    name: string
    email: string
    phoneNumber: string
    gender: string
    kycTier: number
    status: string
    emailVerified: boolean
    phoneNumberVerified: boolean
    referralCode: string
    joinedAt: string
  }
  walletBalance: number
  accounts: Array<{
    name: string
    accountType: string
    balance: number
    currency: string
  }>
  savings: Array<{
    id: string
    type: string
    status: string
    name: string
    principal: number
    accruedInterest: number
    projectedInterest: number
    maturityDate: string
  }>
  clusters: Array<{
    clusterId: string
    name: string
    role: string
    status: string
  }>
  recentActivity: Array<{
    type: string
    direction: string
    status: string
    amount: number
    description: string
    date: string
  }>
}

interface CustomersResponse {
  page: number
  limit: number
  total: number
  data: Customer[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [customers, setCustomers] = useState<CustomersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchData = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const [summaryRes, customersRes] = await Promise.all([
        fetch("https://gorro.online/cga/summary", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("https://gorro.online/cga/customers?limit=20", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        setSummary(summaryData)
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setTimeout(() => fetchData(), 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    router.push("/login")
  }

  const filteredCustomers = customers?.data.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || customer.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const fetchCustomerDetail = async (customerId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    setLoadingDetail(true)
    try {
      const response = await fetch(`https://gorro.online/cga/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedCustomer(data)
      }
    } catch (error) {
      console.error("Error fetching customer detail:", error)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleViewDetails = (customerId: string) => {
    setDropdownOpen(null)
    fetchCustomerDetail(customerId)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-blue-600">CGA</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Community Growth Associate</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Users className="w-5 h-5" />
            Customers
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Wallet className="w-5 h-5" />
            Earnings
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <TrendingUp className="w-5 h-5" />
            Analytics
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">CGA Agent</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Referral: {summary?.referralCode || "Loading..."}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-0 flex flex-col">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-30 p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, CGA Agent!</p>
            </div>
            <div className="flex gap-3">
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-8">

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Customers</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{loading ? "..." : summary?.totalCustomers || 0}</p>
              <p className="text-sm text-blue-600 mt-2 break-words">Referral Code: {summary?.referralCode || "..."}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Book Value</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-words">{loading ? "..." : `₦${(summary?.customersUnderManagementValue || 0).toLocaleString()}`}</p>
              <p className="text-sm text-green-600 mt-2">Under Management</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Referral Bonus</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-words">{loading ? "..." : `₦${(summary?.referralBonusEarned || 0).toLocaleString()}`}</p>
              <p className="text-sm text-green-600 mt-2">Total Earned</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Customers</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{loading ? "..." : customers?.data.filter(c => c.status === "ACTIVE").length || 0}</p>
              <p className="text-sm text-green-600 mt-2">Currently Active</p>
            </div>
          </div>


          {/* Customers Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Referred Customers</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full sm:w-auto"
                  >
                    <option value="All">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">KYC Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wallet Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        Loading customers...
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{customer.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{customer.phoneNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {new Date(customer.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
                            Tier {customer.kycTier}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            customer.status === "ACTIVE" 
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">
                          ₦{customer.walletBalance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap relative">
                          <div className="relative">
                            <button 
                              onClick={() => setDropdownOpen(dropdownOpen === customer.id ? null : customer.id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {dropdownOpen === customer.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                <button
                                  onClick={() => handleViewDetails(customer.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                                >
                                  View Details
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredCustomers.length} of {customers?.total || 0} customers
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto my-4 lg:my-0">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Details</h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <MoreVertical className="w-6 h-6 rotate-45" />
              </button>
            </div>
            {loadingDetail ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                Loading customer details...
              </div>
            ) : (
              <div className="p-6">
                {/* Profile Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.profile.name}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.profile.email}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.profile.phoneNumber}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.profile.gender}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">KYC Tier</p>
                      <p className="font-medium text-gray-900 dark:text-white">Tier {selectedCustomer.profile.kycTier}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedCustomer.profile.status === "ACTIVE" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}>
                        {selectedCustomer.profile.status}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email Verified</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.profile.emailVerified ? "Yes" : "No"}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone Verified</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.profile.phoneNumberVerified ? "Yes" : "No"}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Referral Code</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.profile.referralCode}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Joined Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedCustomer.profile.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wallet Balance</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₦{selectedCustomer.walletBalance.toLocaleString()}</p>
                  </div>
                </div>

                {/* Accounts */}
                {selectedCustomer.accounts.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accounts</h3>
                    <div className="space-y-2">
                      {selectedCustomer.accounts.map((account, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{account.accountType}</p>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white">{account.currency} {account.balance.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Savings */}
                {selectedCustomer.savings.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Savings</h3>
                    <div className="space-y-2">
                      {selectedCustomer.savings.map((saving) => (
                        <div key={saving.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{saving.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{saving.type} - {saving.status}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              saving.status === "ACTIVE" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                            }`}>
                              {saving.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Principal</p>
                              <p className="font-medium text-gray-900 dark:text-white">₦{saving.principal.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Accrued Interest</p>
                              <p className="font-medium text-gray-900 dark:text-white">₦{saving.accruedInterest.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Projected Interest</p>
                              <p className="font-medium text-gray-900 dark:text-white">₦{saving.projectedInterest.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Maturity Date</p>
                              <p className="font-medium text-gray-900 dark:text-white">{new Date(saving.maturityDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clusters */}
                {selectedCustomer.clusters.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clusters</h3>
                    <div className="space-y-2">
                      {selectedCustomer.clusters.map((cluster) => (
                        <div key={cluster.clusterId} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{cluster.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{cluster.role}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            cluster.status === "ACTIVE" 
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                            }`}>
                            {cluster.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {selectedCustomer.recentActivity.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                    <div className="space-y-2">
                      {selectedCustomer.recentActivity.map((activity, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{activity.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.type} - {activity.direction}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              activity.direction === "INBOUND" ? "text-green-600" : "text-red-600"
                            }`}>
                              {activity.direction === "INBOUND" ? "+" : "-"}₦{activity.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(activity.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
