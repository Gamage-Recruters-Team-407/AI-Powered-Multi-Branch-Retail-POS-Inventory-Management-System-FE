import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FiAlertTriangle,
  FiBarChart2,
  FiCheckCircle,
  FiClipboard,
  FiDownload,
  FiEye,
  FiFilter,
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

const cn = (...classes) => classes.filter(Boolean).join(' ')

const buttonBase = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border-0 px-4 font-extrabold transition hover:-translate-y-0.5'
const panelClass = 'rounded-2xl border border-[#dbe8f7] bg-white/95 p-5 shadow-[0_16px_42px_rgba(18,58,114,0.09)]'
const sectionLabel = 'm-0 text-xs font-black uppercase tracking-[0.08em] text-[#0a62df]'
const headingTwo = 'mt-1 text-[22px] font-black leading-tight text-[#101b31]'

const kpiToneClasses = {
  value: 'text-[#1643b7] bg-[#e7ebff]',
  warning: 'text-[#975400] bg-[#fff4db]',
  success: 'text-[#087b55] bg-[#e3f8ef]',
  danger: 'text-[#b42318] bg-[#ffebe8]',
  info: 'text-[#0b7297] bg-[#dff7ff]',
}

const statusBadgeClasses = {
  Pending: 'text-[#945500] bg-[#fff1d6]',
  Approved: 'text-[#075e42] bg-[#def7eb]',
  Received: 'text-[#0757d4] bg-[#e4f0ff]',
  Rejected: 'text-[#9f1d2f] bg-[#ffe6ea]',
}

const priorityBadgeClasses = {
  High: 'text-[#9f1d2f] bg-[#ffe6ea]',
  Medium: 'text-[#945500] bg-[#fff1d6]',
  Normal: 'text-[#0757d4] bg-[#e4f0ff]',
  Low: 'text-[#075e42] bg-[#def7eb]',
}

const parseAmount = (amount) => Number(String(amount).replace(/[$,]/g, '')) || 0

