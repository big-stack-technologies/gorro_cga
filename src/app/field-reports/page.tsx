"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, 
  Users, 
  MapPin, 
  TrendingUp, 
  UserPlus, 
  CheckCircle, 
  MessageSquare,
  Calendar,
  ArrowLeft,
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Edit,
  X
} from "lucide-react"
import toast from "toastify-js"

interface Community {
  id: string
  name: string
  type: string
}

interface FieldReport {
  id: string
  reportDate: string
  community: {
    id: string
    name: string
    type: string
  } | null
  location: string | null
  prospectsApproached: number | null
  customerEngagements: number | null
  productDemonstrations: number | null
  newRegistrations: number | null
  kycFollowUps: number | null
  groupLeadersContacted: number | null
  groupsIdentified: number | null
  followUpsConducted: number | null
  customerObjections: string | null
  customerComplaints: string | null
  opportunitiesIdentified: string | null
  nextAction: string | null
}

export default function FieldReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingReports, setLoadingReports] = useState(true)
  const [communities, setCommunities] = useState<Community[]>([])
  const [pastReports, setPastReports] = useState<FieldReport[]>([])
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState<'create' | 'view' | 'edit'>('create')
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Form state
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])
  const [communityId, setCommunityId] = useState("")
  const [location, setLocation] = useState("")
  const [prospectsApproached, setProspectsApproached] = useState("")
  const [customerEngagements, setCustomerEngagements] = useState("")
  const [productDemonstrations, setProductDemonstrations] = useState("")
  const [newRegistrations, setNewRegistrations] = useState("")
  const [kycFollowUps, setKycFollowUps] = useState("")
  const [groupLeadersContacted, setGroupLeadersContacted] = useState("")
  const [groupsIdentified, setGroupsIdentified] = useState("")
  const [followUpsConducted, setFollowUpsConducted] = useState("")
  const [customerObjections, setCustomerObjections] = useState("")
  const [customerComplaints, setCustomerComplaints] = useState("")
  const [opportunitiesIdentified, setOpportunitiesIdentified] = useState("")
  const [nextAction, setNextAction] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchCommunities()
    fetchPastReports()
  }, [router])

  const fetchCommunities = async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("https://gorro.online/communities?limit=1000", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCommunities(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching communities:", error)
    }
  }

  const fetchPastReports = async () => {
    const token = localStorage.getItem("token")
    setLoadingReports(true)
    try {
      const response = await fetch("https://gorro.online/field-reports/mine", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setPastReports(data || [])
      }
    } catch (error) {
      console.error("Error fetching past reports:", error)
    } finally {
      setLoadingReports(false)
    }
  }

  const openViewModal = (report: FieldReport) => {
    setSelectedReport(report)
    setViewMode('view')
    setShowModal(true)
  }

  const openEditModal = (report: FieldReport) => {
    setSelectedReport(report)
    setReportDate(report.reportDate.split('T')[0])
    setCommunityId(report.community?.id || "")
    setLocation(report.location || "")
    setProspectsApproached(report.prospectsApproached?.toString() || "")
    setCustomerEngagements(report.customerEngagements?.toString() || "")
    setProductDemonstrations(report.productDemonstrations?.toString() || "")
    setNewRegistrations(report.newRegistrations?.toString() || "")
    setKycFollowUps(report.kycFollowUps?.toString() || "")
    setGroupLeadersContacted(report.groupLeadersContacted?.toString() || "")
    setGroupsIdentified(report.groupsIdentified?.toString() || "")
    setFollowUpsConducted(report.followUpsConducted?.toString() || "")
    setCustomerObjections(report.customerObjections || "")
    setCustomerComplaints(report.customerComplaints || "")
    setOpportunitiesIdentified(report.opportunitiesIdentified || "")
    setNextAction(report.nextAction || "")
    setViewMode('edit')
    setShowModal(true)
  }

  const openCreateModal = () => {
    setSelectedReport(null)
    resetForm()
    setViewMode('create')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedReport(null)
    setViewMode('create')
  }

  const validateNumber = (value: string): number | null => {
    if (!value || value.trim() === "") return null
    const num = parseInt(value)
    if (isNaN(num) || num < 0) return null
    return Math.min(num, 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const body: Record<string, unknown> = { reportDate }
    if (communityId) body.communityId = communityId
    if (location.trim()) body.location = location.trim()

    const prospectsNum = validateNumber(prospectsApproached)
    if (prospectsNum !== null) body.prospectsApproached = prospectsNum

    const engagementsNum = validateNumber(customerEngagements)
    if (engagementsNum !== null) body.customerEngagements = engagementsNum

    const demosNum = validateNumber(productDemonstrations)
    if (demosNum !== null) body.productDemonstrations = demosNum

    const regsNum = validateNumber(newRegistrations)
    if (regsNum !== null) body.newRegistrations = regsNum

    const kycNum = validateNumber(kycFollowUps)
    if (kycNum !== null) body.kycFollowUps = kycNum

    const leadersNum = validateNumber(groupLeadersContacted)
    if (leadersNum !== null) body.groupLeadersContacted = leadersNum

    const groupsNum = validateNumber(groupsIdentified)
    if (groupsNum !== null) body.groupsIdentified = groupsNum

    const followUpsNum = validateNumber(followUpsConducted)
    if (followUpsNum !== null) body.followUpsConducted = followUpsNum

    if (customerObjections.trim()) body.customerObjections = customerObjections.trim()
    if (customerComplaints.trim()) body.customerComplaints = customerComplaints.trim()
    if (opportunitiesIdentified.trim()) body.opportunitiesIdentified = opportunitiesIdentified.trim()
    if (nextAction.trim()) body.nextAction = nextAction.trim()

    try {
      const response = await fetch("https://gorro.online/field-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to submit report: ${response.status}`)
      }

      const data = await response.json()
      
      const successMessage = data.message || (data.created ? "Report filed successfully!" : "Report updated successfully!")
      
      toast({
        text: successMessage,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
          background: "linear-gradient(to right, #10b981, #059669)",
          color: "white",
        },
      }).showToast()

      await fetchPastReports()
      closeModal()
      resetForm()
    } catch (error) {
      console.error("Error submitting report:", error)
      toast({
        text: error instanceof Error ? error.message : "Failed to submit report",
        duration: 4000,
        gravity: "top",
        position: "right",
        style: {
          background: "linear-gradient(to right, #ef4444, #dc2626)",
          color: "white",
        },
      }).showToast()
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setReportDate(new Date().toISOString().split('T')[0])
    setCommunityId("")
    setLocation("")
    setProspectsApproached("")
    setCustomerEngagements("")
    setProductDemonstrations("")
    setNewRegistrations("")
    setKycFollowUps("")
    setGroupLeadersContacted("")
    setGroupsIdentified("")
    setFollowUpsConducted("")
    setCustomerObjections("")
    setCustomerComplaints("")
    setOpportunitiesIdentified("")
    setNextAction("")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                Field Reports
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your daily field activities</p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            {loadingReports ? (
              <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
                Loading reports...
              </div>
            ) : pastReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No reports filed yet</p>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Report
                </button>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="hidden sm:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Activities
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {pastReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(report.reportDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                              {report.location || 'No location'}
                            </span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-900 dark:text-white line-clamp-2">
                              {report.location || 'No location'}
                            </span>
                          </div>
                          {report.community && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                              {report.community.name}
                            </span>
                          )}
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-4 py-3">
                          <div className="flex flex-wrap gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            {report.prospectsApproached !== null && report.prospectsApproached > 0 && (
                              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                {report.prospectsApproached} prospects
                              </span>
                            )}
                            {report.newRegistrations !== null && report.newRegistrations > 0 && (
                              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-0.5 rounded">
                                {report.newRegistrations} new
                              </span>
                            )}
                            {report.customerEngagements !== null && report.customerEngagements > 0 && (
                              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-0.5 rounded">
                                {report.customerEngagements} engagements
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => openViewModal(report)}
                            className="px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {Math.ceil(pastReports.length / itemsPerPage) > 1 && (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {Math.ceil(pastReports.length / itemsPerPage)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(Math.ceil(pastReports.length / itemsPerPage), currentPage + 1))}
                      disabled={currentPage === Math.ceil(pastReports.length / itemsPerPage)}
                      className="p-1.5 sm:p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0  bg-transparent z-50 flex items-center justify-center p-2 sm:p-4" onClick={closeModal}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {viewMode === 'view' ? 'View Report' : viewMode === 'edit' ? 'Edit Report' : 'New Report'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {viewMode === 'view' && selectedReport ? (
                <ViewReportContent report={selectedReport} onEdit={() => openEditModal(selectedReport)} />
              ) : (
                <ReportForm
                  reportDate={reportDate}
                  setReportDate={setReportDate}
                  communityId={communityId}
                  setCommunityId={setCommunityId}
                  location={location}
                  setLocation={setLocation}
                  prospectsApproached={prospectsApproached}
                  setProspectsApproached={setProspectsApproached}
                  customerEngagements={customerEngagements}
                  setCustomerEngagements={setCustomerEngagements}
                  productDemonstrations={productDemonstrations}
                  setProductDemonstrations={setProductDemonstrations}
                  newRegistrations={newRegistrations}
                  setNewRegistrations={setNewRegistrations}
                  kycFollowUps={kycFollowUps}
                  setKycFollowUps={setKycFollowUps}
                  groupLeadersContacted={groupLeadersContacted}
                  setGroupLeadersContacted={setGroupLeadersContacted}
                  groupsIdentified={groupsIdentified}
                  setGroupsIdentified={setGroupsIdentified}
                  followUpsConducted={followUpsConducted}
                  setFollowUpsConducted={setFollowUpsConducted}
                  customerObjections={customerObjections}
                  setCustomerObjections={setCustomerObjections}
                  customerComplaints={customerComplaints}
                  setCustomerComplaints={setCustomerComplaints}
                  opportunitiesIdentified={opportunitiesIdentified}
                  setOpportunitiesIdentified={setOpportunitiesIdentified}
                  nextAction={nextAction}
                  setNextAction={setNextAction}
                  communities={communities}
                  loading={loading}
                  onSubmit={handleSubmit}
                  onCancel={closeModal}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ViewReportContent({ report, onEdit }: { report: FieldReport; onEdit: () => void }) {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">
              {new Date(report.reportDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          {report.location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">{report.location}</span>
            </div>
          )}
          {report.community && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{report.community.name} ({report.community.type})</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Activity Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {report.prospectsApproached !== null && <MetricCard label="Prospects" value={report.prospectsApproached} />}
          {report.customerEngagements !== null && <MetricCard label="Engagements" value={report.customerEngagements} />}
          {report.productDemonstrations !== null && <MetricCard label="Demos" value={report.productDemonstrations} />}
          {report.newRegistrations !== null && <MetricCard label="New Signups" value={report.newRegistrations} color="green" />}
          {report.kycFollowUps !== null && <MetricCard label="KYC Follow-ups" value={report.kycFollowUps} />}
          {report.groupLeadersContacted !== null && <MetricCard label="Leaders" value={report.groupLeadersContacted} />}
          {report.groupsIdentified !== null && <MetricCard label="Groups Found" value={report.groupsIdentified} />}
          {report.followUpsConducted !== null && <MetricCard label="Follow-ups" value={report.followUpsConducted} />}
        </div>
      </div>

      {(report.customerObjections || report.customerComplaints || report.opportunitiesIdentified || report.nextAction) && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Qualitative Feedback</h3>
          <div className="space-y-3">
            {report.customerObjections && <FeedbackSection title="Customer Objections" content={report.customerObjections} />}
            {report.customerComplaints && <FeedbackSection title="Customer Complaints" content={report.customerComplaints} />}
            {report.opportunitiesIdentified && <FeedbackSection title="Opportunities Identified" content={report.opportunitiesIdentified} />}
            {report.nextAction && <FeedbackSection title="Next Action" content={report.nextAction} />}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onEdit}
          className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Report
        </button>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color = 'blue' }: { label: string; value: number; color?: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  }

  return (
    <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-xl sm:text-2xl font-bold">{value}</div>
      <div className="text-xs mt-0.5">{label}</div>
    </div>
  )
}

function FeedbackSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{title}</h4>
      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{content}</p>
    </div>
  )
}

function ReportForm({ reportDate, setReportDate, communityId, setCommunityId, location, setLocation, prospectsApproached, setProspectsApproached, customerEngagements, setCustomerEngagements, productDemonstrations, setProductDemonstrations, newRegistrations, setNewRegistrations, kycFollowUps, setKycFollowUps, groupLeadersContacted, setGroupLeadersContacted, groupsIdentified, setGroupsIdentified, followUpsConducted, setFollowUpsConducted, customerObjections, setCustomerObjections, customerComplaints, setCustomerComplaints, opportunitiesIdentified, setOpportunitiesIdentified, nextAction, setNextAction, communities, loading, onSubmit, onCancel }: any) {
  return (
    <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Report Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Community</label>
            <select value={communityId} onChange={(e) => setCommunityId(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
              <option value="">Select (optional)</option>
              {communities.map((community: Community) => (
                <option key={community.id} value={community.id}>{community.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={255} placeholder="e.g., Watt Market, Calabar" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Activity Metrics</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">All fields optional</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FormInput label="Prospects" value={prospectsApproached} onChange={setProspectsApproached} />
          <FormInput label="Engagements" value={customerEngagements} onChange={setCustomerEngagements} />
          <FormInput label="Demos" value={productDemonstrations} onChange={setProductDemonstrations} />
          <FormInput label="New Signups" value={newRegistrations} onChange={setNewRegistrations} />
          <FormInput label="KYC Follow-ups" value={kycFollowUps} onChange={setKycFollowUps} />
          <FormInput label="Leaders" value={groupLeadersContacted} onChange={setGroupLeadersContacted} />
          <FormInput label="Groups Found" value={groupsIdentified} onChange={setGroupsIdentified} />
          <FormInput label="Follow-ups" value={followUpsConducted} onChange={setFollowUpsConducted} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Qualitative Feedback</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">These notes are what managers read</p>
        <div className="space-y-3">
          <FormTextarea label="Customer Objections" value={customerObjections} onChange={setCustomerObjections} placeholder="Why did people say no?" />
          <FormTextarea label="Customer Complaints" value={customerComplaints} onChange={setCustomerComplaints} placeholder="What issues did customers raise?" />
          <FormTextarea label="Opportunities" value={opportunitiesIdentified} onChange={setOpportunitiesIdentified} placeholder="What opportunities did you spot?" />
          <FormTextarea label="Next Action" value={nextAction} onChange={setNextAction} placeholder="What will you do next?" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </form>
  )
}

function FormInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} min="0" max="500" placeholder="0" className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
    </div>
  )
}

function FormTextarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} maxLength={2000} rows={3} placeholder={placeholder} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none" />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{value.length}/2000</p>
    </div>
  )
}
