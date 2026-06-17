import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiClipboard,
  FiDownload,
  FiEdit2,
  FiList,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiTruck,
  FiXCircle,
} from 'react-icons/fi';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import {
  approveTransfer,
  cancelTransfer,
  completeTransfer,
  buildCreateTransferPayload,
  createTransfer,
  dispatchTransfer,
  updateTransfer,
  getApiErrorMessage,
  getBranchInventory,
  getBranches,
  buildLogsFromTransfers,
  enrichMovementLogs,
  toDisplayString,
  getMovementHistory,
  getProducts,
  getBranchStockAvailability,
  getBranchTransferReports,
  getTransferActivityLogs,
  getTransferAnalytics,
  getTransferPermissions,
  listTransfers,
  mapStatusToApi,
  mapStatusToUi,
  normalizeStockRow,
  rejectTransfer,
} from '../../services/stockTransferApi';
import {
  WORKFLOW_STEPS,
  canEditTransfer,
  getTransferUiActions,
  coalescePermissions,
  filterTransfersByScope,
  getUserBranchIds,
  getWorkflowStepIndex,
  isActiveForProgressTab,
  resolveStockTransferRole,
} from '../../services/stockTransferPermissions';
import TransferActivityTrail from '../../components/stock-transfer/TransferActivityTrail';
import TransferEditPanel from '../../components/stock-transfer/TransferEditPanel';
import TransferLogsTab from '../../components/stock-transfer/TransferLogsTab';
import {
  AlertBanner,
  EmptyState,
  FilterBar,
  KpiCard,
  PageHero,
  PanelHeader,
  SearchField,
  StatusBadge,
  WorkflowGuide,
  TransferTable,
  transferTableCellClass,
  transferTableRowClass,
} from '../../components/stock-transfer/StockTransferUI';
import {
  cn,
  stBtnDanger,
  stBtnGhost,
  stBtnPrimary,
  stCardActions,
  stChartArea,
  stChartPanel,
  stChartTitle,
  stFieldFull,
  stFieldInput,
  stFieldLabel,
  stFieldLabelText,
  stFormGrid,
  stIntro,
  stMetaText,
  stPage,
  stPanel,
  stPipeline,
  stPipelineApproved,
  stPipelineCardInner,
  stPipelinePending,
  stPipelineRejected,
  stPipelineTransit,
  stProductMeta,
  stReportsGrid,
  stRoutePill,
  stStep,
  stStepDot,
  stStepDotCurrent,
  stStepDotDone,
  stStepLabel,
  stStepper,
  stTabBtn,
  stTabBtnActive,
  stTabContent,
  stTabNav,
  stTransferCard,
  stTransferCardApproved,
  stTransferCardPending,
  stTransferCards,
  stTransferId,
  stMetricsGrid,
  statusBadgeClass,
} from '../../components/stock-transfer/stockTransferClasses';
import { formatLogDate, formatUserLabel } from '../../services/stockTransferApi';
import {
  buildStockTransferReportMeta,
  exportStockTransferExcel,
  exportStockTransferPdf,
} from '../../components/stock-transfer/stockTransferExport';
import {
  matchesStockRowSearch,
  matchesTransferSearch,
  normalizeSearchQuery,
} from '../../components/stock-transfer/stockTransferSearch';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Approved: '#3b82f6',
  'In Transit': '#6366f1',
  Completed: '#10b981',
  Cancelled: '#ef4444',
  Rejected: '#dc2626',
};

const TAB_DEFS = [
  { id: 'request', label: 'New Request', icon: FiClipboard },
  { id: 'tracking', label: 'Progress', icon: FiTruck },
  { id: 'availability', label: 'Branch Stock', icon: FiPackage },
  { id: 'history', label: 'History', icon: FiSearch },
  { id: 'reports', label: 'Reports', icon: FiBarChart2 },
  { id: 'logs', label: 'Logs', icon: FiList },
];

