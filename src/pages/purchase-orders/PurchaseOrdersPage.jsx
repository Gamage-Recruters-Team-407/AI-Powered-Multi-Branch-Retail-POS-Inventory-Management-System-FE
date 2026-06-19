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

const demoReorderRecommendations = [
  {
    id: 'demo-rec-001',
    item: 'Parle-G Value Pack',
    branch: 'Colombo Central',
    stock: 4,
    reorder: 36,
    confidence: '93%',
    supplier: 'BlueLine Wholesale',
    urgency: 'CRITICAL',
  },
  {
    id: 'demo-rec-002',
    item: 'Anchor Full Cream Milk Powder 400g',
    branch: 'Kandy City',
    stock: 6,
    reorder: 28,
    confidence: '89%',
    supplier: 'Prime Foods Lanka',
    urgency: 'HIGH',
  },
  {
    id: 'demo-rec-003',
    item: 'Signal Herbal Toothpaste',
    branch: 'Galle Fort',
    stock: 8,
    reorder: 24,
    confidence: '84%',
    supplier: 'Metro Retail Supply',
    urgency: 'HIGH',
  },
]

const demoSupplierScorecards = [
  {
    id: 'demo-supplier-001',
    name: 'BlueLine Wholesale',
    score: 96,
    metric: 'On-time delivery',
    open: 18450,
    purchaseOrders: 8,
  },
  {
    id: 'demo-supplier-002',
    name: 'Prime Foods Lanka',
    score: 92,
    metric: 'Quality score',
    open: 7360,
    purchaseOrders: 5,
  },
  {
    id: 'demo-supplier-003',
    name: 'NorthStar Distributors',
    score: 88,
    metric: 'Supplier rating',
    open: 9780,
    purchaseOrders: 4,
  },
]

const cn = (...classes) => classes.filter(Boolean).join(' ')

const buttonBase = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border-0 px-4 font-extrabold transition duration-200 hover:-translate-y-0.5'
const panelClass = 'rounded-[28px] border border-[#d9e3f4] bg-[linear-gradient(180deg,rgba(252,253,255,0.94),rgba(244,247,255,0.97))] p-5 shadow-[0_18px_44px_rgba(50,78,138,0.08)] backdrop-blur-sm'
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

