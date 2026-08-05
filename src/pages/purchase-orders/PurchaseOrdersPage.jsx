import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FiAlertTriangle,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiDownload,
  FiEye,
  FiFilter,
  FiGrid,
  FiMapPin,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTruck,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi'
import api from '../../api/axiosInstance'

const statuses = ['All', 'Pending', 'Approved', 'Received', 'Rejected']
const priorities = ['All', 'High', 'Medium', 'Normal', 'Low']

const REORDER_CACHE_KEY = 'purchaseOrderReorderRecommendations'
const SUPPLIER_SCORECARD_CACHE_KEY = 'purchaseOrderSupplierScorecards'
const PURCHASE_ORDER_CACHE_KEY = 'purchaseOrderRecords'
const PURCHASE_ORDER_SELECTION_CACHE_KEY = 'purchaseOrderSelectedId'

const readCachedList = (key) => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeCachedList = (key, value) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage write issues and keep the UI working.
  }
}

const readCachedValue = (key) => {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeCachedValue = (key, value) => {
  if (typeof window === 'undefined') return

  try {
    if (value === null || value === undefined || value === '') {
      window.localStorage.removeItem(key)
      return
    }

    window.localStorage.setItem(key, String(value))
  } catch {
    // Ignore storage write issues and keep the UI working.
  }
}

const isDemoRecommendation = (item) => String(item?.id ?? '').startsWith('demo-rec-')
const isDemoSupplierScorecard = (item) => String(item?.id ?? '').startsWith('demo-supplier-')

const readLiveCachedList = (key, predicate) => readCachedList(key).filter((item) => !predicate(item))

const cn = (...classes) => classes.filter(Boolean).join(' ')

const buttonBase = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border-0 px-4 font-extrabold transition duration-200 hover:-translate-y-0.5'
const panelClass = 'rounded-[24px] border border-[#dbe4f0] bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.06)]'
const sectionLabel = 'm-0 text-[11px] font-black uppercase tracking-[0.14em] text-[#5b7cff]'
const headingTwo = 'mt-1.5 text-[24px] font-black leading-tight tracking-[-0.02em] text-[#1b2340]'

const kpiToneClasses = {
  value: 'text-[#4f46e5] bg-[#ecebff]',
  warning: 'text-[#9a6700] bg-[#fff3d8]',
  success: 'text-[#0891b2] bg-[#e0f7ff]',
  danger: 'text-[#b42318] bg-[#ffebe8]',
  info: 'text-[#2563eb] bg-[#e4edff]',
}

const statusBadgeClasses = {
  Pending: 'text-[#9a6700] bg-[#fff1d6]',
  Approved: 'text-[#4f46e5] bg-[#ecebff]',
  Received: 'text-[#0891b2] bg-[#e0f7ff]',
  Rejected: 'text-[#9f1d2f] bg-[#ffe6ea]',
}

const priorityBadgeClasses = {
  High: 'text-[#9f1d2f] bg-[#ffe6ea]',
  Medium: 'text-[#9a6700] bg-[#fff1d6]',
  Normal: 'text-[#2563eb] bg-[#e4edff]',
  Low: 'text-[#4f46e5] bg-[#ecebff]',
}

const urgencyBadgeClasses = {
  CRITICAL: 'bg-[#fff0ee] text-[#bb271a]',
  HIGH: 'bg-[#fff6db] text-[#9b5a00]',
  MEDIUM: 'bg-[#e0f7ff] text-[#0891b2]',
}

const parseAmount = (amount) => {
  if (typeof amount === 'number' && Number.isFinite(amount)) return amount

  const match = String(amount).match(/-?\d[\d,]*(?:\.\d+)?/)
  if (!match) return 0

  return Number(match[0].replace(/,/g, '')) || 0
}

const formatAmount = (amount) =>
  `Rs. ${parseAmount(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatPercent = (value, fallback = 0) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return `${fallback}%`
  return `${Math.round(numeric)}%`
}

const normalizeStatus = (status) => {
  const normalized = String(status || 'Pending').trim().toUpperCase()
  if (normalized === 'APPROVED') return 'Approved'
  if (normalized === 'REJECTED') return 'Rejected'
  if (normalized === 'RECEIVED') return 'Received'
  if (normalized === 'CANCELLED') return 'Rejected'
  return 'Pending'
}

const normalizeOrder = (order) => ({
  id: order.id ?? order._id,
  po: order.po ?? order.poNumber ?? 'PO-PENDING',
  supplier: order.supplier ?? order.supplierName ?? '',
  branch:
    typeof (order.branch ?? '') === 'object'
      ? order.branch?.name ?? order.branch?.branchName ?? order.branch?.label ?? ''
      : order.branch ?? '',
  date: order.date ?? order.orderDate ?? '',
  expectedDate: order.expectedDate ?? order.deliveryDate ?? 'Not scheduled',
  totalAmount: parseAmount(order.totalAmount ?? order.amount ?? 0),
  amount: formatAmount(order.totalAmount ?? order.amount ?? 0),
  status: normalizeStatus(order.status),
  priority: order.priority ?? 'Normal',
  items: Array.isArray(order.items) ? order.items.length : order.items ?? order.itemCount ?? 1,
  category: order.category ?? 'Mixed Stock',
  owner: order.owner ?? 'Procurement Team',
})

const normalizeSupplierOption = (supplier) => ({
  id: supplier._id ?? supplier.id,
  label: supplier.companyName ?? supplier.name ?? 'Unknown supplier',
})

const normalizeBranchOption = (branch) => ({
  id: branch._id ?? branch.id,
  label: branch.name ?? branch.branchName ?? branch.code ?? 'Unknown branch',
})

const normalizeRecommendation = (recommendation) => {
  const stock = Number(recommendation.currentStock ?? recommendation.quantity ?? 0)
  const reorderPoint = 50 // Hardcoded to 50 units
  const avgDailySales = Number(recommendation.avgDailySales ?? 0)

  return {
    id: recommendation.id ?? recommendation._id ?? recommendation.productId ?? recommendation.name,
    item: recommendation.product?.name ?? recommendation.name ?? 'Unknown product',
    branch: recommendation.branch?.name ?? recommendation.branchName ?? 'All branches',
    stock,
    reorder: Number(recommendation.recommendedQuantity ?? recommendation.suggestedOrderQty ?? 0),
    confidence: formatPercent(
      avgDailySales > 0
        ? Math.min(99, Math.max(55, (stock <= reorderPoint ? 90 : 72) + avgDailySales))
        : recommendation.lowStock || stock <= reorderPoint
          ? 88
          : 70,
      70,
    ),
    supplier: recommendation.product?.supplierName ?? recommendation.supplierName ?? 'Assigned supplier pending',
    urgency: String(recommendation.urgency ?? 'MEDIUM').toUpperCase(),
  }
}

const normalizeSupplierScorecard = (supplier) => ({
  id: supplier.id,
  name: supplier.companyName ?? 'Unknown supplier',
  score: Number(supplier.performance?.onTimeDelivery ?? supplier.rating ?? 0),
  metric:
    Number(supplier.performance?.onTimeDelivery ?? 0) >= 90
      ? 'On-time delivery'
      : Number(supplier.performance?.qualityScore ?? 0) >= 90
        ? 'Quality score'
        : 'Supplier rating',
  open: Number(supplier.totalSpend ?? 0),
  purchaseOrders: Number(supplier.purchaseOrderCount ?? supplier.metrics?.purchaseOrderCount ?? 0),
})

const getWorkflowStage = (status) => {
  switch (status) {
    case 'Rejected':
      return 2
    case 'Approved':
      return 3
    case 'Received':
      return 4
    case 'Pending':
    default:
      return 2
  }
}

function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState(() => readCachedList(PURCHASE_ORDER_CACHE_KEY))
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(() => {
    const cachedOrders = readCachedList(PURCHASE_ORDER_CACHE_KEY)
    const cachedSelectedId = readCachedValue(PURCHASE_ORDER_SELECTION_CACHE_KEY)
    return cachedOrders.find((item) => item.id === cachedSelectedId) ?? cachedOrders[0] ?? null
  })
  const [reorderRecommendations, setReorderRecommendations] = useState(() =>
    readLiveCachedList(REORDER_CACHE_KEY, isDemoRecommendation),
  )
  const [supplierScorecards, setSupplierScorecards] = useState(() =>
    readLiveCachedList(SUPPLIER_SCORECARD_CACHE_KEY, isDemoSupplierScorecard),
  )
  const [supplierOptions, setSupplierOptions] = useState([])
  const [branchOptions, setBranchOptions] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [branchFilter, setBranchFilter] = useState('All')
  const [lastSync, setLastSync] = useState('Ready')
  const [apiMessage, setApiMessage] = useState('Loading MongoDB purchase order data...')
  const [apiMessageTone, setApiMessageTone] = useState('info')
  const [flashMessage, setFlashMessage] = useState(null)
  const [createOrderSuccessMessage, setCreateOrderSuccessMessage] = useState('')
  const [form, setForm] = useState({
    supplierId: '',
    branchId: '',
    date: new Date().toISOString().slice(0, 10),
    expectedDate: '',
    amount: '',
    priority: 'Normal',
    category: '',
    items: 1,
  })

  const loadPurchaseOrders = useCallback(async () => {
    try {
      setApiMessageTone('info')
      const response = await api.get('/purchase-orders')
      const orders = Array.isArray(response.data) ? response.data : []
      if (orders.length > 0) {
        const normalized = orders.map(normalizeOrder)
        setPurchaseOrders(normalized)
        writeCachedList(PURCHASE_ORDER_CACHE_KEY, normalized)
        setSelectedOrder((current) => {
          const cachedSelectedId = readCachedValue(PURCHASE_ORDER_SELECTION_CACHE_KEY)
          const nextSelected =
            normalized.find((item) => item.id === current?.id) ??
            normalized.find((item) => item.id === cachedSelectedId) ??
            normalized[0]
          writeCachedValue(PURCHASE_ORDER_SELECTION_CACHE_KEY, nextSelected?.id ?? '')
          return nextSelected
        })
      } else {
        const cachedOrders = readCachedList(PURCHASE_ORDER_CACHE_KEY)
        if (cachedOrders.length > 0) {
          setPurchaseOrders(cachedOrders)
          setSelectedOrder((current) =>
            cachedOrders.find((item) => item.id === current?.id) ??
            cachedOrders.find((item) => item.id === readCachedValue(PURCHASE_ORDER_SELECTION_CACHE_KEY)) ??
            cachedOrders[0] ??
            null,
          )
          setApiMessage('Showing the last successful purchase order snapshot while MongoDB reloads')
          setApiMessageTone('warning')
          return
        }

        setPurchaseOrders([])
        setSelectedOrder(null)
      }
      setApiMessage('Connected to MongoDB purchase orders')
      setApiMessageTone('success')
      setLastSync(`Synced ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
    } catch (error) {
      const cachedOrders = readCachedList(PURCHASE_ORDER_CACHE_KEY)
      if (cachedOrders.length > 0) {
        setPurchaseOrders(cachedOrders)
        setSelectedOrder((current) =>
          cachedOrders.find((item) => item.id === current?.id) ??
          cachedOrders.find((item) => item.id === readCachedValue(PURCHASE_ORDER_SELECTION_CACHE_KEY)) ??
          cachedOrders[0] ??
          null,
        )
        setApiMessage('Showing cached purchase orders because MongoDB could not be reached right now.')
        setApiMessageTone('warning')
        return
      }

      setPurchaseOrders([])
      setSelectedOrder(null)
      setApiMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Could not load purchase orders from MongoDB.',
      )
      setApiMessageTone('error')
    }
  }, [])

  const loadReferenceData = useCallback(async () => {
    try {
      const [supplierResponse, branchResponse] = await Promise.all([
        api.get('/suppliers'),
        api.get('/branches'),
      ])

      const suppliers = Array.isArray(supplierResponse.data?.data) ? supplierResponse.data.data : []
      const branches = Array.isArray(branchResponse.data) ? branchResponse.data : []

      const normalizedSuppliers = suppliers
        .map(normalizeSupplierOption)
        .filter((item) => item.id && item.label)
      const normalizedBranches = branches
        .map(normalizeBranchOption)
        .filter((item) => item.id && item.label)

      setSupplierOptions(normalizedSuppliers)
      setBranchOptions(normalizedBranches)
      setForm((current) => ({
        ...current,
        supplierId: current.supplierId || normalizedSuppliers[0]?.id || '',
        branchId: current.branchId || normalizedBranches[0]?.id || '',
      }))
    } catch (error) {
      setSupplierOptions([])
      setBranchOptions([])
      setApiMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Could not load suppliers or branches from MongoDB.',
      )
      setApiMessageTone('error')
    }
  }, [])

  const loadInsightCards = useCallback(async () => {
    try {
      const [reorderResult, supplierResult] = await Promise.allSettled([
        api.get('/reorders/suggestions?limit=3&includeAll=true'),
        api.get('/suppliers/reports/performance'),
      ])

      const reorderData =
        reorderResult.status === 'fulfilled' && Array.isArray(reorderResult.value.data?.data)
          ? reorderResult.value.data.data
          : []
      const shouldLoadRecommendationFallback = reorderData.length === 0
      const supplierData =
        supplierResult.status === 'fulfilled' && Array.isArray(supplierResult.value.data?.data)
          ? supplierResult.value.data.data
          : []

      let recommendationFallbackData = []
      if (shouldLoadRecommendationFallback) {
        try {
          const fallbackResponse = await api.get('/recommendations/inventory/low-stock?limit=3')
          recommendationFallbackData = Array.isArray(fallbackResponse.data?.data)
            ? fallbackResponse.data.data
            : []
        } catch {
          recommendationFallbackData = []
        }
      }

      const normalizedRecommendations = (reorderData.length > 0 ? reorderData : recommendationFallbackData)
        .map(normalizeRecommendation)
        .filter((item) => item.id && item.item)
      const normalizedSupplierScorecards = supplierData
        .map(normalizeSupplierScorecard)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          return b.purchaseOrders - a.purchaseOrders
        })
        .slice(0, 3)
      const cachedRecommendations = readLiveCachedList(REORDER_CACHE_KEY, isDemoRecommendation)
      const cachedSupplierScorecards = readLiveCachedList(
        SUPPLIER_SCORECARD_CACHE_KEY,
        isDemoSupplierScorecard,
      )
      const resolvedRecommendations =
        normalizedRecommendations.length > 0 ? normalizedRecommendations : cachedRecommendations
      const resolvedSupplierScorecards =
        normalizedSupplierScorecards.length > 0 ? normalizedSupplierScorecards : cachedSupplierScorecards

      setReorderRecommendations(resolvedRecommendations)
      setSupplierScorecards(resolvedSupplierScorecards)

      if (normalizedRecommendations.length > 0) {
        writeCachedList(REORDER_CACHE_KEY, normalizedRecommendations)
      }

      if (normalizedSupplierScorecards.length > 0) {
        writeCachedList(SUPPLIER_SCORECARD_CACHE_KEY, normalizedSupplierScorecards)
      }

      if (reorderResult.status === 'fulfilled' && reorderData.length > 0 && supplierResult.status === 'fulfilled') {
        setApiMessage('Connected to live reorder suggestions and supplier scorecards')
        setApiMessageTone('success')
        return
      }

      if (normalizedRecommendations.length > 0 && supplierResult.status === 'fulfilled') {
        setApiMessage('Showing AI reorder suggestions from the recommendation engine and live supplier scorecards')
        setApiMessageTone('success')
        return
      }

      if (resolvedRecommendations.length > 0 && resolvedSupplierScorecards.length > 0) {
        setApiMessage('Showing the last successful reorder suggestions and supplier scorecards while live data reloads')
        setApiMessageTone('warning')
        return
      }

      if (supplierResult.status === 'fulfilled') {
        setApiMessage('Connected to live supplier scorecards. Reorder suggestions are unavailable right now')
        setApiMessageTone('warning')
        return
      }

      if (resolvedRecommendations.length > 0) {
        setApiMessage('Connected to live reorder suggestions. Supplier scorecards are unavailable right now')
        setApiMessageTone('warning')
        return
      }

      throw reorderResult.reason || supplierResult.reason || new Error('Insight endpoints are unavailable')
    } catch (error) {
      const cachedRecommendations = readLiveCachedList(REORDER_CACHE_KEY, isDemoRecommendation)
      const cachedSupplierScorecards = readLiveCachedList(
        SUPPLIER_SCORECARD_CACHE_KEY,
        isDemoSupplierScorecard,
      )

      setReorderRecommendations(cachedRecommendations)
      setSupplierScorecards(cachedSupplierScorecards)
      setApiMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Could not load live reorder suggestions or supplier scorecards from MongoDB.',
      )
      setApiMessageTone('error')
    }
  }, [])

  useEffect(() => {
    loadPurchaseOrders()
  }, [loadPurchaseOrders])

  useEffect(() => {
    loadReferenceData()
  }, [loadReferenceData])

  useEffect(() => {
    loadInsightCards()
  }, [loadInsightCards])

  useEffect(() => {
    writeCachedList(PURCHASE_ORDER_CACHE_KEY, purchaseOrders)
  }, [purchaseOrders])

  useEffect(() => {
    writeCachedValue(PURCHASE_ORDER_SELECTION_CACHE_KEY, selectedOrder?.id ?? '')
  }, [selectedOrder])

  useEffect(() => {
    if (!flashMessage) return undefined

    const timer = window.setTimeout(() => {
      setFlashMessage(null)
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [flashMessage])

  const branchFilterOptions = useMemo(
    () => ['All', ...new Set(purchaseOrders.map((order) => order.branch).filter(Boolean))],
    [purchaseOrders],
  )

  const filteredOrders = useMemo(() => {
    const search = query.trim().toLowerCase()
    return purchaseOrders.filter((order) => {
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter
      const matchesPriority = priorityFilter === 'All' || order.priority === priorityFilter
      const matchesBranch = branchFilter === 'All' || order.branch === branchFilter
      const matchesSearch =
        !search ||
        [order.po, order.supplier, order.branch, order.category, order.owner].some((value) =>
          String(value).toLowerCase().includes(search),
        )
      return matchesStatus && matchesPriority && matchesBranch && matchesSearch
    })
  }, [branchFilter, priorityFilter, purchaseOrders, query, statusFilter])

  const kpis = useMemo(() => {
    const pending = purchaseOrders.filter((order) => order.status === 'Pending').length
    const approved = purchaseOrders.filter((order) => order.status === 'Approved').length
    const totalValue = purchaseOrders.reduce((sum, order) => sum + parseAmount(order.amount), 0)
    const highPriority = purchaseOrders.filter((order) => order.priority === 'High').length

    return [
      { label: 'Open PO Value', value: `Rs. ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, trend: 'Combined live order value', icon: FiBarChart2, tone: 'value' },
      { label: 'Pending Approval', value: pending.toString(), trend: 'Orders waiting for review', icon: FiShield, tone: 'warning' },
      { label: 'Approved Orders', value: approved.toString(), trend: 'Ready for supplier dispatch', icon: FiCheckCircle, tone: 'success' },
      { label: 'AI Reorder Alerts', value: reorderRecommendations.length.toString(), trend: 'Low-stock suggestions live', icon: FiAlertTriangle, tone: 'danger' },
      { label: 'High Priority', value: highPriority.toString(), trend: 'Orders needing fast action', icon: FiTruck, tone: 'info' },
    ]
  }, [purchaseOrders, reorderRecommendations.length])

  const activeBranchCount = useMemo(
    () => new Set(purchaseOrders.map((order) => order.branch).filter(Boolean)).size,
    [purchaseOrders],
  )

  const averageOrderValue = useMemo(() => {
    if (!purchaseOrders.length) return 0
    const totalValue = purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    return totalValue / purchaseOrders.length
  }, [purchaseOrders])

  const selectedOrderSummary = useMemo(() => {
    if (!selectedOrder) return []

    return [
      {
        label: 'Created',
        value: selectedOrder.date || 'Not set',
        icon: FiCalendar,
      },
      {
        label: 'Expected',
        value: selectedOrder.expectedDate || 'Not set',
        icon: FiClock,
      },
      {
        label: 'Branch',
        value: selectedOrder.branch || 'Not assigned',
        icon: FiMapPin,
      },
      {
        label: 'Items',
        value: `${selectedOrder.items} line items`,
        icon: FiGrid,
      },
    ]
  }, [selectedOrder])

  const heroHighlights = useMemo(
    () => [
      { label: 'Pending approvals', value: purchaseOrders.filter((order) => order.status === 'Pending').length.toString() },
      { label: 'Branches in view', value: activeBranchCount.toString() },
      { label: 'Last sync', value: lastSync.replace('Synced ', '') },
    ],
    [activeBranchCount, lastSync, purchaseOrders],
  )

  const workflowSteps = useMemo(() => {
    const currentStage = getWorkflowStage(selectedOrder?.status)
    const baseSteps = [
      {
        title: 'Draft created',
        detail: selectedOrder?.date ? `Order created on ${selectedOrder.date}` : 'Tracked in the order audit trail',
      },
      {
        title: 'Manager review',
        detail: selectedOrder?.owner ? `Current owner: ${selectedOrder.owner}` : 'Tracked in the order audit trail',
      },
      {
        title: 'Approval decision',
        detail: selectedOrder?.status ? `Current status: ${selectedOrder.status}` : 'Tracked in the order audit trail',
      },
      {
        title: 'Goods receiving',
        detail:
          selectedOrder?.status === 'Received'
            ? 'Inventory updates confirmed for this order'
            : 'Inventory updates after receiving notes are confirmed',
      },
    ]

    return baseSteps.map((step, index) => ({
      ...step,
      number: index + 1,
      active: index + 1 <= currentStage,
    }))
  }, [selectedOrder])

  const updateOrderStatus = async (order, status) => {
    if (!order.id) {
      setApiMessage('Only MongoDB purchase orders can be updated.')
      setApiMessageTone('warning')
      return
    }

    try {
      const response = await api.patch(`/purchase-orders/${order.id}/status`, { status })
      const updatedOrder = normalizeOrder(response.data)
      setPurchaseOrders((orders) => {
        const nextOrders = orders.map((item) => (item.id === updatedOrder.id ? updatedOrder : item))
        writeCachedList(PURCHASE_ORDER_CACHE_KEY, nextOrders)
        return nextOrders
      })
      setSelectedOrder(updatedOrder)
      writeCachedValue(PURCHASE_ORDER_SELECTION_CACHE_KEY, updatedOrder.id)
      setApiMessage(`${updatedOrder.po} saved as ${status}`)
      setApiMessageTone('success')
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Could not save status. Check backend and MongoDB connection.'
      setApiMessage(message)
      setApiMessageTone('error')
    }
  }

  const handleCreateOrder = async (event) => {
    event.preventDefault()

    const selectedSupplier = supplierOptions.find((item) => item.id === form.supplierId)
    const selectedBranch = branchOptions.find((item) => item.id === form.branchId)

    const orderPayload = {
      supplier: selectedSupplier?.label ?? '',
      supplierId: form.supplierId,
      branch: form.branchId,
      date: form.date,
      expectedDate: form.expectedDate || form.date,
      amount: Number(form.amount),
      priority: form.priority || 'Normal',
      category: form.category.trim() || 'Mixed Stock',
      items: Number(form.items) || 1,
    }

    if (!orderPayload.supplier || !selectedBranch?.label || !orderPayload.date || orderPayload.amount <= 0) {
      setApiMessage('Select a MongoDB supplier, a MongoDB branch, and enter a valid amount.')
      setApiMessageTone('warning')
      return
    }

    try {
      setIsSubmittingOrder(true)
      const response = await api.post('/purchase-orders', orderPayload)
      const createdOrder = normalizeOrder({
        ...response.data,
        supplier: response.data?.supplier || selectedSupplier?.label || orderPayload.supplier,
        branch: response.data?.branch || selectedBranch?.label,
      })
      setPurchaseOrders((orders) => {
        const nextOrders = [
          createdOrder,
          ...orders.filter((item) => item.id !== createdOrder.id && item.po !== createdOrder.po),
        ]
        writeCachedList(PURCHASE_ORDER_CACHE_KEY, nextOrders)
        return nextOrders
      })
      setSelectedOrder(createdOrder)
      writeCachedValue(PURCHASE_ORDER_SELECTION_CACHE_KEY, createdOrder.id)
      const successMessage = `${createdOrder.po} added successfully and displayed in the list.`
      setApiMessage(successMessage)
      setApiMessageTone('success')
      setFlashMessage({
        tone: 'success',
        text: successMessage,
      })
      setCreateOrderSuccessMessage(successMessage)
      setForm({
        supplierId: supplierOptions[0]?.id || '',
        branchId: branchOptions[0]?.id || '',
        date: new Date().toISOString().slice(0, 10),
        expectedDate: '',
        amount: '',
        priority: 'Normal',
        category: '',
        items: 1,
      })
      await loadPurchaseOrders()
      window.setTimeout(() => {
        setCreateOrderSuccessMessage('')
        setIsCreateOpen(false)
      }, 1800)
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Purchase order was not saved to MongoDB.'
      setApiMessage(message)
      setApiMessageTone('error')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const handleExport = () => {
    const headers = ['PO Number', 'Supplier', 'Branch', 'Date', 'Expected', 'Amount', 'Status', 'Priority', 'Items']
    const rows = filteredOrders.map((order) => [
      order.po,
      order.supplier,
      order.branch,
      order.date,
      order.expectedDate,
      order.amount,
      order.status,
      order.priority,
      order.items,
    ])
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'purchase-orders.csv'
    link.click()
    URL.revokeObjectURL(url)
    setApiMessage(`Exported ${filteredOrders.length} purchase orders`)
    setApiMessageTone('success')
  }

  return (
    <main className="min-h-svh bg-transparent p-3.5 md:p-7">
      {flashMessage && (
        <div className="pointer-events-none fixed right-4 top-4 z-[70] w-[min(420px,calc(100vw-2rem))]">
          <div
            className={cn(
              'pointer-events-auto flex items-start justify-between gap-3 rounded-[18px] border px-4 py-3 shadow-[0_18px_38px_rgba(15,23,42,0.16)] backdrop-blur-sm',
              flashMessage.tone === 'success' && 'border-[#bde5cb] bg-[rgba(238,250,242,0.96)] text-[#166534]',
              flashMessage.tone === 'error' && 'border-[#f1b7b3] bg-[rgba(255,241,240,0.96)] text-[#9f1d2f]',
              flashMessage.tone === 'warning' && 'border-[#f2d79a] bg-[rgba(255,248,232,0.96)] text-[#9a6700]',
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-2 text-sm font-black">
              <FiCheckCircle aria-hidden="true" className={cn('mt-0.5 shrink-0', flashMessage.tone !== 'success' && 'hidden')} />
              <span className="leading-5">{flashMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFlashMessage(null)}
              className="shrink-0 rounded-full px-2 py-1 text-xs font-black opacity-70 transition hover:opacity-100"
              aria-label="Dismiss message"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-[24px] border border-[#aec8ff] bg-[linear-gradient(135deg,#d4e4ff_0%,#bfd6ff_45%,#a8c8ff_100%)] text-[#162448] shadow-[0_16px_36px_rgba(63,95,215,0.14)]">
        <div className="pointer-events-none absolute" />
        <nav className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-3 border-b border-[#aecaee] px-5 py-3.5 md:flex-row md:items-center md:px-6" aria-label="Purchase order navigation">
          <div className="flex items-center gap-3 text-sm font-extrabold">
            <span className="inline-grid size-11 place-items-center rounded-xl bg-[linear-gradient(180deg,#f1f6ff_0%,#dce9ff_100%)] text-[#3155d4] shadow-[0_10px_20px_rgba(79,111,230,0.14)]"><FiClipboard aria-hidden="true" /></span>
            <div>
              <span className="block text-[11px] uppercase tracking-[0.14em] text-[#5f79b2]">Workspace</span>
              <span className="block text-[15px] font-black tracking-[-0.02em] text-[#17254c]">Procurement Control</span>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto">
            <button className={cn(buttonBase, 'w-full min-h-9 rounded-[12px] border border-[#aecaee] bg-[rgba(237,244,255,0.72)] px-3.5 text-[15px] text-[#35568f] shadow-none hover:bg-[rgba(244,248,255,0.9)] md:w-auto')} type="button" onClick={loadPurchaseOrders}>
              <FiRefreshCw aria-hidden="true" /> Sync
            </button>
            <button className={cn(buttonBase, 'w-full min-h-9 rounded-[12px] border border-[#aecaee] bg-[rgba(237,244,255,0.72)] px-3.5 text-[15px] text-[#35568f] shadow-none hover:bg-[rgba(244,248,255,0.9)] md:w-auto')} type="button" onClick={handleExport}>
              <FiDownload aria-hidden="true" /> Export
            </button>
            <button className={cn(buttonBase, 'w-full min-h-9 rounded-[12px] bg-[linear-gradient(135deg,#3f67e8_0%,#2f56ce_100%)] px-4 text-[15px] text-white shadow-[0_12px_24px_rgba(63,95,215,0.22)] hover:bg-[#3453c4] md:w-auto')} type="button" onClick={() => setIsCreateOpen(true)}>
              <FiPlus aria-hidden="true" /> New PO
            </button>
          </div>
        </nav>

        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-5 px-5 py-5 md:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.7fr)] lg:py-5.5">
          <div className="max-w-[640px]">
            <p className="m-0 text-[11px] font-black uppercase tracking-[0.12em] text-[#5672b2]">Purchase Order Management</p>
            <h1 className="mt-2 max-w-[560px] text-[24px] font-black leading-[1.02] tracking-[-0.04em] md:text-[34px] xl:text-[38px]">
              Turn supplier orders into one clear workspace.
            </h1>
            <p className="mt-2.5 max-w-[540px] text-[13px] leading-6 text-[#4f6aa2] md:text-[14px]">
              Keep approvals, receiving, branch demand, and reorder details in one place with a cleaner layout.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div className="rounded-[16px] border border-[#aac5f5] bg-[linear-gradient(180deg,rgba(240,246,255,0.82)_0%,rgba(215,229,255,0.88)_100%)] px-4 py-3 shadow-[0_10px_24px_rgba(79,111,230,0.1)] backdrop-blur-sm" key={item.label}>
                  <span className="block text-[10px] font-black uppercase tracking-[0.08em] text-[#5e78ad]">{item.label}</span>
                  <strong className="mt-1.5 block text-[18px] font-black leading-none text-[#17254c] md:text-[20px]">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 self-end">
            <div className="rounded-[20px] border border-[#aac6f6] bg-[linear-gradient(180deg,rgba(240,246,255,0.9)_0%,rgba(214,228,255,0.92)_100%)] p-4 shadow-[0_12px_28px_rgba(79,111,230,0.1)] backdrop-blur-sm" aria-label="Current workflow summary">
              <span className="block text-[10px] font-black uppercase tracking-[0.08em] text-[#5f7aad]">Operations snapshot</span>
              <strong className="mt-2 block max-w-[180px] text-[18px] font-black leading-[1.08] text-[#17254c] md:text-[20px]">
                {purchaseOrders.filter((order) => order.status === 'Pending').length} orders need attention
              </strong>
              <small className="mt-2 block text-[12px] leading-5 text-[#4f6b9e]">
                {activeBranchCount || 0} active branches are contributing to the current order queue.
              </small>
            </div>
            <div className={cn(
              'rounded-[20px] border p-4 shadow-[0_12px_28px_rgba(63,95,215,0.11)]',
              apiMessageTone === 'success' && 'border-[#bde5cb] bg-[linear-gradient(135deg,rgba(236,251,241,0.96)_0%,rgba(217,244,225,0.94)_100%)] text-[#174a31]',
              apiMessageTone === 'warning' && 'border-[#f2d79a] bg-[linear-gradient(135deg,rgba(255,249,232,0.96)_0%,rgba(255,241,205,0.94)_100%)] text-[#6d4b02]',
              apiMessageTone === 'error' && 'border-[#f1b7b3] bg-[linear-gradient(135deg,rgba(255,241,240,0.96)_0%,rgba(255,225,222,0.94)_100%)] text-[#7f1d1d]',
              apiMessageTone === 'info' && 'border-[#a7c4f6] bg-[linear-gradient(135deg,rgba(222,236,255,0.95)_0%,rgba(198,220,255,0.9)_100%)] text-[#26315a]',
            )}>
              <span className={cn(
                'block text-[10px] font-black uppercase tracking-[0.08em]',
                apiMessageTone === 'success' && 'text-[#12703d]',
                apiMessageTone === 'warning' && 'text-[#9a6700]',
                apiMessageTone === 'error' && 'text-[#b42318]',
                apiMessageTone === 'info' && 'text-[#3059d2]',
              )}>System status</span>
              <small className={cn(
                'mt-2 block text-[12px] font-bold leading-5',
                apiMessageTone === 'success' && 'text-[#2d6a4f]',
                apiMessageTone === 'warning' && 'text-[#8a6112]',
                apiMessageTone === 'error' && 'text-[#9f1d2f]',
                apiMessageTone === 'info' && 'text-[#4f6899]',
              )}>{apiMessage}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-3 py-5 md:grid-cols-2 xl:grid-cols-5 xl:gap-4" aria-label="Purchase order statistics">
        {kpis.map((item) => {
          const Icon = item.icon
          return (
            <article className="rounded-[26px] border border-[#dde5f7] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9ff_100%)] p-4 shadow-[0_18px_36px_rgba(73,88,191,0.08)]" key={item.label}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="m-0 text-[12px] font-extrabold uppercase tracking-[0.04em] text-[#7582ab]">{item.label}</p>
                  <strong className="mt-3 block text-[24px] font-black leading-none tracking-[-0.03em] text-[#1b2340]">{item.value}</strong>
                </div>
                <div className={cn('inline-grid size-11 shrink-0 place-items-center rounded-[14px]', kpiToneClasses[item.tone])}><Icon aria-hidden="true" /></div>
              </div>
              <span className="mt-4 block border-t border-[#e8edf9] pt-3 text-[13px] font-bold leading-6 text-[#66749b]">{item.trend}</span>
            </article>
          )
        })}
      </section>

      <section className={cn(panelClass, 'mx-auto mb-5 w-full max-w-[1440px] overflow-hidden border-[#d7e4fb] bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] p-3.5 md:p-4')} aria-label="Purchase order filters">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="group flex min-h-[52px] w-full min-w-0 max-w-[620px] items-center gap-3 rounded-[18px] border border-[#dbe5f6] bg-white px-3.5 shadow-[0_8px_20px_rgba(96,120,182,0.06)] transition focus-within:border-[#7d8fff] focus-within:shadow-[0_0_0_4px_rgba(125,143,255,0.12)]">
              <span className="inline-grid size-8 shrink-0 place-items-center rounded-full bg-[#eef3ff] text-[#5d73d8] transition group-focus-within:bg-[#dfe7ff]">
                <FiSearch aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-black uppercase tracking-[0.08em] text-[#8a97bb]">Search orders</span>
                <input
                  className="mt-0.5 w-full border-0 bg-transparent text-[14px] font-bold text-[#1b2340] outline-none placeholder:text-[#a0adca]"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="PO number, supplier, branch, or owner"
                />
              </div>
            </label>
            <div className={cn(
              'inline-flex min-h-[40px] items-center gap-2 self-start rounded-full px-3.5 text-[13px] font-black shadow-sm',
              apiMessageTone === 'success' && 'bg-[#e8f8ef] text-[#0f7b45]',
              apiMessageTone === 'warning' && 'bg-[#fff4db] text-[#9a6700]',
              apiMessageTone === 'error' && 'bg-[#ffe8e8] text-[#b42318]',
              apiMessageTone === 'info' && 'bg-[#edf0ff] text-[#4f46e5]',
            )}>
              <FiFilter aria-hidden="true" /> {filteredOrders.length} results
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(190px,0.85fr)_minmax(190px,0.85fr)_minmax(190px,0.85fr)]">
            <label className="flex min-h-[88px] flex-col justify-between rounded-[18px] border border-[#dde6f8] bg-white px-3.5 py-3 shadow-[0_8px_20px_rgba(96,120,182,0.06)]">
                <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8191b7]">Status</span>
                <select
                  className="min-h-[42px] w-full rounded-2xl border border-[#dbe5f6] bg-[#f8fbff] px-3.5 text-sm font-black text-[#1b2340] outline-none transition focus:border-[#5b7cff] focus:shadow-[0_0_0_4px_rgba(91,124,255,0.14)]"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by order status"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status === 'All' ? 'All statuses' : status}</option>
                  ))}
                </select>
            </label>

            <label className="flex min-h-[88px] flex-col justify-between rounded-[18px] border border-[#dde6f8] bg-white px-3.5 py-3 shadow-[0_8px_20px_rgba(96,120,182,0.06)]">
                <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8191b7]">Branch</span>
                <select
                  className="min-h-[42px] w-full rounded-2xl border border-[#dbe5f6] bg-[#f8fbff] px-3.5 text-sm font-black text-[#1b2340] outline-none transition focus:border-[#5b7cff] focus:shadow-[0_0_0_4px_rgba(91,124,255,0.14)]"
                  value={branchFilter}
                  onChange={(event) => setBranchFilter(event.target.value)}
                  aria-label="Filter by branch"
                >
                  {branchFilterOptions.map((branch) => (
                    <option key={branch} value={branch}>{branch === 'All' ? 'All branches' : branch}</option>
                  ))}
                </select>
            </label>

            <label className="flex min-h-[88px] flex-col justify-between rounded-[18px] border border-[#dde6f8] bg-white px-3.5 py-3 shadow-[0_8px_20px_rgba(96,120,182,0.06)]">
                <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8191b7]">Priority</span>
                <select
                  className="min-h-[42px] w-full rounded-2xl border border-[#dbe5f6] bg-[#f8fbff] px-3.5 text-sm font-black text-[#1b2340] outline-none transition focus:border-[#5b7cff] focus:shadow-[0_0_0_4px_rgba(91,124,255,0.14)]"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  aria-label="Filter by priority"
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>{priority === 'All' ? 'All priorities' : `${priority} priority`}</option>
                  ))}
                </select>
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto mb-5 grid w-full max-w-[1440px] grid-cols-1 gap-3 md:grid-cols-3" aria-label="Procurement pulse">
        <article className="rounded-[24px] border border-[#dce7df] bg-[linear-gradient(180deg,#ffffff_0%,#f8faf7_100%)] p-4 shadow-[0_18px_38px_rgba(38,67,53,0.07)]">
          <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6d8478]">Average order size</span>
          <strong className="mt-3 block text-[28px] font-black tracking-[-0.04em] text-[#22342a]">{formatAmount(averageOrderValue)}</strong>
          <small className="mt-2 block text-[13px] font-bold leading-5 text-[#5b7064]">Useful for balancing branch purchase batches before supplier approval.</small>
        </article>
        <article className="rounded-[24px] border border-[#dce7df] bg-[linear-gradient(180deg,#ffffff_0%,#f8faf7_100%)] p-4 shadow-[0_18px_38px_rgba(38,67,53,0.07)]">
          <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6d8478]">Focused branch</span>
          <strong className="mt-3 block text-[28px] font-black tracking-[-0.04em] text-[#22342a]">{branchFilter === 'All' ? `${activeBranchCount} branches` : branchFilter}</strong>
          <small className="mt-2 block text-[13px] font-bold leading-5 text-[#5b7064]">Filter the queue by branch to review local demand without losing approval visibility.</small>
        </article>
        <article className="rounded-[24px] border border-[#dce7df] bg-[linear-gradient(180deg,#ffffff_0%,#f8faf7_100%)] p-4 shadow-[0_18px_38px_rgba(38,67,53,0.07)]">
          <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6d8478]">Priority focus</span>
          <strong className="mt-3 block text-[28px] font-black tracking-[-0.04em] text-[#22342a]">{priorityFilter === 'All' ? 'Mixed queue' : `${priorityFilter} queue`}</strong>
          <small className="mt-2 block text-[13px] font-bold leading-5 text-[#5b7064]">Use this view to speed up supplier follow-up on urgent orders and receiving actions.</small>
        </article>
      </section>

      <section className="mx-auto mb-5 grid w-full max-w-[1440px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <article className={cn(panelClass, 'overflow-hidden p-5 md:p-6')}>
          <div className="mb-5 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className={sectionLabel}>Live Order Register</p>
              <h2 className={headingTwo}>Purchase Orders</h2>
            </div>
            <button className={cn(buttonBase, 'min-h-10 bg-[#3f5fd7] text-white shadow-[0_12px_28px_rgba(63,95,215,0.16)]')} type="button" onClick={() => setIsCreateOpen(true)}>
              <FiPlus aria-hidden="true" /> Create PO
            </button>
          </div>

          <div className="overflow-hidden rounded-[20px] border border-[#dce5f2] bg-white">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse">
              <thead className="bg-[#f5f8fe]">
                <tr>
                  {['PO', 'Supplier', 'Branch', 'ETA', 'Amount', 'Status', 'Priority', 'Actions'].map((header) => (
                    <th className="border-b border-[#e4ebf5] px-4 py-4 text-left text-[11px] font-black uppercase tracking-[0.12em] text-[#7d90b3] whitespace-nowrap" key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id ?? order.po}
                    className={cn('cursor-pointer transition hover:bg-[#f8faff]', selectedOrder?.po === order.po && 'bg-[#eef3ff]')}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="border-b border-[#e8edf5] px-4 py-4 text-sm font-black text-[#3f5fd7] whitespace-nowrap">{order.po}<small className="mt-1 block text-xs font-bold text-[#8ea0bf]">{order.items} items</small></td>
                    <td className="border-b border-[#e8edf5] px-4 py-4 text-sm font-bold text-[#1b2340] whitespace-nowrap">{order.supplier}<small className="mt-1 block text-xs font-bold text-[#8ea0bf]">{order.category}</small></td>
                    <td className="border-b border-[#e8edf5] px-4 py-4 text-sm font-bold text-[#1b2340] whitespace-nowrap">{order.branch}<small className="mt-1 block text-xs font-bold text-[#8ea0bf]">{order.owner}</small></td>
                    <td className="border-b border-[#e8edf5] px-4 py-4 text-sm font-bold text-[#5b6f93] whitespace-nowrap">{order.expectedDate}</td>
                    <td className="border-b border-[#e8edf5] px-4 py-4 text-sm font-bold text-[#5b6f93] whitespace-nowrap">{order.amount}</td>
                    <td className="border-b border-[#e8edf5] px-4 py-4 text-sm font-bold text-[#5b6f93] whitespace-nowrap"><span className={cn('inline-flex min-h-[32px] min-w-[96px] items-center justify-center rounded-full px-3 text-xs font-black', statusBadgeClasses[order.status])}>{order.status}</span></td>
                    <td className="border-b border-[#e8edf5] px-4 py-4 text-sm font-bold text-[#5b6f93] whitespace-nowrap"><span className={cn('inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-black', priorityBadgeClasses[order.priority])}>{order.priority}</span></td>
                    <td className="border-b border-[#e8edf5] px-4 py-4 text-sm font-bold text-[#5b6f93] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className={cn(buttonBase, 'min-h-[34px] bg-[#eef3ff] px-2.5 text-xs text-[#48607e]')} type="button" onClick={() => setSelectedOrder(order)} aria-label={`View ${order.po}`}>
                          <FiEye aria-hidden="true" /> View
                        </button>
                        <button className={cn(buttonBase, 'min-h-[34px] bg-[#e6f8ef] px-2.5 text-xs text-[#075e42]')} type="button" onClick={() => updateOrderStatus(order, 'Approved')} aria-label={`Approve ${order.po}`}>
                          <FiCheckCircle aria-hidden="true" /> Approve
                        </button>
                        <button className={cn(buttonBase, 'min-h-[34px] bg-[#e6f0ff] px-2.5 text-xs text-[#0757d4]')} type="button" onClick={() => updateOrderStatus(order, 'Received')} aria-label={`Receive goods for ${order.po}`}>
                          <FiPackage aria-hidden="true" /> Receive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm font-bold text-[#8ea0bf]" colSpan={8}>
                      No purchase orders found in MongoDB.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </article>

        <aside className="grid content-start gap-4 xl:sticky xl:top-6">
          <article className={cn(panelClass, 'bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]')}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className={sectionLabel}>Selected Order</p>
                <h2 className={headingTwo}>{selectedOrder?.po ?? 'No order selected'}</h2>
              </div>
              <FiClipboard className="size-[26px] text-[#0a62df]" aria-hidden="true" />
            </div>
            {selectedOrder && (
              <>
                <div className="mb-4 text-[40px] font-black leading-none tracking-[-0.04em] text-[#1b2340]">{selectedOrder.amount}</div>
                <div className="mb-4 flex flex-wrap gap-2.5">
                  <span className={cn('inline-flex min-h-[34px] items-center justify-center rounded-full px-3 text-xs font-black', statusBadgeClasses[selectedOrder.status])}>{selectedOrder.status}</span>
                  <span className={cn('inline-flex min-h-[34px] items-center justify-center rounded-full px-3 text-xs font-black', priorityBadgeClasses[selectedOrder.priority])}>{selectedOrder.priority} priority</span>
                </div>
                <div className="mb-4 grid gap-2.5 sm:grid-cols-2">
                  {selectedOrderSummary.map(({ label, value, icon: Icon }) => (
                    <div className="rounded-[18px] border border-[#e2e9f5] bg-[#f8fbff] p-3" key={label}>
                      <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#7d90b3]">
                        <Icon aria-hidden="true" className="text-[#4f6fe6]" />
                        {label}
                      </span>
                      <strong className="mt-2 block text-sm font-black text-[#1b2340]">{value}</strong>
                    </div>
                  ))}
                </div>
                <dl className="m-0 grid gap-3">
                  <div className="flex items-start justify-between gap-4 border-b border-[#e8edf5] pb-3"><dt className="text-[11px] font-black uppercase tracking-[0.08em] text-[#7d90b3]">Supplier</dt><dd className="m-0 text-right text-sm font-black text-[#1b2340]">{selectedOrder.supplier}</dd></div>
                  <div className="flex items-start justify-between gap-4 border-b border-[#e8edf5] pb-3"><dt className="text-[11px] font-black uppercase tracking-[0.08em] text-[#7d90b3]">Branch</dt><dd className="m-0 text-right text-sm font-black text-[#1b2340]">{selectedOrder.branch}</dd></div>
                  <div className="flex items-start justify-between gap-4 border-b border-[#e8edf5] pb-3"><dt className="text-[11px] font-black uppercase tracking-[0.08em] text-[#7d90b3]">Expected Delivery</dt><dd className="m-0 text-right text-sm font-black text-[#1b2340]">{selectedOrder.expectedDate}</dd></div>
                  <div className="flex items-start justify-between gap-4 border-b border-[#e8edf5] pb-3"><dt className="text-[11px] font-black uppercase tracking-[0.08em] text-[#7d90b3]">Owner</dt><dd className="m-0 text-right text-sm font-black text-[#1b2340]">{selectedOrder.owner}</dd></div>
                </dl>
                <div className="mt-4 flex gap-2.5">
                  <button className={cn(buttonBase, 'min-h-[38px] flex-1 bg-[#e6f8ef] px-2.5 text-xs text-[#075e42]')} type="button" onClick={() => updateOrderStatus(selectedOrder, 'Approved')}>
                    <FiCheckCircle aria-hidden="true" /> Approve
                  </button>
                  <button className={cn(buttonBase, 'min-h-[38px] flex-1 bg-[#ffe8ec] px-2.5 text-xs text-[#9f1d2f]')} type="button" onClick={() => updateOrderStatus(selectedOrder, 'Rejected')}>
                    <FiXCircle aria-hidden="true" /> Reject
                  </button>
                </div>
              </>
            )}
            {!selectedOrder && (
              <div className="rounded-[20px] border border-dashed border-[#dbe5f2] bg-[#f8fbff] p-5 text-sm font-bold leading-6 text-[#8ea0bf]">
                Select a purchase order from the register to see supplier, branch, delivery, and approval details here.
              </div>
            )}
          </article>

          <article className={cn(panelClass, 'bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)]')}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className={sectionLabel}>AI Smart Reordering</p>
                <h2 className={headingTwo}>Low-stock suggestions</h2>
              </div>
              <FiAlertTriangle className="size-[26px] text-[#0a62df]" aria-hidden="true" />
            </div>
            <div className="grid gap-3">
              {reorderRecommendations.length > 0 ? reorderRecommendations.map((item) => (
                <div className="rounded-[20px] border border-[#e2e9f5] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-4" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <strong className="block font-black text-[#1b2340]">{item.item}</strong>
                    <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em]', urgencyBadgeClasses[item.urgency] || urgencyBadgeClasses.MEDIUM)}>{item.urgency}</span>
                  </div>
                  <span className="mt-2 block text-[13px] font-black text-[#a36b14]">{item.branch} stock: {item.stock} units</span>
                  <small className="mt-1.5 block leading-snug text-[#67789c]">Suggest {item.reorder} units from {item.supplier} - {item.confidence} confidence</small>
                </div>
              )) : (
                <div className="rounded-[20px] border border-dashed border-[#dbe5f2] bg-[#f8fbff] p-4 text-sm font-bold text-[#8ea0bf]">
                  No live reorder suggestions available from MongoDB right now.
                </div>
              )}
            </div>
          </article>
        </aside>
      </section>

      <section className="mx-auto mb-4 grid w-full max-w-[1440px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
        <article className={cn(panelClass, 'bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]')}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className={sectionLabel}>Supplier-linked Purchases</p>
              <h2 className={headingTwo}>Supplier scorecards</h2>
            </div>
            <FiUsers className="size-[26px] text-[#0a62df]" aria-hidden="true" />
          </div>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            {supplierScorecards.length > 0 ? supplierScorecards.map((supplier) => (
              <div className="rounded-[20px] border border-[#e2e9f5] bg-[#f8fbff] p-4" key={supplier.name}>
                <span className="block font-black text-[#1b2340]">{supplier.name}</span>
                <strong className="mt-1.5 block text-sm font-bold text-[#4f6fe6]">{supplier.score}% {supplier.metric}</strong>
                <small className="mt-1 block leading-snug text-[#67789c]">{supplier.purchaseOrders} active purchase orders</small>
              </div>
            )) : (
              <div className="rounded-[20px] border border-dashed border-[#dbe5f2] bg-[#f8fbff] p-4 text-sm font-bold text-[#8ea0bf]">
                No live supplier scorecards available from MongoDB right now.
              </div>
            )}
          </div>
        </article>

        <article className={cn(panelClass, 'bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)]')}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className={sectionLabel}>Approval Workflow</p>
              <h2 className={headingTwo}>Status tracking</h2>
            </div>
            <FiShield className="size-[26px] text-[#0a62df]" aria-hidden="true" />
          </div>
          <div className="grid gap-3.5">
            {workflowSteps.map((step) => (
              <div className="grid grid-cols-[42px_minmax(0,1fr)] items-start gap-3 rounded-[18px] border border-[#e2e9f5] bg-[#f8fbff] p-3" key={step.title}>
                <span className={cn('grid size-[42px] place-items-center rounded-2xl font-black', step.active ? 'bg-[#3f5fd7] text-white' : 'bg-[#eef3ff] text-[#7d90b3]')}>{step.number}</span>
                <div>
                  <strong className="block text-[15px] font-bold text-[#1b2340]">{step.title}</strong>
                  <small className="mt-1 block leading-snug text-[#67789c]">{step.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(15,23,42,0.32)] p-4 backdrop-blur-md" role="presentation">
          <section className="w-full max-w-[760px] max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#dbe5f2] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.16)] md:p-6" role="dialog" aria-modal="true" aria-labelledby="create-po-title">
            {createOrderSuccessMessage ? (
              <div className="grid min-h-[320px] place-items-center px-4 py-8 text-center">
                <div className="w-full max-w-[420px] rounded-[28px] border border-[#bde5cb] bg-[linear-gradient(180deg,#f3fcf6_0%,#ebf8f0_100%)] p-8 shadow-[0_24px_60px_rgba(22,101,52,0.14)]">
                  <div className="mx-auto inline-grid size-16 place-items-center rounded-full bg-[#dcfce7] text-[#15803d] shadow-[0_12px_30px_rgba(34,197,94,0.18)]">
                    <FiCheckCircle aria-hidden="true" className="size-8" />
                  </div>
                  <h2 className="mt-5 text-[28px] font-black tracking-[-0.03em] text-[#14532d]">Added Successfully</h2>
                  <p className="mt-3 text-[15px] font-bold leading-6 text-[#2f6a43]">{createOrderSuccessMessage}</p>
                  <p className="mt-4 text-sm font-semibold text-[#5d7f69]">Returning to the purchase order page...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className={sectionLabel}>New Supplier Order</p>
                    <h2 className={headingTwo} id="create-po-title">Create Purchase Order</h2>
                    <p className="mt-1 text-sm font-semibold text-[#6a7d9f]">Keep the order details compact and clear before saving to the system.</p>
                  </div>
                  <button className="inline-grid size-10 place-items-center rounded-xl border border-[#dce5f2] bg-white text-[#60779b]" type="button" onClick={() => setIsCreateOpen(false)} aria-label="Close">
                    <FiXCircle aria-hidden="true" />
                  </button>
                </div>

                <form className="grid gap-4" onSubmit={handleCreateOrder}>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[20px] border border-[#e2e9f5] bg-[#f8fbff] p-4">
                  <p className="mb-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#4f6fe6]">Assignment</p>
                  <div className="grid gap-4">
                    <label className="grid gap-2 text-[13px] font-black text-[#30435f]">Supplier
                    <select className="min-h-[48px] w-full rounded-xl border border-[#dbe5f2] bg-white px-3.5 text-[#1b2340] outline-none transition focus:border-[#4f6fe6] focus:shadow-[0_0_0_4px_rgba(79,111,230,0.14)]" value={form.supplierId} onChange={(event) => setForm({ ...form, supplierId: event.target.value })} required>
                      <option value="">Select MongoDB supplier</option>
                      {supplierOptions.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>{supplier.label}</option>
                      ))}
                    </select>
                  </label>
                    <label className="grid gap-2 text-[13px] font-black text-[#30435f]">Branch
                    <select className="min-h-[48px] w-full rounded-xl border border-[#dbe5f2] bg-white px-3.5 text-[#1b2340] outline-none transition focus:border-[#4f6fe6] focus:shadow-[0_0_0_4px_rgba(79,111,230,0.14)]" value={form.branchId} onChange={(event) => setForm({ ...form, branchId: event.target.value })} required>
                      <option value="">Select MongoDB branch</option>
                      {branchOptions.map((branch) => (
                        <option key={branch.id} value={branch.id}>{branch.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

                <div className="rounded-[20px] border border-[#e2e9f5] bg-[#f8fbff] p-4">
                  <p className="mb-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#4f6fe6]">Commercial details</p>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                    <label className="grid gap-2 text-[13px] font-black text-[#30435f]">Total Amount<input className="min-h-[48px] w-full rounded-xl border border-[#dbe5f2] bg-white px-3.5 text-[#1b2340] outline-none transition placeholder:text-[#9aaccb] focus:border-[#4f6fe6] focus:shadow-[0_0_0_4px_rgba(79,111,230,0.14)]" type="number" min="1" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="12500.00" required /></label>
                    <label className="grid gap-2 text-[13px] font-black text-[#30435f]">Item Count<input className="min-h-[48px] w-full rounded-xl border border-[#dbe5f2] bg-white px-3.5 text-[#1b2340] outline-none transition focus:border-[#4f6fe6] focus:shadow-[0_0_0_4px_rgba(79,111,230,0.14)]" type="number" min="1" value={form.items} onChange={(event) => setForm({ ...form, items: event.target.value })} required /></label>
                  </div>
                    <label className="grid gap-2 text-[13px] font-black text-[#30435f]">
                  Priority
                  <select className="min-h-[48px] w-full rounded-xl border border-[#dbe5f2] bg-white px-3.5 text-[#1b2340] outline-none transition focus:border-[#4f6fe6] focus:shadow-[0_0_0_4px_rgba(79,111,230,0.14)]" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                    <option>Normal</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] border border-[#e2e9f5] bg-[#f8fbff] p-4">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#4f6fe6]">Schedule and scope</p>
                <div className="grid gap-4">
                  <label className="grid gap-2 text-[13px] font-black text-[#30435f]">Category<input className="min-h-[48px] w-full rounded-xl border border-[#dbe5f2] bg-white px-3.5 text-[#1b2340] outline-none transition placeholder:text-[#9aaccb] focus:border-[#4f6fe6] focus:shadow-[0_0_0_4px_rgba(79,111,230,0.14)]" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Mixed Stock" /></label>
                  <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                    <label className="grid gap-2 text-[13px] font-black text-[#30435f]">Order Date<input className="min-h-[48px] w-full rounded-xl border border-[#dbe5f2] bg-white px-3.5 text-[#1b2340] outline-none transition focus:border-[#4f6fe6] focus:shadow-[0_0_0_4px_rgba(79,111,230,0.14)]" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
                    <label className="grid gap-2 text-[13px] font-black text-[#30435f]">Expected Date<input className="min-h-[48px] w-full rounded-xl border border-[#dbe5f2] bg-white px-3.5 text-[#1b2340] outline-none transition focus:border-[#4f6fe6] focus:shadow-[0_0_0_4px_rgba(79,111,230,0.14)]" type="date" value={form.expectedDate} onChange={(event) => setForm({ ...form, expectedDate: event.target.value })} /></label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#e6edf8] pt-2 md:flex-row">
                <button className="min-h-11 rounded-[12px] border border-[#dce5f2] bg-white px-5 font-black text-[#586f94]" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                <button
                  className={cn(buttonBase, 'min-h-11 bg-[#3f5fd7] px-5 text-white shadow-[0_12px_24px_rgba(63,95,215,0.18)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70')}
                  type="submit"
                  disabled={isSubmittingOrder}
                >
                  <FiPlus aria-hidden="true" /> {isSubmittingOrder ? 'Saving...' : 'Create Purchase Order'}
                </button>
              </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

export default PurchaseOrdersPage