function StockTransferPage() {
  const { user } = useAuth();
  const roleSlug = useMemo(() => resolveStockTransferRole(user), [user]);
  const [serverPerms, setServerPerms] = useState(null);
  const perms = useMemo(
    () => coalescePermissions(serverPerms, roleSlug),
    [serverPerms, roleSlug],
  );

  const [activeTab, setActiveTab] = useState('tracking');
  const [transfers, setTransfers] = useState([]);
  const [transferSummary, setTransferSummary] = useState(null);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockRows, setStockRows] = useState([]);
  const [sourceInventory, setSourceInventory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [branchReports, setBranchReports] = useState(null);
  const [movementLogs, setMovementLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [logsSource, setLogsSource] = useState('');

  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiMessage, setApiMessage] = useState('Connecting to API…');

  const [message, setMessage] = useState('');
  const [progressSearch, setProgressSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatus, setHistoryStatus] = useState('All');
  const [stockBranch, setStockBranch] = useState('All');
  const [stockSearch, setStockSearch] = useState('');
  const [editingTransferId, setEditingTransferId] = useState(null);

  const [form, setForm] = useState({
    fromBranchId: '',
    toBranchId: '',
    productId: '',
    quantity: '',
    notes: '',
  });

  const loadTransfers = useCallback(
    async (statusFilter, branchList = [], { updateState = true } = {}) => {
      const params = { limit: 100, page: 1 };
      if (statusFilter && statusFilter !== 'All') {
        params.status = mapStatusToApi(statusFilter);
      }
      const { items, permissions, summary } = await listTransfers(params);
      if (permissions) setServerPerms(permissions);
      if (updateState) {
        setTransfers(items);
        if (summary) setTransferSummary(summary);
      }
      return items;
    },
    [],
  );

  const mergeTransfers = useCallback((...lists) => {
    const map = new Map();
    lists.flat().forEach((t) => {
      if (!t) return;
      const key = String(t._id ?? t.id ?? '');
      if (key) map.set(key, t);
    });
    return [...map.values()];
  }, []);

  const loadStockForBranches = useCallback(async (branchList) => {
    if (!branchList.length) {
      setStockRows([]);
      return;
    }
    setStockLoading(true);
    try {
      const results = await Promise.all(
        branchList.map(async (branch) => {
          try {
            const inventory = await getBranchInventory(branch.id);
            return inventory.map((row) => normalizeStockRow(row, branch.name));
          } catch {
            return [];
          }
        }),
      );
      setStockRows(results.flat());
    } finally {
      setStockLoading(false);
    }
  }, []);

  const loadSourceInventory = useCallback(async (branchId, branchName) => {
    if (!branchId) {
      setSourceInventory([]);
      return;
    }
    try {
      const rows = await getBranchInventory(branchId);
      setSourceInventory(rows.map((row) => normalizeStockRow(row, branchName)));
    } catch {
      setSourceInventory([]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    let apiPerms = null;
    try {
      apiPerms = await getTransferPermissions();
      if (apiPerms) setServerPerms(apiPerms);
    } catch {
      // use client fallback perms
    }

    const [branchesResult, productsResult] = await Promise.allSettled([
      getBranches(),
      getProducts(),
    ]);

    const branchList =
      branchesResult.status === 'fulfilled' ? branchesResult.value : [];

    const transfersResult = await Promise.allSettled([
      loadTransfers('All', branchList),
    ]);

    const productList =
      productsResult.status === 'fulfilled' ? productsResult.value : [];
    const transferItems =
      transfersResult.status === 'fulfilled' ? transfersResult.value : [];
    const transferLoadError =
      transfersResult.status === 'rejected' ? transfersResult.reason : null;

    setBranches(branchList);
    setProducts(productList);
    setTransfers(transferItems);

    const hasBranches = branchList.length > 0;
    setApiConnected(hasBranches);

    if (hasBranches) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const productNote =
        productList.length > 0
          ? `${productList.length} products`
          : 'products from inventory';
      const transferNote = transferLoadError
        ? `Transfers failed: ${getApiErrorMessage(transferLoadError, 'access denied or server error')}`
        : `${transferItems.length} transfers`;
      setApiMessage(
        `Connected · ${branchList.length} branches · ${productNote} · ${transferNote} · ${time}`,
      );
      if (transferLoadError && (apiPerms?.canApproveTransfer ?? roleSlug === 'admin')) {
        setMessage(
          getApiErrorMessage(
            transferLoadError,
            'Could not load transfers. If your role is Admin, ensure the backend accepts your role (restart API after update) and click Sync.',
          ),
        );
      }
    } else {
      const err =
        branchesResult.status === 'rejected' ? branchesResult.reason : null;
      setApiMessage(
        getApiErrorMessage(
          err,
          'No branches returned. Add branches in the database and click Sync (must be logged in).',
        ),
      );
    }

    const homeBranchId = getUserBranchIds(user, branchList)[0] ?? null;
    const fromDefault = homeBranchId || branchList[0]?.id || '';
    const toDefault =
      branchList.find((b) => b.id !== fromDefault)?.id ??
      branchList[1]?.id ??
      '';

    setForm((prev) => ({
      ...prev,
      fromBranchId: prev.fromBranchId || fromDefault,
      toBranchId:
        prev.toBranchId && prev.toBranchId !== (prev.fromBranchId || fromDefault)
          ? prev.toBranchId
          : toDefault,
      productId: prev.productId || productList[0]?.id || '',
    }));

    if (branchList.length) {
      const stockBranches =
        homeBranchId && !apiPerms?.canViewAllBranches
          ? branchList.filter((b) => b.id === homeBranchId)
          : branchList;
      await loadStockForBranches(stockBranches.length ? stockBranches : branchList);
      const fromId = homeBranchId || branchList[0]?.id;
      const fromName = branchList.find((b) => b.id === fromId)?.name ?? '';
      if (fromId) await loadSourceInventory(fromId, fromName);
    }

    setLoading(false);
  }, [loadStockForBranches, loadSourceInventory, loadTransfers, user, roleSlug]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!form.fromBranchId || !apiConnected) return;
    const branchName = branches.find((b) => b.id === form.fromBranchId)?.name ?? '';
    loadSourceInventory(form.fromBranchId, branchName);
  }, [form.fromBranchId, form.productId, apiConnected, branches, loadSourceInventory]);

  const userBranchIds = useMemo(
    () => getUserBranchIds(user, branches),
    [user, branches],
  );

  const visibleTabs = useMemo(
    () => TAB_DEFS.filter((tab) => perms.tabs[tab.id]),
    [perms.tabs],
  );

  const visibleTransfers = useMemo(
    () => filterTransfersByScope(transfers, perms, userBranchIds, branches, user),
    [transfers, perms, userBranchIds, branches, user],
  );

  useEffect(() => {
    if (!visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(perms.defaultTab ?? visibleTabs[0]?.id ?? 'tracking');
    }
  }, [visibleTabs, activeTab, perms.defaultTab]);

  useEffect(() => {
    if (!apiConnected || !['tracking', 'history'].includes(activeTab)) return;
    loadTransfers('All', branches).catch(() => {});
  }, [activeTab, apiConnected, branches, loadTransfers]);

  useEffect(() => {
    if (!apiConnected || activeTab !== 'tracking' || !perms.canCreateTransfer) return;
    const interval = window.setInterval(() => {
      loadTransfers('All', branches).catch(() => {});
    }, 20000);
    const onFocus = () => loadTransfers('All', branches).catch(() => {});
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [activeTab, apiConnected, branches, loadTransfers, perms.canCreateTransfer]);

  useEffect(() => {
    if (!apiConnected || activeTab !== 'reports' || !perms.tabs.reports) return;
    getTransferAnalytics()
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
    getBranchTransferReports()
      .then(setBranchReports)
      .catch(() => setBranchReports(null));
  }, [apiConnected, activeTab, perms.tabs.reports]);

  const loadTransferLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError('');

    const scopedTransfers = filterTransfersByScope(
      transfers,
      perms,
      userBranchIds,
      branches,
      user,
    );
    const instantRows = buildLogsFromTransfers(scopedTransfers);
    if (instantRows.length) {
      setMovementLogs(instantRows);
      setLogsSource('Showing transfer records loaded on this page');
    }

    try {
      let rows = [];
      if (perms.canViewTransferLogs) {
        try {
          rows = await getTransferActivityLogs({ limit: 200, page: 1 });
          if (rows.length) {
            setLogsSource('Transfer activity logs from API');
          }
        } catch {
          rows = [];
        }
      }
      if (!rows.length) {
        rows = await getMovementHistory({ limit: 100, page: 1 });
        rows = enrichMovementLogs(rows, scopedTransfers);
      }
      if (rows.length) {
        setMovementLogs(rows);
        if (!perms.canViewTransferLogs) setLogsSource('');
        setLogsError('');
      } else if (!instantRows.length) {
        setLogsError('');
      }
    } catch (err) {
      if (!instantRows.length) {
        setLogsError(getApiErrorMessage(err, 'Could not load movement history from API.'));
      } else {
        setLogsError('');
      }
    } finally {
      setLogsLoading(false);
    }
  }, [transfers, perms, userBranchIds, branches, user]);

  useEffect(() => {
    if (activeTab !== 'logs' || !perms.tabs.logs) return;
    const scoped = filterTransfersByScope(
      transfers,
      perms,
      userBranchIds,
      branches,
      user,
    );
    const instant = buildLogsFromTransfers(scoped);
    if (instant.length) {
      setMovementLogs(instant);
      setLogsSource('Showing transfer records loaded on this page');
    }
    loadTransferLogs();
  }, [activeTab, loadTransferLogs, perms.tabs.logs]);

  const activeTransfers = useMemo(
    () => visibleTransfers.filter((t) => isActiveForProgressTab(t, perms)),
    [visibleTransfers, perms],
  );

  const pendingForApproval = useMemo(
    () => visibleTransfers.filter((t) => t.status === 'Pending'),
    [visibleTransfers],
  );

  const sortedActiveTransfers = useMemo(() => {
    return [...activeTransfers].sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
  }, [activeTransfers]);

  const filteredActiveTransfers = useMemo(
    () =>
      sortedActiveTransfers.filter((t) => matchesTransferSearch(t, progressSearch)),
    [sortedActiveTransfers, progressSearch],
  );

  const hasProgressSearch = normalizeSearchQuery(progressSearch).length > 0;
  const hasHistorySearch = normalizeSearchQuery(historySearch).length > 0;
  const hasStockSearch = normalizeSearchQuery(stockSearch).length > 0;

  const progressPipeline = useMemo(() => {
    if (transferSummary) {
      return {
        Pending: transferSummary.pending ?? 0,
        Approved: transferSummary.approved ?? 0,
        'In Transit': transferSummary.inTransit ?? 0,
        Rejected: transferSummary.rejected ?? 0,
      };
    }
    const counts = {
      Pending: 0,
      Approved: 0,
      'In Transit': 0,
      Rejected: 0,
    };
    visibleTransfers.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status] += 1;
    });
    return counts;
  }, [visibleTransfers, transferSummary]);

  const hiddenByBranchScope = transfers.length - visibleTransfers.length;

  const historyTransfers = useMemo(() => {
    return visibleTransfers
      .filter((t) => {
        const matchStatus = historyStatus === 'All' || t.status === historyStatus;
        return matchStatus && matchesTransferSearch(t, historySearch);
      })
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  }, [visibleTransfers, historySearch, historyStatus]);

  const catalogProducts = useMemo(() => {
    if (products.length) return products;
    const map = new Map();
    stockRows.forEach((row) => {
      if (!row.productId) return;
      map.set(String(row.productId), {
        id: row.productId,
        name: row.productName,
        sku: row.sku,
        unit: row.unit,
      });
    });
    return [...map.values()];
  }, [products, stockRows]);

  const stockBranchOptions = useMemo(() => {
    if (perms.canViewAllBranches) return branches;
    if (userBranchIds.length) {
      return branches.filter((b) => userBranchIds.includes(b.id));
    }
    return branches;
  }, [branches, perms.canViewAllBranches, userBranchIds]);

  const managerHomeBranchId = useMemo(
    () => (perms.viewScope === 'branch' ? userBranchIds[0] : null),
    [perms.viewScope, userBranchIds],
  );

  useEffect(() => {
    if (activeTab !== 'availability' || !apiConnected) return;
    if (stockBranch === 'All' || !stockBranch) return;
    const branch = branches.find((b) => b.name === stockBranch);
    if (!branch?.id) return;
    let cancelled = false;
    setStockLoading(true);
    getBranchStockAvailability(branch.id)
      .then((rows) => {
        if (!cancelled && rows.length) {
          setStockRows((prev) => {
            const others = prev.filter((r) => r.branch !== stockBranch);
            return [...others, ...rows];
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setStockLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, apiConnected, stockBranch, branches]);

  const filteredStockRows = useMemo(() => {
    let rows = stockRows;
    if (perms.viewScope === 'branch' && userBranchIds.length) {
      const names = userBranchIds
        .map((id) => branches.find((b) => b.id === id)?.name)
        .filter(Boolean);
      rows = rows.filter((row) => names.includes(row.branch));
    }
    return rows.filter((row) => {
      const matchBranch = stockBranch === 'All' || row.branch === stockBranch;
      return matchBranch && matchesStockRowSearch(row, stockSearch);
    });
  }, [stockRows, stockBranch, stockSearch, perms.viewScope, userBranchIds, branches]);

  const kpis = useMemo(() => {
    const inTransit = visibleTransfers.filter((t) => t.status === 'In Transit').length;
    const pending = visibleTransfers.filter((t) => t.status === 'Pending').length;
    const completed = visibleTransfers.filter((t) => t.status === 'Completed').length;
    const lowStock = stockRows.filter((s) => s.reorder > 0 && s.qty < s.reorder).length;
    return { inTransit, pending, completed, lowStock };
  }, [visibleTransfers, stockRows]);

  const selectedProduct = catalogProducts.find(
    (p) => String(p.id) === String(form.productId),
  );
  const fromBranchName = branches.find((b) => b.id === form.fromBranchId)?.name ?? '';
  const sourceStock =
    sourceInventory.find((s) => String(s.productId) === String(form.productId)) ??
    stockRows.find(
      (s) => s.branch === fromBranchName && String(s.productId) === String(form.productId),
    );
  const availableQty = sourceStock?.qty ?? 0;

  const reportByBranch = useMemo(() => {
    const fromApi = branchReports?.byFromBranch ?? branchReports?.byToBranch;
    if (Array.isArray(fromApi) && fromApi.length) {
      return fromApi.map((row) => ({
        branch: row.branchName ?? row.branchCode ?? 'Branch',
        transfers: row.totalTransfers ?? row.total ?? 0,
        units: row.totalUnits ?? row.units ?? 0,
      }));
    }
    const volume = analytics?.volumeSummary ?? analytics?.byBranch ?? [];
    if (Array.isArray(volume) && volume.length) {
      return volume.map((row) => ({
        branch: row.branchName ?? row.branch ?? row.name ?? 'Branch',
        transfers: row.transferCount ?? row.transfers ?? 0,
        units: row.totalUnits ?? row.units ?? 0,
      }));
    }
    const counts = {};
    transfers.forEach((t) => {
      const key = (t.from || 'Unknown').split(' ')[0];
      if (!counts[key]) counts[key] = { branch: key, transfers: 0, units: 0 };
      counts[key].transfers += 1;
      counts[key].units += t.qty;
    });
    return Object.values(counts);
  }, [analytics, transfers, branchReports]);

  const reportByStatus = useMemo(() => {
    const apiStatus = branchReports?.byStatus;
    if (Array.isArray(apiStatus) && apiStatus.length) {
      return apiStatus.map((row) => {
        const name = mapStatusToUi(row._id ?? row.status);
        return {
          name,
          value: row.count ?? 0,
          color: STATUS_COLORS[name] ?? '#94a3b8',
        };
      });
    }
    const summary = analytics?.statusSummary;
    if (summary && typeof summary === 'object') {
      return Object.entries(summary).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        value: typeof value === 'number' ? value : value?.count ?? 0,
        color: STATUS_COLORS[name] ?? '#94a3b8',
      }));
    }
    const counts = {};
    transfers.forEach((t) => {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] ?? '#94a3b8',
    }));
  }, [analytics, transfers, branchReports]);

  const buildExportReport = useCallback(
    () =>
      buildStockTransferReportMeta({
        transfers: visibleTransfers,
        roleLabel: perms.label ?? 'User',
        kpis,
        byBranch: reportByBranch,
        byStatus: reportByStatus,
        pipeline: progressPipeline,
      }),
    [
      visibleTransfers,
      perms.label,
      kpis,
      reportByBranch,
      reportByStatus,
      progressPipeline,
    ],
  );

  const handleExportExcel = () => {
    if (!perms.canExportReports) {
      setMessage('Export is not available for your role.');
      return;
    }
    try {
      const report = buildExportReport();
      if (!report.exportRows.length) {
        setMessage('No transfers to export. Sync data or adjust filters.');
        return;
      }
      const count = exportStockTransferExcel(report);
      setMessage(`Exported ${count} transfer(s) to Excel (CSV).`);
    } catch (err) {
      setMessage(err?.message ?? 'Excel export failed.');
    }
  };

  const handleExportPdf = () => {
    if (!perms.canExportReports) {
      setMessage('Export is not available for your role.');
      return;
    }
    try {
      const report = buildExportReport();
      if (!report.exportRows.length) {
        setMessage('No transfers to export. Sync data or adjust filters.');
        return;
      }
      const result = exportStockTransferPdf(report);
      const count = result.count;
      if (result.mode === 'html') {
        setMessage(
          `Downloaded report HTML for ${count} transfer(s). Open the file → Print → Save as PDF.`,
        );
      } else if (result.mode === 'print') {
        setMessage(
          `Print dialog opened for ${count} transfer(s). Choose "Save as PDF" as the printer.`,
        );
      } else {
        setMessage(
          `Report opened in a new tab (${count} transfer(s)). Use Print → Save as PDF.`,
        );
      }
    } catch (err) {
      setMessage(err?.message ?? 'PDF export failed.');
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!apiConnected) {
      setMessage('API not connected. Check backend and login token.');
      return;
    }
    const qty = parseInt(form.quantity, 10);
    if (!qty || qty < 1) {
      setMessage('Enter a valid quantity.');
      return;
    }
    if (form.fromBranchId === form.toBranchId) {
      setMessage('Source and destination branches must be different.');
      return;
    }
    if (!form.fromBranchId || !form.toBranchId || !form.productId) {
      setMessage('Select source branch, destination branch, and product.');
      return;
    }
    if (sourceStock && qty > availableQty) {
      setMessage(
        `Insufficient stock at source. Available: ${availableQty} ${selectedProduct?.unit ?? 'units'}.`,
      );
      return;
    }

    if (!perms.canCreateTransfer) {
      setMessage('Only managers can create transfer requests.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createTransfer(
        buildCreateTransferPayload({
          fromBranchId: form.fromBranchId,
          toBranchId: form.toBranchId,
          productId: form.productId,
          quantity: qty,
          notes: form.notes,
        }),
      );
      try {
        const listed = await loadTransfers('All', branches);
        setTransfers(mergeTransfers([created], listed));
      } catch {
        setTransfers((prev) => mergeTransfers([created], prev));
      }
      setForm((prev) => ({ ...prev, quantity: '', notes: '' }));
      setMessage(
        `Request ${created.id} submitted (Pending). An admin will Approve or Reject on Progress. You can track it there.`,
      );
      setActiveTab('tracking');
      await loadStockForBranches(branches);
      const fromName = branches.find((b) => b.id === form.fromBranchId)?.name ?? '';
      await loadSourceInventory(form.fromBranchId, fromName);
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Could not create transfer.'));
    } finally {
      setSubmitting(false);
    }
  };

  const updateTransferInList = (updated) => {
    setTransfers((prev) =>
      prev.map((t) => (t._id === updated._id ? updated : t)),
    );
  };

  const handleApprove = async (transfer) => {
    if (!transfer._id || !perms.canApproveTransfer) return;
    setSubmitting(true);
    try {
      const updated = await approveTransfer(transfer._id);
      updateTransferInList(updated);
      setMessage(
        `${updated.id} approved — manager can dispatch when ready; destination manager confirms receipt.`,
      );
      await loadStockForBranches(branches);
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Approve failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (transfer, editForm) => {
    if (!transfer._id || !canEditTransfer(transfer, perms)) {
      setMessage('Transfers can only be edited while Pending (before admin approval).');
      return;
    }
    const qty = parseInt(editForm.quantity, 10);
    if (!qty || qty < 1) {
      setMessage('Enter a valid quantity.');
      return;
    }
    if (editForm.fromBranchId === editForm.toBranchId) {
      setMessage('Source and destination must be different.');
      return;
    }

    const payload = {
      fromBranch: editForm.fromBranchId,
      toBranch: editForm.toBranchId,
      items: [{ product: editForm.productId, quantity: qty }],
      notes: editForm.notes || undefined,
    };

    setSubmitting(true);
    try {
      const updated = await updateTransfer(transfer._id, payload);
      updateTransferInList(updated);
      setEditingTransferId(null);
      setMessage(`${updated.id} updated — still Pending until admin approves.`);
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Could not update transfer.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (transfer) => {
    if (!transfer._id || !perms.canRejectTransfer) return;
    const reason = window.prompt('Reason for rejection (required):');
    if (!reason?.trim()) return;
    setSubmitting(true);
    try {
      const updated = await rejectTransfer(transfer._id, reason.trim());
      updateTransferInList({
        ...updated,
        status: 'Rejected',
        rejectReason: updated.rejectReason || reason.trim(),
      });
      setMessage(
        `${updated.id} rejected. Manager must create a new request if needed.`,
      );
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Reject failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatch = async (transfer) => {
    if (!transfer._id || !perms.canDispatchTransfer) return;
    setSubmitting(true);
    try {
      const updated = await dispatchTransfer(transfer._id);
      updateTransferInList(updated);
      setMessage(
        `${updated.id} dispatched — In Transit. Stock deducted at source; destination manager can confirm receipt.`,
      );
      await loadStockForBranches(branches);
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Dispatch failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReceipt = async (transfer) => {
    const { showConfirm } = getTransferUiActions(
      transfer,
      perms,
      userBranchIds,
      branches,
    );
    if (!transfer._id || !showConfirm) {
      setMessage('Only the destination branch manager can confirm receipt.');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await completeTransfer(transfer._id);
      updateTransferInList(updated);
      setMessage(
        `${updated.id} completed — stock added at destination, movement logged.`,
      );
      await loadStockForBranches(branches);
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Receipt confirmation failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (transfer) => {
    const { showCancel } = getTransferUiActions(
      transfer,
      perms,
      userBranchIds,
      branches,
    );
    if (!transfer._id || !showCancel) {
      return;
    }
    const cancelReason = window.prompt('Reason for cancellation (required):');
    if (!cancelReason?.trim()) return;
    setSubmitting(true);
    try {
      const updated = await cancelTransfer(transfer._id, cancelReason.trim());
      setTransfers((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setMessage(`${updated.id} cancelled.`);
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Cancel failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const isErrorMessage =
    message &&
    (message.includes('Insufficient') ||
      message.includes('valid') ||
      message.includes('different') ||
      message.includes('failed') ||
      message.includes('permission') ||
      message.includes('not connected'));

  const switchTab = (id) => {
    setActiveTab(id);
    setMessage('');
    if ((id === 'tracking' || id === 'history') && apiConnected) {
      loadTransfers('All', branches).catch((err) => {
        setMessage(getApiErrorMessage(err, 'Could not refresh transfers.'));
      });
    }
    if (id === 'reports' && apiConnected && perms.tabs.reports) {
      getTransferAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
      getBranchTransferReports().then(setBranchReports).catch(() => setBranchReports(null));
    }
    if (id === 'logs' && perms.tabs.logs) {
      const instant = buildLogsFromTransfers(
        filterTransfersByScope(transfers, perms, userBranchIds, branches, user),
      );
      if (instant.length) setMovementLogs(instant);
      loadTransferLogs();
    }
  };

  return (
    <div className={stPage}>
        <PageHero
          perms={perms}
          connected={apiConnected}
          branchCount={branches.length}
          productCount={products.length}
          transferCount={transfers.length}
          loading={loading}
          onSync={refreshAll}
        />

        <WorkflowGuide perms={perms} />

        <p className={stIntro}>
          {perms.isViewOnly
            ? `View progress, history, branch stock, and reports (${perms.label} — read only, no actions).`
            : perms.canApproveTransfer
              ? `Approve or reject manager requests, track full progress, and review Logs (${perms.label}).`
              : `Create requests, edit or cancel while Pending, dispatch when Approved, confirm receipt at destination (${perms.label}).`}
        </p>

        <div className={stMetricsGrid} aria-label="Transfer summary">
          <KpiCard variant="primary" icon={FiTruck} value={kpis.inTransit} label="In transit" />
          <KpiCard variant="warning" icon={FiClipboard} value={kpis.pending} label={perms.canApproveTransfer ? 'Awaiting approval' : 'Pending'} />
          <KpiCard variant="success" icon={FiCheck} value={kpis.completed} label="Completed" />
          <KpiCard variant="info" icon={FiPackage} value={kpis.lowStock} label="Low-stock lines" />
        </div>

        {message ? (
          <AlertBanner variant={isErrorMessage ? 'warn' : 'success'}>
            {message}
          </AlertBanner>
        ) : null}

        <nav className={stTabNav} aria-label="Stock transfer features">
          {visibleTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={cn(stTabBtn, activeTab === id && stTabBtnActive)}
              onClick={() => switchTab(id)}
            >
              <Icon aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        <div className={stTabContent}>
        {loading && activeTab === 'request' ? (
          <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">Loading branches and products…</p>
        ) : null}

        {activeTab === 'logs' && perms.tabs.logs ? (
          <TransferLogsTab
            perms={perms}
            logsLoading={logsLoading}
            logsError={logsError}
            movementLogs={movementLogs}
            scopedTransfers={filterTransfersByScope(
              transfers,
              perms,
              userBranchIds,
              branches,
              user,
            )}
            onRefresh={loadTransferLogs}
          />
        ) : null}

        {activeTab === 'logs' && !perms.tabs.logs ? (
          <section className={stPanel}>
            <EmptyState
              icon="🔒"
              title="Logs not available for your role"
              description="Transfer movement logs are available to managers and administrators. Switch account or contact your admin if you need access."
            />
          </section>
        ) : null}

        {activeTab === 'request' && perms.tabs.request && (
          <section className={stPanel} aria-labelledby="transfer-request-title">
            <PanelHeader
              icon={FiClipboard}
              title="Create transfer request"
              subtitle="Manager workflow: request stays Pending until admin approves; after approval, dispatch moves stock to In Transit."
            />
            {!perms.canCreateTransfer && perms.tabs.request ? (
              <AlertBanner variant="warn">
                Your manager profile needs a <strong className="font-semibold">branch</strong>{' '}
                assigned before you can submit requests. Ask an admin to set branchId on your
                user, then click Sync.
              </AlertBanner>
            ) : null}
            <form className={stFormGrid} onSubmit={handleSubmitRequest}>
              <label className={stFieldLabel}>
                <span className={stFieldLabelText}>From branch</span>
                <select
                  className={stFieldInput}
                  value={form.fromBranchId}
                  onChange={(e) => handleFormChange('fromBranchId', e.target.value)}
                  required
                  disabled={!branches.length || Boolean(managerHomeBranchId)}
                >
                  {!branches.length && (
                    <option value="">No branches loaded — click Sync</option>
                  )}
                  {(managerHomeBranchId
                    ? branches.filter((b) => b.id === managerHomeBranchId)
                    : branches
                  ).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={stFieldLabel}>
                <span className={stFieldLabelText}>To branch</span>
                <select
                  className={stFieldInput}
                  value={form.toBranchId}
                  onChange={(e) => handleFormChange('toBranchId', e.target.value)}
                  required
                  disabled={!branches.length}
                >
                  {!branches.length && (
                    <option value="">No branches loaded — click Sync</option>
                  )}
                  {branches
                    .filter((b) => b.id !== form.fromBranchId)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className={stFieldLabel}>
                <span className={stFieldLabelText}>Product</span>
                <select
                  className={stFieldInput}
                  value={form.productId}
                  onChange={(e) => handleFormChange('productId', e.target.value)}
                  required
                  disabled={!catalogProducts.length}
                >
                  {!catalogProducts.length && (
                    <option value="">No products loaded — click Sync</option>
                  )}
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className={stFieldLabel}>
                <span className={stFieldLabelText}>
                  Quantity ({selectedProduct?.unit ?? 'units'})
                </span>
                <input
                  className={stFieldInput}
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                  placeholder={
                    availableQty ? `Max ${availableQty} at source` : 'Enter quantity'
                  }
                  required
                  disabled={!form.productId}
                />
              </label>
              <label className={cn(stFieldLabel, stFieldFull)}>
                <span className={stFieldLabelText}>Notes (optional)</span>
                <textarea
                  className={stFieldInput}
                  rows={3}
                  value={form.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="Reason for transfer, batch numbers, handling instructions..."
                />
              </label>
              <div className={cn(stFieldFull, 'flex flex-wrap items-start gap-3 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50/50 p-4 text-sm text-amber-950 ring-1 ring-amber-100')}>
                Available at <strong>{fromBranchName || 'source branch'}</strong>:{' '}
                <strong>{availableQty}</strong> {selectedProduct?.unit ?? 'units'}
                {!sourceStock && form.fromBranchId && form.productId && (
                  <span className="font-semibold text-red-600">
                    {' '}
                    — no inventory at this branch yet. Add stock in Inventory Management
                    first.
                  </span>
                )}
                {sourceStock && sourceStock.reorder > 0 && (
                  <>
                    {' '}
                    —{' '}
                    {availableQty < sourceStock.reorder ? (
                      <span className="font-semibold text-red-600">below reorder level</span>
                    ) : (
                      <span className="font-semibold text-emerald-600">healthy stock</span>
                    )}
                  </>
                )}
              </div>
              <div className={cn(stFieldFull, 'flex flex-wrap gap-2.5 border-t border-black/5 pt-4')}>
                <button
                  type="submit"
                  className={stBtnPrimary}
                  disabled={submitting || !apiConnected || !perms.canCreateTransfer}
                >
                  <FiClipboard aria-hidden="true" />
                  {submitting ? 'Submitting…' : 'Submit Transfer Request'}
                </button>
                <button
                  type="button"
                  className={stBtnGhost}
                  onClick={() =>
                    setForm({
                      fromBranchId: branches[0]?.id ?? '',
                      toBranchId: branches[1]?.id ?? '',
                      productId: products[0]?.id ?? '',
                      quantity: '',
                      notes: '',
                    })
                  }
                >
                  Reset form
                </button>
              </div>
              {!perms.canCreateTransfer && (
                <p className={cn(stFieldFull, 'rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-100')}>
                  Your role can view transfers only. Managers create requests; admins
                  approve and dispatch.
                </p>
              )}
            </form>
          </section>
        )}

        {activeTab === 'tracking' && perms.tabs.tracking && (
          <section className={stPanel} aria-labelledby="transfer-tracking-title">
            <PanelHeader
              title="Transfer progress"
              subtitle={
                perms.canApproveTransfer
                  ? 'Track each request — approve or reject pending items. Managers dispatch after approval.'
                  : perms.canCreateTransfer
                    ? 'Edit or cancel while Pending; dispatch when Approved; confirm receipt when In Transit at your branch.'
                    : perms.isViewOnly
                      ? 'Read-only view of active transfers for your organization.'
                      : 'Track transfers involving your branch.'
              }
            />

            {perms.canCreateTransfer && progressPipeline.Approved > 0 ? (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-300/60 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4 text-sm text-blue-950 shadow-sm" role="status">
                <strong>{progressPipeline.Approved}</strong> approved — use{' '}
                <strong>Dispatch (In Transit)</strong> when ready to send stock from your branch.
              </div>
            ) : null}

            {perms.canApproveTransfer && pendingForApproval.length > 0 ? (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-4 text-sm text-amber-950 shadow-sm" role="status">
                <strong>{pendingForApproval.length}</strong> manager transfer request
                {pendingForApproval.length === 1 ? '' : 's'} waiting — use{' '}
                <strong>Approve</strong> or <strong>Reject</strong> below.
              </div>
            ) : null}

            {(perms.canTrackAllProgress || perms.canDispatchTransfer || perms.canTrackProgress) ? (
              <div className={stPipeline} aria-label="Transfer pipeline">
                <div className={stPipelinePending}>
                  <strong className={stPipelineCardInner.value}>{progressPipeline.Pending}</strong>
                  <span className={stPipelineCardInner.label}>Pending review</span>
                </div>
                <div className={stPipelineApproved}>
                  <strong className={stPipelineCardInner.value}>{progressPipeline.Approved}</strong>
                  <span className={stPipelineCardInner.label}>Approved</span>
                </div>
                <div className={stPipelineTransit}>
                  <strong className={stPipelineCardInner.value}>{progressPipeline['In Transit']}</strong>
                  <span className={stPipelineCardInner.label}>In transit</span>
                </div>
                <div className={stPipelineRejected}>
                  <strong className={stPipelineCardInner.value}>{progressPipeline.Rejected}</strong>
                  <span className={stPipelineCardInner.label}>Rejected</span>
                </div>
              </div>
            ) : null}

            <FilterBar>
              <SearchField
                id="progress-transfer-search"
                label="Search progress"
                value={progressSearch}
                onChange={setProgressSearch}
                placeholder="Transfer ID, product, branch, status, user…"
              />
              {hasProgressSearch ? (
                <p className="mb-0 flex min-w-40 flex-1 items-end pb-2 text-xs text-slate-500">
                  Showing {filteredActiveTransfers.length} of {activeTransfers.length}{' '}
                  active transfer(s)
                </p>
              ) : null}
            </FilterBar>

            {filteredActiveTransfers.length === 0 ? (
              <EmptyState
                icon="🚛"
                title={
                  hasProgressSearch
                    ? 'No transfers match your search'
                    : hiddenByBranchScope > 0
                      ? 'Transfers hidden by branch filter'
                      : progressPipeline.Pending > 0 && transfers.length === 0
                        ? 'Transfers exist but failed to load'
                        : 'No active transfers'
                }
                description={
                  hasProgressSearch
                    ? `No active transfers match "${progressSearch.trim()}". Clear search or try ID, product name, branch, or status.`
                    : hiddenByBranchScope > 0
                      ? `${hiddenByBranchScope} transfer(s) exist but none match your branch. Sync data or ask admin to assign your branch on your user profile.`
                      : progressPipeline.Pending > 0 && transfers.length === 0
                        ? `${progressPipeline.Pending} pending in the system — click Sync data. If it persists, restart the backend (role fix) and log in again as Admin.`
                        : apiConnected
                          ? perms.canCreateTransfer
                            ? 'Create a request under New Request — it will show here as Pending until an admin approves it. Completed transfers move to History.'
                            : perms.canApproveTransfer
                              ? 'Pending manager requests appear here for Approve, Reject, or Cancel. Click Sync data after a manager creates a request.'
                              : 'Transfers in Pending or In Transit status appear here.'
                          : 'Click Sync data to load branches and transfers from the server.'
                }
                secondaryLabel={hasProgressSearch ? 'Clear search' : 'Sync data'}
                onSecondary={
                  hasProgressSearch ? () => setProgressSearch('') : refreshAll
                }
                primaryLabel={perms.canCreateTransfer ? 'New request' : undefined}
                onPrimary={
                  perms.canCreateTransfer ? () => switchTab('request') : undefined
                }
                secondaryLabel="Sync data"
                onSecondary={refreshAll}
              />
            ) : (
              <div className={stTransferCards}>
                {filteredActiveTransfers.map((t) => {
                  const stepIdx = getWorkflowStepIndex(t.status);
                  const {
                    showApprove,
                    showReject,
                    showDispatch,
                    showConfirm,
                    showCancel,
                    showEdit,
                    isProgressViewOnly,
                  } = getTransferUiActions(t, perms, userBranchIds, branches);
                  const isEditing =
                    editingTransferId === String(t._id ?? t.id);
                  return (
                    <article
                      className={
                        t.status === 'Pending' && perms.canApproveTransfer
                          ? stTransferCardPending
                          : t.status === 'Approved' && perms.canCreateTransfer
                            ? stTransferCardApproved
                            : stTransferCard
                      }
                      key={t._id ?? t.id}
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className={stTransferId}>{t.id}</span>
                          <div className={stProductMeta}>
                            {toDisplayString(t.product)} · {t.qty} units
                          </div>
                          <div className={stRoutePill}>
                            {toDisplayString(t.from)}{' '}
                            <FiArrowRight aria-hidden="true" /> {toDisplayString(t.to)}
                          </div>
                          {t.status === 'Rejected' && t.rejectReason ? (
                            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-100">
                              Rejected: {t.rejectReason}
                            </p>
                          ) : null}
                        </div>
                        <StatusBadge status={t.status} />
                      </div>

                      {perms.canTrackAllProgress ? (
                        <TransferActivityTrail transfer={t} />
                      ) : null}

                      {!isEditing ? (
                      <div className={stStepper} role="list" aria-label={`Progress for ${t.id}`}>
                        {WORKFLOW_STEPS.map((step, i) => (
                          <div key={step} role="listitem" className={stStep}>
                            <div
                              className={
                                i < stepIdx
                                  ? stStepDotDone
                                  : i === stepIdx
                                    ? stStepDotCurrent
                                    : stStepDot
                              }
                            >
                              {i < stepIdx ? <FiCheck size={14} /> : i + 1}
                            </div>
                            <span className={stStepLabel}>{step}</span>
                          </div>
                        ))}
                      </div>
                      ) : (
                        <TransferEditPanel
                          transfer={t}
                          branches={branches}
                          products={products}
                          stockRows={stockRows}
                          saving={submitting}
                          isResubmit={t.status === 'Rejected'}
                          onSave={(editForm) => handleSaveEdit(t, editForm)}
                          onCancel={() => setEditingTransferId(null)}
                        />
                      )}

                      {!isEditing ? (
                      <div className={stCardActions}>
                        <span className={cn(stMetaText, 'mr-auto')}>
                          {formatLogDate(t.date)} · {formatUserLabel(t.requestedBy)}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {showEdit && (
                            <button
                              type="button"
                              className={stBtnGhost}
                              disabled={submitting}
                              onClick={() =>
                                setEditingTransferId(String(t._id ?? t.id))
                              }
                            >
                              <FiEdit2 aria-hidden="true" />
                              Edit
                            </button>
                          )}
                          {showApprove && (
                            <button
                              type="button"
                              className={stBtnPrimary}
                              disabled={submitting}
                              onClick={() => handleApprove(t)}
                            >
                              <FiCheck aria-hidden="true" />
                              Approve
                            </button>
                          )}
                          {showReject && (
                            <button
                              type="button"
                              className={cn(stBtnGhost, stBtnDanger)}
                              disabled={submitting}
                              onClick={() => handleReject(t)}
                            >
                              <FiXCircle aria-hidden="true" />
                              Reject
                            </button>
                          )}
                          {showDispatch && (
                            <button
                              type="button"
                              className={stBtnPrimary}
                              disabled={submitting}
                              onClick={() => handleDispatch(t)}
                            >
                              <FiTruck aria-hidden="true" />
                              Dispatch (In Transit)
                            </button>
                          )}
                          {showConfirm && (
                            <button
                              type="button"
                              className={stBtnPrimary}
                              disabled={submitting}
                              onClick={() => handleConfirmReceipt(t)}
                            >
                              <FiPackage aria-hidden="true" />
                              Confirm Receipt
                            </button>
                          )}
                          {showCancel && (
                            <button
                              type="button"
                              className={cn(stBtnGhost, stBtnDanger)}
                              disabled={submitting}
                              onClick={() => handleCancel(t)}
                            >
                              Cancel
                            </button>
                          )}
                          {isProgressViewOnly &&
                          !showApprove &&
                          !showReject &&
                          !showDispatch &&
                          !showConfirm &&
                          !showCancel &&
                          !showEdit ? (
                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                              {perms.isViewOnly
                                ? 'View only'
                                : t.status === 'Approved'
                                  ? 'Waiting for manager dispatch'
                                  : 'View only — no actions for your role'}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'availability' && perms.tabs.availability && (
          <section className={stPanel} aria-labelledby="branch-stock-title">
            <PanelHeader
              title="Branch stock levels"
              subtitle="See how much stock each branch has before planning a transfer."
            />
            <FilterBar>
              <SearchField
                id="branch-stock-search"
                label="Search stock"
                value={stockSearch}
                onChange={setStockSearch}
                placeholder="Product name, SKU, or branch…"
              />
              {hasStockSearch ? (
                <p className="mb-0 flex min-w-40 flex-1 items-end pb-2 text-xs text-slate-500">
                  {filteredStockRows.length} match(es) in view
                </p>
              ) : null}
              <label className={stFieldLabel}>
                <span className={stFieldLabelText}>Branch</span>
                <select
                  className={stFieldInput}
                  value={stockBranch}
                  onChange={(e) => setStockBranch(e.target.value)}
                >
                  {perms.canViewAllBranches && <option value="All">All branches</option>}
                  {stockBranchOptions.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            </FilterBar>
            {stockLoading ? (
              <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">Loading inventory…</p>
            ) : filteredStockRows.length === 0 ? (
              <EmptyState
                icon="📦"
                title={
                  hasStockSearch || stockBranch !== 'All'
                    ? 'No stock matches filters'
                    : 'No stock data'
                }
                description={
                  hasStockSearch || stockBranch !== 'All'
                    ? hasStockSearch
                      ? `No rows match "${stockSearch.trim()}". Try product name, SKU, or branch — or clear search.`
                      : `No inventory for branch "${stockBranch}". Pick another branch or sync data.`
                    : 'Inventory per branch will show here after you sync and assign products to branches in the database.'
                }
                primaryLabel={
                  hasStockSearch || stockBranch !== 'All' ? undefined : 'Sync data'
                }
                onPrimary={
                  hasStockSearch || stockBranch !== 'All' ? undefined : refreshAll
                }
                secondaryLabel={
                  hasStockSearch || stockBranch !== 'All'
                    ? 'Clear filters'
                    : perms.canCreateTransfer
                      ? 'Create transfer'
                      : undefined
                }
                onSecondary={
                  hasStockSearch || stockBranch !== 'All'
                    ? () => {
                        setStockSearch('');
                        if (stockBranch !== 'All') setStockBranch('All');
                      }
                    : perms.canCreateTransfer
                      ? () => switchTab('request')
                      : undefined
                }
              />
            ) : (
              <TransferTable
                caption="Branch stock levels"
                columns={[
                  'SKU',
                  'Product',
                  'Branch',
                  'On hand',
                  'Reorder at',
                  'Status',
                  'Transfer hint',
                ]}
              >
                {filteredStockRows.map((row) => {
                  const low = row.reorder > 0 && row.qty < row.reorder;
                  const surplus = row.reorder > 0 && row.qty > row.reorder * 2;
                  return (
                    <tr key={`${row.productId}-${row.branch}`} className={transferTableRowClass}>
                      <td className={transferTableCellClass}>{row.sku}</td>
                      <td className={transferTableCellClass}>{row.productName}</td>
                      <td className={transferTableCellClass}>{row.branch}</td>
                      <td
                        className={cn(
                          transferTableCellClass,
                          'font-bold',
                          low ? 'text-red-600' : 'text-emerald-600',
                        )}
                      >
                        {row.qty} {row.unit}
                      </td>
                      <td className={transferTableCellClass}>{row.reorder || '—'}</td>
                      <td className={transferTableCellClass}>
                        <span className={statusBadgeClass(low ? 'Pending' : 'Completed')}>
                          {low ? 'Low stock' : 'Healthy'}
                        </span>
                      </td>
                      <td className={cn(transferTableCellClass, 'text-xs text-slate-500')}>
                        {low
                          ? 'Request inbound transfer'
                          : surplus
                            ? 'Can supply other branches'
                            : '—'}
                      </td>
                    </tr>
                  );
                })}
              </TransferTable>
            )}
          </section>
        )}

        {activeTab === 'history' && perms.tabs.history && (
          <section className={stPanel} aria-labelledby="transfer-history-title">
            <PanelHeader
              title="Transfer history"
              subtitle={
                perms.isViewOnly
                  ? 'View all past transfers for your scope. Filter by status or search — read only.'
                  : 'Browse completed and past transfers. Filter by status or search by ID, product, or branch.'
              }
            />
            <FilterBar>
              <SearchField
                id="transfer-history-search"
                label="Search history"
                value={historySearch}
                onChange={setHistorySearch}
                placeholder="Transfer ID, product, branch, status, user…"
              />
              {hasHistorySearch ? (
                <p className="mb-0 flex min-w-40 flex-1 items-end pb-2 text-xs text-slate-500">
                  Showing {historyTransfers.length} match(es)
                </p>
              ) : null}
              <label className={stFieldLabel}>
                <span className={stFieldLabelText}>Status</span>
                <select
                  className={stFieldInput}
                  value={historyStatus}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setHistoryStatus(val);
                    if (apiConnected) {
                      try {
                        await loadTransfers(val, branches);
                      } catch (err) {
                        setMessage(getApiErrorMessage(err));
                      }
                    }
                  }}
                >
                  <option value="All">All statuses</option>
                  {['Pending', 'Approved', 'In Transit', 'Completed', 'Rejected', 'Cancelled'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </FilterBar>
            {historyTransfers.length === 0 ? (
              <EmptyState
                icon="📋"
                title={
                  hasHistorySearch || historyStatus !== 'All'
                    ? 'No transfers match filters'
                    : 'No transfers found'
                }
                description={
                  hasHistorySearch
                    ? `No transfers match "${historySearch.trim()}". Try ID, product, branch, status, or requested-by — or clear search.`
                    : historyStatus !== 'All'
                      ? `No transfers with status "${historyStatus}". Change status filter or sync data.`
                      : 'Transfers will appear here once requests are created and synced from the server.'
                }
                secondaryLabel={
                  hasHistorySearch || historyStatus !== 'All'
                    ? 'Clear filters'
                    : 'Sync data'
                }
                onSecondary={
                  hasHistorySearch || historyStatus !== 'All'
                    ? () => {
                        setHistorySearch('');
                        setHistoryStatus('All');
                      }
                    : refreshAll
                }
                primaryLabel={perms.canCreateTransfer ? 'Create request' : undefined}
                onPrimary={
                  perms.canCreateTransfer ? () => switchTab('request') : undefined
                }
              />
            ) : (
              <TransferTable
                caption="Transfer history"
                columns={[
                  'Transfer',
                  'Date',
                  'Product',
                  'Route',
                  'Qty',
                  'Requested by',
                  'Status',
                ]}
              >
                {historyTransfers.map((t) => (
                  <tr key={t._id ?? t.id} className={transferTableRowClass}>
                    <td className={transferTableCellClass}>
                      <span className={stTransferId}>{t.id}</span>
                    </td>
                    <td className={transferTableCellClass}>{formatLogDate(t.date)}</td>
                    <td className={transferTableCellClass}>{toDisplayString(t.product)}</td>
                    <td className={transferTableCellClass}>
                      <span className={stRoutePill}>
                        {toDisplayString(t.from)} → {toDisplayString(t.to)}
                      </span>
                    </td>
                    <td className={transferTableCellClass}>{t.qty}</td>
                    <td className={transferTableCellClass}>{formatUserLabel(t.requestedBy)}</td>
                    <td className={transferTableCellClass}>
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </TransferTable>
            )}
          </section>
        )}

        {activeTab === 'reports' && perms.tabs.reports && (
          <section aria-labelledby="transfer-reports-title">
            <div className={cn(stChartPanel, 'mb-4')}>
              <PanelHeader
                title="Transfer reports"
                subtitle={
                  perms.canExportReports
                    ? `${perms.label}: export your visible transfers as PDF (print) or Excel (CSV).`
                    : 'Summary of transfer volume and status across branches.'
                }
              >
                {perms.canExportReports ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={stBtnGhost}
                      title="Open printable report — save as PDF from print dialog"
                      onClick={handleExportPdf}
                    >
                      <FiDownload aria-hidden="true" />
                      Export PDF
                    </button>
                    <button
                      type="button"
                      className={stBtnGhost}
                      title="Download Excel-compatible CSV"
                      onClick={handleExportExcel}
                    >
                      <FiDownload aria-hidden="true" />
                      Export Excel
                    </button>
                  </div>
                ) : null}
              </PanelHeader>
              <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <KpiCard
                  variant="primary"
                  icon={FiBarChart2}
                  value={
                    analytics?.volumeSummary?.totalTransfers ??
                    analytics?.totalTransfers ??
                    transfers.length
                  }
                  label="Total transfers"
                />
                <KpiCard
                  variant="success"
                  icon={FiPackage}
                  value={
                    analytics?.volumeSummary?.totalUnits ??
                    analytics?.totalUnits ??
                    transfers.reduce((s, t) => s + t.qty, 0)
                  }
                  label="Units moved"
                />
                <KpiCard
                  variant="warning"
                  icon={FiTruck}
                  value={analytics?.cancelledCount ?? 0}
                  label="Cancelled"
                />
                <KpiCard
                  variant="info"
                  icon={FiCheck}
                  value={
                    (analytics?.topProducts ?? []).length ||
                    reportByStatus.find((r) => r.name === 'Completed')?.value ||
                    0
                  }
                  label="Top products"
                />
              </div>
            </div>
            <div className={stReportsGrid}>
              <div className={stChartPanel}>
                <h3 className={stChartTitle}>Transfers by branch</h3>
                <div className={stChartArea}>
                  {reportByBranch.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={reportByBranch}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="transfers"
                          name="Transfers"
                          fill="#3b82f6"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="units"
                          name="Units"
                          fill="#8b5cf6"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState
                      icon="📊"
                      title="No branch data yet"
                      description="Complete a few transfers to see volume by branch."
                      secondaryLabel="Sync data"
                      onSecondary={refreshAll}
                    />
                  )}
                </div>
              </div>
              <div className={stChartPanel}>
                <h3 className={stChartTitle}>Status distribution</h3>
                <div className={stChartArea}>
                  {reportByStatus.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportByStatus}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {reportByStatus.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState
                      icon="📈"
                      title="No status breakdown yet"
                      description="Status chart fills in when transfers exist in the system."
                      secondaryLabel="View history"
                      onSecondary={() => switchTab('history')}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
        </div>
    </div>
  );
}

export default StockTransferPage;