const normalizeRecommendation = (recommendation) => ({
  id: recommendation.id,
  item: recommendation.product?.name ?? 'Unknown product',
  branch: recommendation.branch?.name ?? 'Unknown branch',
  stock: Number(recommendation.currentStock ?? 0),
  reorder: Number(recommendation.recommendedQuantity ?? 0),
  confidence: formatPercent(
    recommendation.avgDailySales > 0
      ? Math.min(99, Math.max(55, (recommendation.stock <= recommendation.reorderPoint ? 90 : 72) + recommendation.avgDailySales))
      : recommendation.lowStock
        ? 88
        : 70,
    70,
  ),
  supplier: recommendation.product?.supplierName ?? recommendation.supplierName ?? 'Assigned supplier pending',
  urgency: recommendation.urgency ?? 'MEDIUM',
})

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
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [reorderRecommendations, setReorderRecommendations] = useState([])
  const [supplierScorecards, setSupplierScorecards] = useState([])
  const [supplierOptions, setSupplierOptions] = useState([])
  const [branchOptions, setBranchOptions] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [branchFilter, setBranchFilter] = useState('All')
  const [lastSync, setLastSync] = useState('Ready')
  const [apiMessage, setApiMessage] = useState('Loading MongoDB purchase order data...')
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
      const response = await api.get('/purchase-orders')
      const orders = Array.isArray(response.data) ? response.data : []
      if (orders.length > 0) {
        const normalized = orders.map(normalizeOrder)
        setPurchaseOrders(normalized)
        setSelectedOrder((current) => normalized.find((item) => item.id === current?.id) ?? normalized[0])
      } else {
        setPurchaseOrders([])
        setSelectedOrder(null)
      }
      setApiMessage('Connected to MongoDB purchase orders')
      setLastSync(`Synced ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
    } catch (error) {
      setPurchaseOrders([])
      setSelectedOrder(null)
      setApiMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Could not load purchase orders from MongoDB.',
      )
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
    }
  }, [])

  const loadInsightCards = useCallback(async () => {
    try {
      const [reorderResult, supplierResult] = await Promise.all([
        api.get('/reorders/suggestions?limit=3&includeAll=true'),
        api.get('/suppliers/reports/performance'),
      ])

      const reorderData = Array.isArray(reorderResult.data?.data) ? reorderResult.data.data : []
      const supplierData = Array.isArray(supplierResult.data?.data) ? supplierResult.data.data : []

      setReorderRecommendations(reorderData.map(normalizeRecommendation))
      setSupplierScorecards(
        supplierData
          .map(normalizeSupplierScorecard)
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score
            return b.purchaseOrders - a.purchaseOrders
          })
          .slice(0, 3),
      )
      setApiMessage('Connected to live reorder suggestions and supplier scorecards')
    } catch {
      setReorderRecommendations(demoReorderRecommendations)
      setSupplierScorecards(demoSupplierScorecards)
      setApiMessage('Using polished demo insights until secured MongoDB endpoints are available')
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
      return
    }

    try {
      const response = await api.patch(`/purchase-orders/${order.id}/status`, { status })
      const updatedOrder = normalizeOrder(response.data)
      setPurchaseOrders((orders) => orders.map((item) => (item.id === updatedOrder.id ? updatedOrder : item)))
      setSelectedOrder(updatedOrder)
      setApiMessage(`${updatedOrder.po} saved as ${status}`)
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Could not save status. Check backend and MongoDB connection.'
      setApiMessage(message)
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
      return
    }

    try {
      const response = await api.post('/purchase-orders', orderPayload)
      const createdOrder = normalizeOrder(response.data)
      setPurchaseOrders((orders) => [createdOrder, ...orders])
      setSelectedOrder(createdOrder)
      setApiMessage(`${createdOrder.po} saved to MongoDB`)
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
      setIsCreateOpen(false)
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Purchase order was not saved to MongoDB.'
      setApiMessage(message)
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
  }

  return (
    <main className="min-h-svh bg-transparent p-3.5 md:p-7">
      <section className="overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#171f47_0%,#4338ca_46%,#22d3ee_100%)] text-white shadow-[0_18px_40px_rgba(44,63,132,0.24)]">
        <div className="pointer-events-none absolute" />
        <nav className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-3 border-b border-white/10 px-5 py-3.5 md:flex-row md:items-center md:px-6" aria-label="Purchase order navigation">
          <div className="flex items-center gap-3 text-sm font-extrabold">
            <span className="inline-grid size-11 place-items-center rounded-xl bg-[#f5f7ff] text-[#5b7cff] shadow-[0_10px_20px_rgba(58,76,170,0.14)]"><FiClipboard aria-hidden="true" /></span>
            <div>
              <span className="block text-[11px] uppercase tracking-[0.14em] text-white/65">Workspace</span>
              <span className="block text-[15px] font-black tracking-[-0.02em]">Procurement Control</span>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto">
            <button className={cn(buttonBase, 'w-full min-h-9 rounded-[12px] bg-white/10 px-3.5 text-[15px] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] backdrop-blur hover:bg-white/16 md:w-auto')} type="button" onClick={loadPurchaseOrders}>
              <FiRefreshCw aria-hidden="true" /> Sync
            </button>
            <button className={cn(buttonBase, 'w-full min-h-9 rounded-[12px] bg-white/10 px-3.5 text-[15px] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] backdrop-blur hover:bg-white/16 md:w-auto')} type="button" onClick={handleExport}>
              <FiDownload aria-hidden="true" /> Export
            </button>
            <button className={cn(buttonBase, 'w-full min-h-9 rounded-[12px] bg-[#f4f7ff] px-4 text-[15px] text-[#4338ca] shadow-[0_12px_24px_rgba(67,56,202,0.16)] hover:bg-[#ffffff] md:w-auto')} type="button" onClick={() => setIsCreateOpen(true)}>
              <FiPlus aria-hidden="true" /> New PO
            </button>
          </div>
        </nav>

        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-5 px-5 py-5 md:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.7fr)] lg:py-5.5">
          <div className="max-w-[640px]">
            <p className="m-0 text-[11px] font-black uppercase tracking-[0.12em] text-[#e6eeff]">Purchase Order Management</p>
            <h1 className="mt-2 max-w-[560px] text-[24px] font-black leading-[1.02] tracking-[-0.04em] md:text-[34px] xl:text-[38px]">
              Turn supplier orders into one clear workspace.
            </h1>
            <p className="mt-2.5 max-w-[540px] text-[13px] leading-6 text-[#eef5ff] md:text-[14px]">
              Keep approvals, receiving, branch demand, and reorder details in one place with a cleaner layout.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div className="rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.08))] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm" key={item.label}>
                  <span className="block text-[10px] font-black uppercase tracking-[0.08em] text-[#edf5ff]">{item.label}</span>
                  <strong className="mt-1.5 block text-[18px] font-black leading-none text-white md:text-[20px]">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 self-end">
            <div className="rounded-[20px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-sm" aria-label="Current workflow summary">
              <span className="block text-[10px] font-black uppercase tracking-[0.08em] text-[#eef5ff]">Operations snapshot</span>
              <strong className="mt-2 block max-w-[180px] text-[18px] font-black leading-[1.08] text-white md:text-[20px]">
                {purchaseOrders.filter((order) => order.status === 'Pending').length} orders need attention
              </strong>
              <small className="mt-2 block text-[12px] leading-5 text-[#eef6ff]">
                {activeBranchCount || 0} active branches are contributing to the current order queue.
              </small>
            </div>
            <div className="rounded-[20px] bg-[linear-gradient(135deg,#f5f7ff_0%,#f5feff_100%)] p-4 text-[#26315a] shadow-[0_12px_26px_rgba(73,88,191,0.12)]">
              <span className="block text-[10px] font-black uppercase tracking-[0.08em] text-[#4f46e5]">System status</span>
              <small className="mt-2 block text-[12px] font-bold leading-5 text-[#5f6f9f]">{apiMessage}</small>
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

      <section className={cn(panelClass, 'mx-auto mb-5 flex w-full max-w-[1440px] flex-col items-stretch gap-3.5 p-4 lg:flex-row lg:items-center')} aria-label="Purchase order filters">
        <label className="flex min-h-[50px] flex-1 basis-80 items-center gap-2.5 rounded-2xl border border-[#dbe5f6] bg-[#f8fbff] px-4 text-[#7a88ae]">
          <FiSearch aria-hidden="true" />
          <input className="w-full border-0 bg-transparent font-bold text-[#1b2340] outline-none placeholder:text-[#94a2c5]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search PO, supplier, branch, owner..." />
        </label>
        <div className="inline-flex shrink-0 gap-1 overflow-x-auto rounded-2xl bg-[#eef2ff] p-1.5" role="tablist" aria-label="Filter by order status">
          {statuses.map((status) => (
            <button
              className={cn('min-h-9 rounded-xl border-0 px-3 text-sm font-black text-[#7582a8]', statusFilter === status && 'bg-[#4f46e5] text-white shadow-[0_10px_24px_rgba(79,70,229,0.24)]')}
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <select
          className="min-h-[50px] rounded-2xl border border-[#dbe5f6] bg-[#f8fbff] px-4 text-sm font-black text-[#1b2340] outline-none transition focus:border-[#5b7cff] focus:shadow-[0_0_0_4px_rgba(91,124,255,0.14)]"
          value={branchFilter}
          onChange={(event) => setBranchFilter(event.target.value)}
          aria-label="Filter by branch"
        >
          {branchFilterOptions.map((branch) => (
            <option key={branch} value={branch}>{branch === 'All' ? 'All branches' : branch}</option>
          ))}
        </select>
        <select
          className="min-h-[50px] rounded-2xl border border-[#dbe5f6] bg-[#f8fbff] px-4 text-sm font-black text-[#1b2340] outline-none transition focus:border-[#5b7cff] focus:shadow-[0_0_0_4px_rgba(91,124,255,0.14)]"
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          aria-label="Filter by priority"
        >
          {priorities.map((priority) => (
            <option key={priority} value={priority}>{priority === 'All' ? 'All priorities' : `${priority} priority`}</option>
          ))}
        </select>
        <div className="inline-flex min-h-[42px] items-center gap-2 whitespace-nowrap rounded-full bg-[#edf0ff] px-4 text-[13px] font-black text-[#4f46e5]"><FiFilter aria-hidden="true" /> {filteredOrders.length} results</div>
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
            <button className={cn(buttonBase, 'min-h-10 bg-[#2f7d6b] text-white shadow-[0_12px_28px_rgba(47,125,107,0.22)]')} type="button" onClick={() => setIsCreateOpen(true)}>
              <FiPlus aria-hidden="true" /> Create PO
            </button>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[#dce7df] bg-white">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse">
              <thead className="bg-[#f3f8f4]">
                <tr>
                  {['PO', 'Supplier', 'Branch', 'ETA', 'Amount', 'Status', 'Priority', 'Actions'].map((header) => (
                    <th className="border-b border-[#e1ebe4] px-4 py-4 text-left text-[11px] font-black uppercase tracking-[0.12em] text-[#728679] whitespace-nowrap" key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id ?? order.po}
                    className={cn('cursor-pointer transition hover:bg-[#f5faf6]', selectedOrder?.po === order.po && 'bg-[#edf7f0]')}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="border-b border-[#e8efe9] px-4 py-4 text-sm font-black text-[#1f8a70] whitespace-nowrap">{order.po}<small className="mt-1 block text-xs font-bold text-[#819688]">{order.items} items</small></td>
                    <td className="border-b border-[#e8efe9] px-4 py-4 text-sm font-bold text-[#22342a] whitespace-nowrap">{order.supplier}<small className="mt-1 block text-xs font-bold text-[#819688]">{order.category}</small></td>
                    <td className="border-b border-[#e8efe9] px-4 py-4 text-sm font-bold text-[#22342a] whitespace-nowrap">{order.branch}<small className="mt-1 block text-xs font-bold text-[#819688]">{order.owner}</small></td>
                    <td className="border-b border-[#e8efe9] px-4 py-4 text-sm font-bold text-[#52675b] whitespace-nowrap">{order.expectedDate}</td>
                    <td className="border-b border-[#e8efe9] px-4 py-4 text-sm font-bold text-[#52675b] whitespace-nowrap">{order.amount}</td>
                    <td className="border-b border-[#e8efe9] px-4 py-4 text-sm font-bold text-[#52675b] whitespace-nowrap"><span className={cn('inline-flex min-h-[32px] min-w-[96px] items-center justify-center rounded-full px-3 text-xs font-black', statusBadgeClasses[order.status])}>{order.status}</span></td>
                    <td className="border-b border-[#e8efe9] px-4 py-4 text-sm font-bold text-[#52675b] whitespace-nowrap"><span className={cn('inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-black', priorityBadgeClasses[order.priority])}>{order.priority}</span></td>
                    <td className="border-b border-[#e8efe9] px-4 py-4 text-sm font-bold text-[#52675b] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className={cn(buttonBase, 'min-h-[34px] bg-[#eef6f0] px-2.5 text-xs text-[#325546]')} type="button" onClick={() => setSelectedOrder(order)} aria-label={`View ${order.po}`}>
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
                    <td className="px-4 py-10 text-center text-sm font-bold text-[#7b9184]" colSpan={8}>
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
                <div className="mb-4 text-[40px] font-black leading-none tracking-[-0.04em] text-[#22342a]">{selectedOrder.amount}</div>
                <div className="mb-4 flex flex-wrap gap-2.5">
                  <span className={cn('inline-flex min-h-[34px] items-center justify-center rounded-full px-3 text-xs font-black', statusBadgeClasses[selectedOrder.status])}>{selectedOrder.status}</span>
                  <span className={cn('inline-flex min-h-[34px] items-center justify-center rounded-full px-3 text-xs font-black', priorityBadgeClasses[selectedOrder.priority])}>{selectedOrder.priority} priority</span>
                </div>
                <div className="mb-4 grid gap-2.5 sm:grid-cols-2">
                  {selectedOrderSummary.map(({ label, value, icon: Icon }) => (
                    <div className="rounded-[18px] border border-[#dfe9e2] bg-[#f7faf8] p-3" key={label}>
                      <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#728679]">
                        <Icon aria-hidden="true" className="text-[#1f8a70]" />
                        {label}
                      </span>
                      <strong className="mt-2 block text-sm font-black text-[#22342a]">{value}</strong>
                    </div>
                  ))}
                </div>
                <dl className="m-0 grid gap-3">
                  <div className="flex items-start justify-between gap-4 border-b border-[#e6eee8] pb-3"><dt className="text-[11px] font-black uppercase tracking-[0.08em] text-[#728679]">Supplier</dt><dd className="m-0 text-right text-sm font-black text-[#22342a]">{selectedOrder.supplier}</dd></div>
                  <div className="flex items-start justify-between gap-4 border-b border-[#e6eee8] pb-3"><dt className="text-[11px] font-black uppercase tracking-[0.08em] text-[#728679]">Branch</dt><dd className="m-0 text-right text-sm font-black text-[#22342a]">{selectedOrder.branch}</dd></div>
                  <div className="flex items-start justify-between gap-4 border-b border-[#e6eee8] pb-3"><dt className="text-[11px] font-black uppercase tracking-[0.08em] text-[#728679]">Expected Delivery</dt><dd className="m-0 text-right text-sm font-black text-[#22342a]">{selectedOrder.expectedDate}</dd></div>
                  <div className="flex items-start justify-between gap-4 border-b border-[#e6eee8] pb-3"><dt className="text-[11px] font-black uppercase tracking-[0.08em] text-[#728679]">Owner</dt><dd className="m-0 text-right text-sm font-black text-[#22342a]">{selectedOrder.owner}</dd></div>
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
              <div className="rounded-[20px] border border-dashed border-[#d7e4dc] bg-[#f8fbf9] p-5 text-sm font-bold leading-6 text-[#7b9184]">
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
                <div className="rounded-[20px] border border-[#dfe9e2] bg-[linear-gradient(135deg,#ffffff_0%,#f7faf8_100%)] p-4" key={item.item}>
                  <div className="flex items-start justify-between gap-3">
                    <strong className="block font-black text-[#22342a]">{item.item}</strong>
                    <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em]', urgencyBadgeClasses[item.urgency] || urgencyBadgeClasses.MEDIUM)}>{item.urgency}</span>
                  </div>
                  <span className="mt-2 block text-[13px] font-black text-[#a36b14]">{item.branch} stock: {item.stock} units</span>
                  <small className="mt-1.5 block leading-snug text-[#617568]">Suggest {item.reorder} units from {item.supplier} - {item.confidence} confidence</small>
                </div>
              )) : (
                <div className="rounded-[20px] border border-dashed border-[#d7e4dc] bg-[#f8fbf9] p-4 text-sm font-bold text-[#7b9184]">
                  No live reorder suggestions available from MongoDB right now.
                </div>
              )}
            </div>
          </article>
        </aside>
      </section>

      <section className="mx-auto mb-4 grid w-full max-w-[1440px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
        <article className={cn(panelClass, 'bg-[linear-gradient(180deg,rgba(12,25,46,0.96),rgba(17,34,60,0.98))]')}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className={sectionLabel}>Supplier-linked Purchases</p>
              <h2 className={headingTwo}>Supplier scorecards</h2>
            </div>
            <FiUsers className="size-[26px] text-[#0a62df]" aria-hidden="true" />
          </div>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            {supplierScorecards.length > 0 ? supplierScorecards.map((supplier) => (
              <div className="rounded-[20px] border border-[#dfe9e2] bg-[#f7faf8] p-4" key={supplier.name}>
                <span className="block font-black text-[#22342a]">{supplier.name}</span>
                <strong className="mt-1.5 block text-sm font-bold text-[#1f8a70]">{supplier.score}% {supplier.metric}</strong>
                <small className="mt-1 block leading-snug text-[#617568]">{supplier.purchaseOrders} active purchase orders</small>
              </div>
            )) : (
              <div className="rounded-[20px] border border-dashed border-[#d7e4dc] bg-[#f8fbf9] p-4 text-sm font-bold text-[#7b9184]">
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
              <div className="grid grid-cols-[42px_minmax(0,1fr)] items-start gap-3 rounded-[18px] border border-[#dfe9e2] bg-[#f7faf8] p-3" key={step.title}>
                <span className={cn('grid size-[42px] place-items-center rounded-2xl font-black', step.active ? 'bg-[#2f7d6b] text-white' : 'bg-[#ebf4ee] text-[#74897d]')}>{step.number}</span>
                <div>
                  <strong className="block text-[15px] font-bold text-[#22342a]">{step.title}</strong>
                  <small className="mt-1 block leading-snug text-[#617568]">{step.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(11,30,58,0.42)] p-5 backdrop-blur-xl" role="presentation">
          <section className="w-full max-w-[560px] rounded-[20px] border border-[#d9e6df] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbf9_100%)] p-6 shadow-[0_28px_80px_rgba(41,71,56,0.18)]" role="dialog" aria-modal="true" aria-labelledby="create-po-title">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className={sectionLabel}>New Supplier Order</p>
                <h2 className={headingTwo} id="create-po-title">Create Purchase Order</h2>
              </div>
              <button className="inline-grid size-10 place-items-center rounded-xl border-0 bg-[#edf5f0] text-[#607468]" type="button" onClick={() => setIsCreateOpen(false)} aria-label="Close">
                <FiXCircle aria-hidden="true" />
              </button>
            </div>

            <form className="grid gap-4" onSubmit={handleCreateOrder}>
              <div className="rounded-[18px] border border-[#dfe9e2] bg-[#f7faf8] p-4">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#1f8a70]">Assignment</p>
                <div className="grid gap-4">
                  <label className="grid gap-2 text-[13px] font-black text-[#d9e7fb]">Supplier
                    <select className="min-h-[46px] w-full rounded-xl border border-[#d6e4dc] bg-white px-3.5 text-[#22342a] outline-none transition focus:border-[#2f7d6b] focus:shadow-[0_0_0_4px_rgba(47,125,107,0.14)]" value={form.supplierId} onChange={(event) => setForm({ ...form, supplierId: event.target.value })} required>
                      <option value="">Select MongoDB supplier</option>
                      {supplierOptions.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>{supplier.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-[13px] font-black text-[#d9e7fb]">Branch
                    <select className="min-h-[46px] w-full rounded-xl border border-[#d6e4dc] bg-white px-3.5 text-[#22342a] outline-none transition focus:border-[#2f7d6b] focus:shadow-[0_0_0_4px_rgba(47,125,107,0.14)]" value={form.branchId} onChange={(event) => setForm({ ...form, branchId: event.target.value })} required>
                      <option value="">Select MongoDB branch</option>
                      {branchOptions.map((branch) => (
                        <option key={branch.id} value={branch.id}>{branch.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="rounded-[18px] border border-[#dfe9e2] bg-[#f7faf8] p-4">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#1f8a70]">Schedule and scope</p>
                <div className="grid gap-4">
                  <label className="grid gap-2 text-[13px] font-black text-[#31463b]">Category<input className="min-h-[46px] w-full rounded-xl border border-[#d6e4dc] bg-white px-3.5 text-[#22342a] outline-none transition placeholder:text-[#8ba095] focus:border-[#2f7d6b] focus:shadow-[0_0_0_4px_rgba(47,125,107,0.14)]" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Mixed Stock" /></label>
                  <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                    <label className="grid gap-2 text-[13px] font-black text-[#31463b]">Order Date<input className="min-h-[46px] w-full rounded-xl border border-[#d6e4dc] bg-white px-3.5 text-[#22342a] outline-none transition focus:border-[#2f7d6b] focus:shadow-[0_0_0_4px_rgba(47,125,107,0.14)]" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
                    <label className="grid gap-2 text-[13px] font-black text-[#31463b]">Expected Date<input className="min-h-[46px] w-full rounded-xl border border-[#d6e4dc] bg-white px-3.5 text-[#22342a] outline-none transition focus:border-[#2f7d6b] focus:shadow-[0_0_0_4px_rgba(47,125,107,0.14)]" type="date" value={form.expectedDate} onChange={(event) => setForm({ ...form, expectedDate: event.target.value })} /></label>
                  </div>
                </div>
              </div>

              <div className="rounded-[18px] border border-[#dfe9e2] bg-[#f7faf8] p-4">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#1f8a70]">Commercial details</p>
                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                  <label className="grid gap-2 text-[13px] font-black text-[#31463b]">Total Amount<input className="min-h-[46px] w-full rounded-xl border border-[#d6e4dc] bg-white px-3.5 text-[#22342a] outline-none transition placeholder:text-[#8ba095] focus:border-[#2f7d6b] focus:shadow-[0_0_0_4px_rgba(47,125,107,0.14)]" type="number" min="1" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="12500.00" required /></label>
                  <label className="grid gap-2 text-[13px] font-black text-[#31463b]">Item Count<input className="min-h-[46px] w-full rounded-xl border border-[#d6e4dc] bg-white px-3.5 text-[#22342a] outline-none transition focus:border-[#2f7d6b] focus:shadow-[0_0_0_4px_rgba(47,125,107,0.14)]" type="number" min="1" value={form.items} onChange={(event) => setForm({ ...form, items: event.target.value })} required /></label>
                </div>
                <label className="mt-4 grid gap-2 text-[13px] font-black text-[#31463b]">
                  Priority
                  <select className="min-h-[46px] w-full rounded-xl border border-[#d6e4dc] bg-white px-3.5 text-[#22342a] outline-none transition focus:border-[#2f7d6b] focus:shadow-[0_0_0_4px_rgba(47,125,107,0.14)]" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                    <option>Normal</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
              </div>
              <div className="mt-1.5 flex flex-col-reverse justify-end gap-3 md:flex-row">
                <button className="min-h-10 rounded-[10px] border-0 bg-[#edf5f0] px-4 font-black text-[#496055]" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                <button className={cn(buttonBase, 'bg-[#2f7d6b] text-white shadow-[0_12px_24px_rgba(47,125,107,0.22)]')} type="submit"><FiPlus aria-hidden="true" /> Create Purchase Order</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default PurchaseOrdersPage