const formatAmount = (amount) =>
  `$${parseAmount(amount).toLocaleString('en-US', {
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
  amount: formatAmount(order.amount ?? order.totalAmount ?? 0),
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
    } catch {
      setReorderRecommendations([])
      setSupplierScorecards([])
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

  const filteredOrders = useMemo(() => {
    const search = query.trim().toLowerCase()
    return purchaseOrders.filter((order) => {
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter
      const matchesSearch =
        !search ||
        [order.po, order.supplier, order.branch, order.category, order.owner].some((value) =>
          String(value).toLowerCase().includes(search),
        )
      return matchesStatus && matchesSearch
    })
  }, [purchaseOrders, query, statusFilter])

  const kpis = useMemo(() => {
    const pending = purchaseOrders.filter((order) => order.status === 'Pending').length
    const approved = purchaseOrders.filter((order) => order.status === 'Approved').length
    const totalValue = purchaseOrders.reduce((sum, order) => sum + parseAmount(order.amount), 0)
    const highPriority = purchaseOrders.filter((order) => order.priority === 'High').length

    return [
      { label: 'Open PO Value', value: `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, trend: 'Across active branches', icon: FiBarChart2, tone: 'value' },
      { label: 'Pending Approval', value: pending.toString(), trend: 'Needs manager decision', icon: FiShield, tone: 'warning' },
      { label: 'Approved Orders', value: approved.toString(), trend: 'Ready for supplier dispatch', icon: FiCheckCircle, tone: 'success' },
      { label: 'AI Reorder Alerts', value: reorderRecommendations.length.toString(), trend: 'Low-stock suggestions', icon: FiAlertTriangle, tone: 'danger' },
      { label: 'High Priority', value: highPriority.toString(), trend: 'Expedite before stock-out', icon: FiTruck, tone: 'info' },
    ]
  }, [purchaseOrders, reorderRecommendations.length])

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
    <main className="min-h-svh bg-[radial-gradient(circle_at_12%_0%,rgba(37,99,235,0.16),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(16,185,129,0.12),transparent_24%),linear-gradient(180deg,rgba(239,246,255,0.94),rgba(248,250,252,0.98)),#f8fafc] p-3.5 md:p-7">
      <section className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_48%,#0f766e_100%)] text-white shadow-[0_24px_60px_rgba(16,91,194,0.26)] md:rounded-3xl">
        <nav className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-5 border-b border-white/20 px-[18px] py-5 md:flex-row md:items-center md:px-7" aria-label="Purchase order navigation">
          <div className="flex items-center gap-3 text-sm font-extrabold">
            <span className="inline-grid size-[42px] place-items-center rounded-xl bg-white text-[#0e63de]"><FiClipboard aria-hidden="true" /></span>
            <span>Procurement Control</span>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto">
            <button className={cn(buttonBase, 'w-full bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] md:w-auto')} type="button" onClick={loadPurchaseOrders}>
              <FiRefreshCw aria-hidden="true" /> Sync
            </button>
            <button className={cn(buttonBase, 'w-full bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] md:w-auto')} type="button" onClick={handleExport}>
              <FiDownload aria-hidden="true" /> Export
            </button>
            <button className={cn(buttonBase, 'w-full bg-white text-[#0b5fdc] shadow-[0_12px_28px_rgba(2,50,116,0.2)] md:w-auto')} type="button" onClick={() => setIsCreateOpen(true)}>
              <FiPlus aria-hidden="true" /> New PO
            </button>
          </div>
        </nav>

        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-end gap-7 px-[18px] py-8 md:px-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:py-11">
          <div>
            <p className="m-0 text-xs font-black uppercase tracking-[0.08em] text-white/80">Purchase Order Management</p>
            <h1 className="mt-2.5 max-w-[820px] text-[34px] font-black leading-none tracking-normal md:text-[56px] xl:text-[64px]">Approve, track, and receive supplier orders from one workspace.</h1>
            <p className="mt-4 max-w-[820px] text-base leading-relaxed text-white/85 md:text-lg">
              Built for fast procurement decisions with AI reorder alerts, supplier scorecards,
              approval actions, delivery tracking, and exportable purchase reports.
            </p>
          </div>
          <div className="min-h-0 rounded-[18px] bg-white/15 p-[22px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] lg:min-h-[150px]" aria-label="Current workflow summary">
            <span className="block text-white/75">Today</span>
            <strong className="my-2 block text-[34px] font-black leading-none">{purchaseOrders.filter((order) => order.status === 'Pending').length} approvals</strong>
            <small className="block text-white/75">{lastSync} across 5 active branches</small>
            <small className="mt-2 block text-white/75">{apiMessage}</small>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-3 py-6 md:grid-cols-3 xl:grid-cols-5 xl:gap-4" aria-label="Purchase order statistics">
        {kpis.map((item) => {
          const Icon = item.icon
          return (
            <article className="flex min-h-[120px] gap-3.5 rounded-2xl border border-[#dbe8f7] bg-white/95 p-5 shadow-[0_16px_42px_rgba(18,58,114,0.09)] xl:min-h-[148px]" key={item.label}>
              <div className={cn('inline-grid size-12 shrink-0 place-items-center rounded-[14px]', kpiToneClasses[item.tone])}><Icon aria-hidden="true" /></div>
              <div>
                <p className="m-0 text-[13px] font-extrabold leading-snug text-[#637083]">{item.label}</p>
                <strong className="my-2 block text-[28px] font-black leading-none text-[#101b31]">{item.value}</strong>
                <span className="text-xs font-extrabold text-[#0a62df]">{item.trend}</span>
              </div>
            </article>
          )
        })}
      </section>

      <section className={cn(panelClass, 'mx-auto mb-4 flex w-full max-w-[1440px] flex-col items-stretch gap-3.5 lg:flex-row lg:items-center')} aria-label="Purchase order filters">
        <label className="flex min-h-[46px] flex-1 basis-80 items-center gap-2.5 rounded-xl border border-[#dbe8f7] bg-[#f8fbff] px-3.5 text-[#5f6f86]">
          <FiSearch aria-hidden="true" />
          <input className="w-full border-0 bg-transparent font-bold text-[#172033] outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search PO, supplier, branch, owner..." />
        </label>
        <div className="inline-flex shrink-0 gap-1 overflow-x-auto rounded-xl bg-[#eef4fb] p-1" role="tablist" aria-label="Filter by order status">
          {statuses.map((status) => (
            <button
              className={cn('min-h-9 rounded-[9px] border-0 px-3 text-sm font-black text-[#516177]', statusFilter === status && 'bg-[#0f172a] text-white shadow-[0_10px_20px_rgba(15,23,42,0.16)]')}
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="inline-flex min-h-[38px] items-center gap-2 whitespace-nowrap rounded-full bg-[#e3faf5] px-3 text-[13px] font-black text-[#0f766e]"><FiFilter aria-hidden="true" /> {filteredOrders.length} results</div>
      </section>

      <section className="mx-auto mb-4 grid w-full max-w-[1440px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className={cn(panelClass, 'p-5 md:p-6')}>
          <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className={sectionLabel}>Live Order Register</p>
              <h2 className={headingTwo}>Purchase Orders</h2>
            </div>
            <button className={cn(buttonBase, 'min-h-10 bg-[#0a62df] text-white shadow-[0_12px_24px_rgba(3,77,181,0.26)]')} type="button" onClick={() => setIsCreateOpen(true)}>
              <FiPlus aria-hidden="true" /> Create PO
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse">
              <thead className="bg-[#f5f9ff]">
                <tr>
                  {['PO', 'Supplier', 'Branch', 'ETA', 'Amount', 'Status', 'Priority', 'Actions'].map((header) => (
                    <th className="border-b border-[#e4edf7] px-3.5 py-4 text-left text-xs font-black uppercase tracking-[0.04em] text-[#637083] whitespace-nowrap" key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id ?? order.po} className={cn('hover:bg-[#f8fbff]', selectedOrder?.po === order.po && 'bg-[#f1f7ff]')}>
                    <td className="border-b border-[#e4edf7] px-3.5 py-4 text-sm font-black text-[#0a62df] whitespace-nowrap">{order.po}<small className="mt-1 block text-xs font-bold text-[#77869a]">{order.items} items</small></td>
                    <td className="border-b border-[#e4edf7] px-3.5 py-4 text-sm font-bold text-[#26344d] whitespace-nowrap">{order.supplier}<small className="mt-1 block text-xs font-bold text-[#77869a]">{order.category}</small></td>
                    <td className="border-b border-[#e4edf7] px-3.5 py-4 text-sm font-bold text-[#26344d] whitespace-nowrap">{order.branch}<small className="mt-1 block text-xs font-bold text-[#77869a]">{order.owner}</small></td>
                    <td className="border-b border-[#e4edf7] px-3.5 py-4 text-sm font-bold text-[#26344d] whitespace-nowrap">{order.expectedDate}</td>
                    <td className="border-b border-[#e4edf7] px-3.5 py-4 text-sm font-bold text-[#26344d] whitespace-nowrap">{order.amount}</td>
                    <td className="border-b border-[#e4edf7] px-3.5 py-4 text-sm font-bold text-[#26344d] whitespace-nowrap"><span className={cn('inline-flex min-h-[30px] min-w-[92px] items-center justify-center rounded-full px-3 text-xs font-black', statusBadgeClasses[order.status])}>{order.status}</span></td>
                    <td className="border-b border-[#e4edf7] px-3.5 py-4 text-sm font-bold text-[#26344d] whitespace-nowrap"><span className={cn('inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-black', priorityBadgeClasses[order.priority])}>{order.priority}</span></td>
                    <td className="border-b border-[#e4edf7] px-3.5 py-4 text-sm font-bold text-[#26344d] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className={cn(buttonBase, 'min-h-[34px] bg-[#eef4fb] px-2.5 text-xs text-[#29364a]')} type="button" onClick={() => setSelectedOrder(order)} aria-label={`View ${order.po}`}>
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
                    <td className="px-3.5 py-8 text-center text-sm font-bold text-[#637083]" colSpan={8}>
                      No purchase orders found in MongoDB.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="grid content-start gap-4">
          <article className={panelClass}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className={sectionLabel}>Selected Order</p>
                <h2 className={headingTwo}>{selectedOrder?.po ?? 'No order selected'}</h2>
              </div>
              <FiClipboard className="size-[26px] text-[#0a62df]" aria-hidden="true" />
            </div>
            {selectedOrder && (
              <>
                <div className="mb-4 text-4xl font-black leading-none text-[#101b31]">{selectedOrder.amount}</div>
                <dl className="m-0 grid gap-3">
                  <div className="flex items-start justify-between gap-4 border-b border-[#e4edf7] pb-3"><dt className="text-xs font-black uppercase text-[#637083]">Supplier</dt><dd className="m-0 text-right text-sm font-black text-[#101b31]">{selectedOrder.supplier}</dd></div>
                  <div className="flex items-start justify-between gap-4 border-b border-[#e4edf7] pb-3"><dt className="text-xs font-black uppercase text-[#637083]">Branch</dt><dd className="m-0 text-right text-sm font-black text-[#101b31]">{selectedOrder.branch}</dd></div>
                  <div className="flex items-start justify-between gap-4 border-b border-[#e4edf7] pb-3"><dt className="text-xs font-black uppercase text-[#637083]">Expected Delivery</dt><dd className="m-0 text-right text-sm font-black text-[#101b31]">{selectedOrder.expectedDate}</dd></div>
                  <div className="flex items-start justify-between gap-4 border-b border-[#e4edf7] pb-3"><dt className="text-xs font-black uppercase text-[#637083]">Owner</dt><dd className="m-0 text-right text-sm font-black text-[#101b31]">{selectedOrder.owner}</dd></div>
                </dl>
                <div className="mt-4 flex gap-2.5">
                  <button className={cn(buttonBase, 'min-h-[34px] flex-1 bg-[#e6f8ef] px-2.5 text-xs text-[#075e42]')} type="button" onClick={() => updateOrderStatus(selectedOrder, 'Approved')}>
                    <FiCheckCircle aria-hidden="true" /> Approve
                  </button>
                  <button className={cn(buttonBase, 'min-h-[34px] flex-1 bg-[#ffe8ec] px-2.5 text-xs text-[#9f1d2f]')} type="button" onClick={() => updateOrderStatus(selectedOrder, 'Rejected')}>
                    <FiXCircle aria-hidden="true" /> Reject
                  </button>
                </div>
              </>
            )}
          </article>

          <article className={panelClass}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className={sectionLabel}>AI Smart Reordering</p>
                <h2 className={headingTwo}>Low-stock suggestions</h2>
              </div>
              <FiAlertTriangle className="size-[26px] text-[#0a62df]" aria-hidden="true" />
            </div>
            <div className="grid gap-3">
              {reorderRecommendations.length > 0 ? reorderRecommendations.map((item) => (
                <div className="rounded-[14px] border border-[#e4edf7] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(245,249,255,0.98))] p-4" key={item.item}>
                  <strong className="block font-black text-[#101b31]">{item.item}</strong>
                  <span className="mt-1.5 block text-[13px] font-black text-[#b45309]">{item.branch} stock: {item.stock} units</span>
                  <small className="mt-1 block leading-snug text-[#637083]">Suggest {item.reorder} units from {item.supplier} - {item.confidence} confidence</small>
                </div>
              )) : (
                <div className="rounded-[14px] border border-dashed border-[#d4e2f4] bg-[#f8fbff] p-4 text-sm font-bold text-[#637083]">
                  No live reorder suggestions available from MongoDB right now.
                </div>
              )}
            </div>
          </article>
        </aside>
      </section>

      <section className="mx-auto mb-4 grid w-full max-w-[1440px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
        <article className={panelClass}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className={sectionLabel}>Supplier-linked Purchases</p>
              <h2 className={headingTwo}>Supplier scorecards</h2>
            </div>
            <FiUsers className="size-[26px] text-[#0a62df]" aria-hidden="true" />
          </div>
          <div className="grid gap-3">
            {supplierScorecards.length > 0 ? supplierScorecards.map((supplier) => (
              <div className="rounded-[14px] border border-[#e3edf8] bg-[#f8fbff] p-4" key={supplier.name}>
                <span className="block font-black text-[#101b31]">{supplier.name}</span>
                <strong className="mt-1.5 block text-sm font-bold text-[#0a62df]">{supplier.score}% {supplier.metric}</strong>
                <small className="mt-1 block leading-snug text-[#637083]">{supplier.purchaseOrders} active purchase orders</small>
              </div>
            )) : (
              <div className="rounded-[14px] border border-dashed border-[#d4e2f4] bg-[#f8fbff] p-4 text-sm font-bold text-[#637083]">
                No live supplier scorecards available from MongoDB right now.
              </div>
            )}
          </div>
        </article>

        <article className={panelClass}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className={sectionLabel}>Approval Workflow</p>
              <h2 className={headingTwo}>Status tracking</h2>
            </div>
            <FiShield className="size-[26px] text-[#0a62df]" aria-hidden="true" />
          </div>
          <div className="grid gap-3.5">
            {workflowSteps.map((step) => (
              <div className="grid grid-cols-[38px_minmax(0,1fr)] items-start gap-3" key={step.title}>
                <span className={cn('grid size-[38px] place-items-center rounded-full font-black', step.active ? 'bg-[#0a62df] text-white' : 'bg-[#eef4fb] text-[#67768b]')}>{step.number}</span>
                <div>
                  <strong className="block text-[15px] font-bold text-[#101b31]">{step.title}</strong>
                  <small className="mt-1 block leading-snug text-[#637083]">{step.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(11,30,58,0.42)] p-5 backdrop-blur-xl" role="presentation">
          <section className="w-full max-w-[560px] rounded-[20px] border border-[#dbe8f7] bg-white p-6 shadow-[0_28px_80px_rgba(8,35,80,0.24)]" role="dialog" aria-modal="true" aria-labelledby="create-po-title">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className={sectionLabel}>New Supplier Order</p>
                <h2 className={headingTwo} id="create-po-title">Create Purchase Order</h2>
              </div>
              <button className="inline-grid size-10 place-items-center rounded-xl border-0 bg-[#eef4fb] text-[#5f6f86]" type="button" onClick={() => setIsCreateOpen(false)} aria-label="Close">
                <FiXCircle aria-hidden="true" />
              </button>
            </div>

            <form className="grid gap-4" onSubmit={handleCreateOrder}>
              <label className="grid gap-2 text-[13px] font-black text-[#25344e]">Supplier
                <select className="min-h-[46px] w-full rounded-xl border border-[#d8e5f3] bg-[#f8fbff] px-3.5 text-[#172033] outline-none transition focus:border-[#0a62df] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,98,223,0.12)]" value={form.supplierId} onChange={(event) => setForm({ ...form, supplierId: event.target.value })} required>
                  <option value="">Select MongoDB supplier</option>
                  {supplierOptions.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>{supplier.label}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-[13px] font-black text-[#25344e]">Branch
                <select className="min-h-[46px] w-full rounded-xl border border-[#d8e5f3] bg-[#f8fbff] px-3.5 text-[#172033] outline-none transition focus:border-[#0a62df] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,98,223,0.12)]" value={form.branchId} onChange={(event) => setForm({ ...form, branchId: event.target.value })} required>
                  <option value="">Select MongoDB branch</option>
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.label}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-[13px] font-black text-[#25344e]">Category<input className="min-h-[46px] w-full rounded-xl border border-[#d8e5f3] bg-[#f8fbff] px-3.5 text-[#172033] outline-none transition focus:border-[#0a62df] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,98,223,0.12)]" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Mixed Stock" /></label>
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                <label className="grid gap-2 text-[13px] font-black text-[#25344e]">Order Date<input className="min-h-[46px] w-full rounded-xl border border-[#d8e5f3] bg-[#f8fbff] px-3.5 text-[#172033] outline-none transition focus:border-[#0a62df] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,98,223,0.12)]" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
                <label className="grid gap-2 text-[13px] font-black text-[#25344e]">Expected Date<input className="min-h-[46px] w-full rounded-xl border border-[#d8e5f3] bg-[#f8fbff] px-3.5 text-[#172033] outline-none transition focus:border-[#0a62df] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,98,223,0.12)]" type="date" value={form.expectedDate} onChange={(event) => setForm({ ...form, expectedDate: event.target.value })} /></label>
              </div>
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                <label className="grid gap-2 text-[13px] font-black text-[#25344e]">Total Amount<input className="min-h-[46px] w-full rounded-xl border border-[#d8e5f3] bg-[#f8fbff] px-3.5 text-[#172033] outline-none transition focus:border-[#0a62df] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,98,223,0.12)]" type="number" min="1" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="12500.00" required /></label>
                <label className="grid gap-2 text-[13px] font-black text-[#25344e]">Item Count<input className="min-h-[46px] w-full rounded-xl border border-[#d8e5f3] bg-[#f8fbff] px-3.5 text-[#172033] outline-none transition focus:border-[#0a62df] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,98,223,0.12)]" type="number" min="1" value={form.items} onChange={(event) => setForm({ ...form, items: event.target.value })} required /></label>
              </div>
              <label className="grid gap-2 text-[13px] font-black text-[#25344e]">
                Priority
                <select className="min-h-[46px] w-full rounded-xl border border-[#d8e5f3] bg-[#f8fbff] px-3.5 text-[#172033] outline-none transition focus:border-[#0a62df] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,98,223,0.12)]" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                  <option>Normal</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>
              <div className="mt-1.5 flex flex-col-reverse justify-end gap-3 md:flex-row">
                <button className="min-h-10 rounded-[10px] border-0 bg-[#edf4fb] px-4 font-black text-[#34445d]" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                <button className={cn(buttonBase, 'bg-[#0a62df] text-white shadow-[0_12px_24px_rgba(3,77,181,0.26)]')} type="submit"><FiPlus aria-hidden="true" /> Create Purchase Order</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default PurchaseOrdersPage
