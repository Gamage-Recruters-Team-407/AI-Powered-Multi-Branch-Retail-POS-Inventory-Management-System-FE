import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import StockAlertPanel from '../../components/inventory/StockAlertPanel';
import {
  getAllSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  updateContract,
  addTransaction,
  getProcurementHistory,
  getDetailedPerformance,
  updateTransactionStatus
} from '../../services/supplierApi';

const CATEGORIES = [
  'Grains & Rice',
  'Beverages',
  'Dairy Products',
  'Spices & Condiments',
  'Packaging Materials',
  'Fresh Produce',
  'Meat & Seafood',
  'Other'
];

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toISOString().slice(0, 10);
  } catch (e) {
    return dateString;
  }
};

const normalizeRole = (role) =>
  String(role || '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/^super_admin$|^superadmin$|^administrator$/, 'admin');

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalDateStringOffset = (offsetMs) => {
  const d = new Date(Date.now() + offsetMs);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const sanitizePhoneNumber = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 9) {
    return '0' + digits;
  }
  if (digits.length === 11 && digits.startsWith('94')) {
    return '0' + digits.substring(2);
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
};

const SuppliersPage = () => {
  const { user } = useAuth();
  const userRole = useMemo(() => normalizeRole(user?.role), [user]);
  const isAdminOrManager = useMemo(() => userRole === 'admin' || userRole === 'manager', [userRole]);

  const { alerts = [], refreshAll } = useInventory();

  const mapProductToCategory = (productName) => {
    const name = String(productName || '').toLowerCase();
    if (name.includes('rice') || name.includes('coconut oil') || name.includes('grains')) return 'Grains & Rice';
    if (name.includes('tea') || name.includes('beverage') || name.includes('coffee')) return 'Beverages';
    if (name.includes('milk') || name.includes('dairy') || name.includes('cheese') || name.includes('butter')) return 'Dairy Products';
    if (name.includes('spice') || name.includes('condiment') || name.includes('curry') || name.includes('cardamom') || name.includes('cinnamon')) return 'Spices & Condiments';
    if (name.includes('pack') || name.includes('carton') || name.includes('bag')) return 'Packaging Materials';
    if (name.includes('vegetable') || name.includes('fruit') || name.includes('fresh')) return 'Fresh Produce';
    if (name.includes('meat') || name.includes('fish') || name.includes('seafood') || name.includes('chicken')) return 'Meat & Seafood';
    return 'Other';
  };

  useEffect(() => {
    if (refreshAll) {
      refreshAll("", false);
    }
  }, [refreshAll]);

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name'); // name, spend, rating, delivery

  // Details panel state
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('performance'); // performance, contract, history
  
  const [selectedSupplierDetails, setSelectedSupplierDetails] = useState(null);
  const [procurementHistory, setProcurementHistory] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Global Alert Restock Modal states
  const [clickedAlert, setClickedAlert] = useState(null);
  const [selectedRestockSupplierId, setSelectedRestockSupplierId] = useState('');
  const [restockFormData, setRestockFormData] = useState({
    id: '',
    itemsCount: 50,
    amount: 5000,
    status: 'Pending'
  });

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // create, edit
  const [editingSupplierId, setEditingSupplierId] = useState(null);

  // Form inputs state
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: 'Grains & Rice',
    status: 'Active',
    rating: 5.0,
    performance: {
      onTimeDelivery: 95,
      qualityScore: 95,
      leadTimeDays: 3,
      returnRate: 0.0
    },
    contract: {
      startDate: getLocalDateString(),
      endDate: getLocalDateStringOffset(365 * 24 * 60 * 60 * 1000),
      status: 'Under Negotiation',
      terms: '',
      paymentTerms: 'Net 30',
      sla: ''
    }
  });

  const [formErrors, setFormErrors] = useState({});

  // Contract Edit Modal State
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractFormData, setContractFormData] = useState({
    startDate: '',
    endDate: '',
    status: 'Under Negotiation',
    terms: '',
    paymentTerms: 'Net 30',
    sla: ''
  });

  // Transaction Modal State
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionFormData, setTransactionFormData] = useState({
    id: '',
    date: new Date().toISOString().substring(0, 10),
    itemsCount: 50,
    amount: 0,
    status: 'Delivered'
  });

  // Fetch Suppliers List
  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const categoryFilter = selectedCategory === 'All' ? '' : selectedCategory;
      const statusFilter = selectedStatus === 'All' ? '' : selectedStatus;
      const res = await getAllSuppliers(searchQuery, categoryFilter, statusFilter);
      if (res.success) {
        setSuppliers(res.data || []);
        setError(null);
      } else {
        setError(res.message || "Failed to load suppliers.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch suppliers from backend API.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Detailed supplier stats on select
  const loadSupplierDetails = async (id) => {
    setLoadingDetails(true);
    try {
      const perfRes = await getDetailedPerformance(id);
      const procRes = await getProcurementHistory(id);
      
      if (perfRes.success) {
        setSelectedSupplierDetails(perfRes.data);
      }
      if (procRes.success) {
        setProcurementHistory(procRes.data);
      }
    } catch (err) {
      console.error("Error loading supplier details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    if (viewingSupplier) {
      loadSupplierDetails(viewingSupplier.id || viewingSupplier._id);
    } else {
      setSelectedSupplierDetails(null);
      setProcurementHistory(null);
    }
  }, [viewingSupplier]);

  // Summary Metrics computed from all registered suppliers
  const metrics = useMemo(() => {
    const active = suppliers.filter(s => s.status === 'Active');
    const totalSpend = suppliers.reduce((acc, curr) => acc + (curr.totalSpend || 0), 0);
    const avgDelivery = suppliers.length > 0 
      ? Math.round(suppliers.reduce((acc, curr) => acc + (curr.performance?.onTimeDelivery || 95), 0) / suppliers.length)
      : 95;
    
    // Sum of pending manual transactions or POs across suppliers
    const pendingOrdersCount = suppliers.reduce((acc, curr) => {
      const pendingCount = curr.transactions 
        ? curr.transactions.filter(t => t.status === 'Pending').length 
        : 0;
      return acc + pendingCount;
    }, 0);

    return {
      totalCount: suppliers.length,
      activeCount: active.length,
      totalSpend,
      avgDelivery,
      pendingOrdersCount
    };
  }, [suppliers]);

  // Filtering & Sorting (Client-side Sorting)
  const sortedSuppliers = useMemo(() => {
    let result = [...suppliers];

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.companyName.localeCompare(b.companyName);
      } else if (sortBy === 'spend') {
        return (b.totalSpend || 0) - (a.totalSpend || 0);
      } else if (sortBy === 'rating') {
        return (b.rating || 5.0) - (a.rating || 5.0);
      } else if (sortBy === 'delivery') {
        return (b.performance?.onTimeDelivery || 0) - (a.performance?.onTimeDelivery || 0);
      }
      return 0;
    });

    return result;
  }, [suppliers, sortBy]);

  // Form input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // allow only digits and limit to max 10
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        phone: digitsOnly
      }));
      return;
    }
    if (name === 'companyName' || name === 'contactPerson') {
      // allow only letters and spaces
      const lettersOnly = value.replace(/[^A-Za-z\s]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: lettersOnly
      }));
      return;
    }
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: child === 'onTimeDelivery' || child === 'qualityScore' || child === 'leadTimeDays' || child === 'returnRate'
            ? parseFloat(value) || 0
            : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    const companyName = String(formData.companyName || '').trim();
    const contactPerson = String(formData.contactPerson || '').trim();
    const email = String(formData.email || '').trim();
    const phone = String(formData.phone || '').trim();
    const address = String(formData.address || '').trim();
    
    // Company Name: letters and spaces only
    if (!companyName) {
      errors.companyName = 'Company name is required';
    } else if (!/^[A-Za-z\s]+$/.test(companyName)) {
      errors.companyName = 'Company name must contain letters only';
    }
    
    // Contact Person Name: letters and spaces only
    if (!contactPerson) {
      errors.contactPerson = 'Contact person is required';
    } else if (!/^[A-Za-z\s]+$/.test(contactPerson)) {
      errors.contactPerson = 'Contact person name must contain letters only';
    }
    
    // Email: @ character is mandatory & matches general format
    if (!email) {
      errors.email = 'Email is required';
    } else if (!email.includes('@')) {
      errors.email = 'Email address must contain @ character';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }
    
    // Phone: exactly 10 digits
    if (!phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d+$/.test(phone)) {
      errors.phone = 'Phone number must contain numbers only';
    } else if (phone.length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    
    // Address: required
    if (!address) {
      errors.address = 'Address is required';
    }
    
    // Contract Start Date: prevent past dates (for creation)
    if (formMode === 'create' && formData.contract && formData.contract.startDate) {
      const todayStr = getLocalDateString();
      if (formData.contract.startDate < todayStr) {
        errors.startDate = 'Contract start date cannot be in the past';
      }
    }
    
    console.log('Supplier validation result:', { data: formData, errors });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateForm = () => {
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      category: 'Grains & Rice',
      status: 'Active',
      rating: 5.0,
      performance: {
        onTimeDelivery: 95,
        qualityScore: 95,
        leadTimeDays: 3,
        returnRate: 0.0
      },
      contract: {
        startDate: getLocalDateString(),
        endDate: getLocalDateStringOffset(365 * 24 * 60 * 60 * 1000),
        status: 'Under Negotiation',
        terms: '',
        paymentTerms: 'Net 30',
        sla: ''
      }
    });
    setFormErrors({});
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (supplier, e) => {
    e.stopPropagation();
    setFormData({
      companyName: supplier.companyName,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: sanitizePhoneNumber(supplier.phone),
      address: supplier.address,
      category: supplier.category,
      status: supplier.status,
      rating: supplier.rating,
      performance: { ...(supplier.performance || { onTimeDelivery: 95, qualityScore: 95, leadTimeDays: 3, returnRate: 0.0 }) },
      contract: { ...(supplier.contract || { startDate: '', endDate: '', status: 'Under Negotiation', terms: '', paymentTerms: 'Net 30', sla: '' }) }
    });
    setFormErrors({});
    setEditingSupplierId(supplier.id || supplier._id);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (formMode === 'create') {
        const res = await addSupplier(formData);
        if (res.success) {
          setIsFormOpen(false);
          loadSuppliers();
        } else {
          alert("Error: " + res.message);
        }
      } else {
        const res = await updateSupplier(editingSupplierId, formData);
        if (res.success) {
          setIsFormOpen(false);
          loadSuppliers();
          if (viewingSupplier && (viewingSupplier.id === editingSupplierId || viewingSupplier._id === editingSupplierId)) {
            setViewingSupplier(res.data);
          }
        } else {
          alert("Error: " + res.message);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save supplier details.");
    }
  };

  const handleToggleStatus = async (id, currentStatus, e) => {
    e.stopPropagation();
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await updateSupplier(id, { status: nextStatus });
      if (res.success) {
        loadSuppliers();
        if (viewingSupplier && (viewingSupplier.id === id || viewingSupplier._id === id)) {
          setViewingSupplier(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSupplier = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      const res = await deleteSupplier(id);
      if (res.success) {
        setViewingSupplier(null);
        loadSuppliers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Contract Modal
  const handleOpenContractModal = () => {
    const contract = selectedSupplierDetails?.contract || viewingSupplier?.contract || {};
    setContractFormData({
      startDate: contract.startDate ? formatDate(contract.startDate) : '',
      endDate: contract.endDate ? formatDate(contract.endDate) : '',
      status: contract.status || 'Under Negotiation',
      terms: contract.terms || '',
      paymentTerms: contract.paymentTerms || 'Net 30',
      sla: contract.sla || ''
    });
    setIsContractModalOpen(true);
  };

  // Submit Contract Update
  const handleContractSubmit = async (e) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().substring(0, 10);
    if (contractFormData.startDate && contractFormData.startDate < todayStr) {
      alert("Error: Contract start date cannot be in the past.");
      return;
    }
    const id = viewingSupplier.id || viewingSupplier._id;
    try {
      const res = await updateContract(id, contractFormData);
      if (res.success) {
        setIsContractModalOpen(false);
        loadSupplierDetails(id);
        loadSuppliers();
      } else {
        alert("Error: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update supplier contract.");
    }
  };

  // Open Transaction Modal
  const handleOpenTransactionModal = () => {
    setTransactionFormData({
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().substring(0, 10),
      itemsCount: 50,
      amount: 5000,
      status: 'Delivered'
    });
    setIsTransactionModalOpen(true);
  };

  // Quick Restock helper to prepopulate transaction modal
  const handleQuickRestock = (alert, supplier) => {
    const reorderLevel = alert.product?.reorderLevel || 50;
    const currentQty = alert.quantity || 0;
    const suggestedUnits = Math.max(reorderLevel * 2 - currentQty, 50);
    const costPrice = alert.product?.costPrice || 100;
    const computedCost = suggestedUnits * costPrice;

    setTransactionFormData({
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().substring(0, 10),
      itemsCount: suggestedUnits,
      amount: computedCost,
      status: 'Pending'
    });
    setIsTransactionModalOpen(true);
  };

  // Handle click on global low stock alert item
  const handleAlertClick = (alert) => {
    const category = mapProductToCategory(alert.product?.name);
    // Find active suppliers in this category
    const matchingSuppliers = suppliers.filter(s => s.category === category && s.status === 'Active');
    
    // Auto-select first matching supplier if available
    if (matchingSuppliers.length > 0) {
      setSelectedRestockSupplierId(matchingSuppliers[0].id || matchingSuppliers[0]._id);
    } else {
      setSelectedRestockSupplierId('');
    }

    const reorderLevel = alert.product?.reorderLevel || 50;
    const currentQty = alert.quantity || 0;
    const suggestedUnits = Math.max(reorderLevel * 2 - currentQty, 50);
    const costPrice = alert.product?.costPrice || 100;
    const computedCost = suggestedUnits * costPrice;

    setRestockFormData({
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      itemsCount: suggestedUnits,
      amount: computedCost,
      status: 'Pending'
    });
    setClickedAlert(alert);
  };

  // Submit global alert restock order
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRestockSupplierId) {
      alert("Please select a supplier.");
      return;
    }
    try {
      const res = await addTransaction(selectedRestockSupplierId, {
        id: restockFormData.id,
        date: new Date().toISOString().substring(0, 10),
        itemsCount: restockFormData.itemsCount,
        amount: restockFormData.amount,
        status: restockFormData.status
      });

      if (res.success) {
        setClickedAlert(null);
        if (viewingSupplier && (viewingSupplier.id === selectedRestockSupplierId || viewingSupplier._id === selectedRestockSupplierId)) {
          loadSupplierDetails(selectedRestockSupplierId);
        }
        loadSuppliers();
        if (refreshAll) {
          refreshAll("", false);
        }
      } else {
        alert("Error: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to place restock order.");
    }
  };

  // Submit Transaction Log
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    const id = viewingSupplier.id || viewingSupplier._id;
    try {
      const res = await addTransaction(id, transactionFormData);
      if (res.success) {
        setIsTransactionModalOpen(false);
        loadSupplierDetails(id);
        loadSuppliers();
      } else {
        alert("Error: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to record manual transaction.");
    }
  };

  // Change transaction status from Timeline
  const handleStatusChange = async (transactionId, newStatus) => {
    const supplierId = viewingSupplier.id || viewingSupplier._id;
    try {
      const res = await updateTransactionStatus(supplierId, transactionId, newStatus);
      if (res.success) {
        loadSupplierDetails(supplierId);
        loadSuppliers();
      } else {
        alert("Error: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update transaction status.");
    }
  };

  // AI Insights Style Helper
  const getAIRecommendationStyle = (rec) => {
    if (!rec) return 'normal';
    if (rec.includes('Excellent')) return 'excellent';
    if (rec.includes('Caution')) return 'caution';
    if (rec.includes('Warning')) return 'warning';
    return 'normal';
  };

  return (
    <div className="suppliers-container">
      {/* Overview Cards */}
      <div className="metrics-grid">
        <div className="metric-card bg-glass">
          <div className="metric-icon-wrapper blue">🚚</div>
          <div className="metric-details">
            <span className="metric-label">Total Suppliers</span>
            <div className="metric-value">
              {metrics.totalCount} <span className="value-sub">({metrics.activeCount} Active)</span>
            </div>
          </div>
        </div>

        <div className="metric-card bg-glass">
          <div className="metric-icon-wrapper green">🌟</div>
          <div className="metric-details">
            <span className="metric-label">Avg. On-Time Delivery</span>
            <div className="metric-value">{metrics.avgDelivery}%</div>
          </div>
        </div>

        <div className="metric-card bg-glass">
          <div className="metric-icon-wrapper orange">⏳</div>
          <div className="metric-details">
            <span className="metric-label">Pending Shipments</span>
            <div className="metric-value">{metrics.pendingOrdersCount}</div>
          </div>
        </div>

        <div className="metric-card bg-glass">
          <div className="metric-icon-wrapper gold">💰</div>
          <div className="metric-details">
            <span className="metric-label">Total Spend</span>
            <div className="metric-value">Rs. {metrics.totalSpend.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Stock Alerts Panel */}
      <StockAlertPanel alerts={alerts} onAlertClick={handleAlertClick} />

      {/* Control Panel: Filters, Search, Registration */}
      <div className="controls-panel bg-glass">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search suppliers by name, contact or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <div className="filter-item">
            <label>Category</label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-item">
            <label>Status</label>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="name">Company Name</option>
              <option value="spend">Total Spend</option>
              <option value="rating">Rating</option>
              <option value="delivery">Delivery Performance</option>
            </select>
          </div>

          {isAdminOrManager && (
            <button className="register-btn" onClick={handleOpenCreateForm}>
              <span className="plus-icon">+</span> Register Supplier
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="suppliers-content-layout">
        {/* Suppliers List */}
        <div className="suppliers-list-panel">
          <div className="list-header">
            <h3>Registered Suppliers ({sortedSuppliers.length})</h3>
          </div>

          {loading ? (
            <div className="loading-spinner bg-glass">
              <div className="spinner"></div>
              <p>Fetching suppliers from database...</p>
            </div>
          ) : error ? (
            <div className="empty-state bg-glass error-state">
              <span className="empty-icon">⚠️</span>
              <p className="empty-title">Error Loading Suppliers</p>
              <p className="empty-subtitle">{error}</p>
              <button className="edit-icon-btn" onClick={loadSuppliers}>Retry Connection</button>
            </div>
          ) : sortedSuppliers.length === 0 ? (
            <div className="empty-state bg-glass">
              <span className="empty-icon">🚚</span>
              <p className="empty-title">No Suppliers Found</p>
              <p className="empty-subtitle">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="suppliers-grid">
              {sortedSuppliers.map(supplier => {
                const supplierAlerts = alerts.filter(
                  alert => mapProductToCategory(alert.product?.name) === supplier.category
                );
                const hasAlerts = supplierAlerts.length > 0;
                return (
                  <div
                    key={supplier.id || supplier._id}
                    className={`supplier-item-card bg-glass hover-scale ${hasAlerts ? 'card-has-alerts' : ''} ${viewingSupplier?.id === (supplier.id || supplier._id) || viewingSupplier?._id === (supplier.id || supplier._id) ? 'selected' : ''}`}
                    onClick={() => {
                      setViewingSupplier(supplier);
                      setActiveDetailTab(hasAlerts ? 'alerts' : 'performance');
                    }}
                  >
                    <div className="card-top">
                      <div className="supplier-icon-placeholder">🏢</div>
                      <div className="title-area">
                        <span className="supplier-id">{supplier.id || supplier._id}</span>
                        <h4 className="supplier-name">{supplier.companyName}</h4>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className="category-badge">{supplier.category}</span>
                          {hasAlerts && (
                            <span className="alert-badge pulsing-alert">
                              ⚠️ {supplierAlerts.length} Shortage{supplierAlerts.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`status-pill ${supplier.status.toLowerCase().replace(' ', '-')}`}>
                        {supplier.status}
                      </span>
                    </div>

                    <div className="card-info">
                      <div className="info-row">
                        <span>👤 Contact:</span>
                        <strong>{supplier.contactPerson}</strong>
                      </div>
                      <div className="info-row">
                        <span>📞 Phone:</span>
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="info-row">
                        <span>⭐ Rating:</span>
                        <div className="star-rating">
                          <span className="stars">★</span> {(supplier.rating || 5.0).toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="card-mini-metrics">
                      <div className="mini-stat">
                        <span className="label">Delivery</span>
                        <span className={`value ${supplier.performance?.onTimeDelivery >= 90 ? 'good' : supplier.performance?.onTimeDelivery >= 80 ? 'warn' : 'bad'}`}>
                          {supplier.performance?.onTimeDelivery || 95}%
                        </span>
                      </div>
                      <div className="mini-stat">
                        <span className="label">Spend</span>
                        <span className="value">Rs. {(supplier.totalSpend || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {isAdminOrManager && (
                      <div className="card-actions">
                        <button className="edit-icon-btn" onClick={(e) => handleOpenEditForm(supplier, e)} title="Edit Supplier Info">
                          ✏️ Edit
                        </button>
                        <button
                          className="edit-icon-btn delete-btn"
                          onClick={(e) => handleDeleteSupplier(supplier.id || supplier._id, e)}
                          title="Delete Supplier"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          className={`status-toggle-btn ${supplier.status === 'Active' ? 'deactivate' : 'activate'}`}
                          onClick={(e) => handleToggleStatus(supplier.id || supplier._id, supplier.status, e)}
                        >
                          {supplier.status === 'Active' ? '⏸️ Suspend' : '▶️ Activate'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed Panel (Dynamic display beside the list if selected) */}
        <div className={`supplier-detail-panel bg-glass ${viewingSupplier ? 'open' : ''}`}>
          {viewingSupplier ? (
            <div className="detail-panel-content">
              {/* Close Button for smaller viewports */}
              <button className="detail-close-btn" onClick={() => setViewingSupplier(null)}>✕</button>

              <div className="detail-header">
                <span className="detail-id">{viewingSupplier.id || viewingSupplier._id}</span>
                <h2>{viewingSupplier.companyName}</h2>
                <div className="header-meta">
                  <span className="category-badge large">{viewingSupplier.category}</span>
                  <span className={`status-pill ${viewingSupplier.status.toLowerCase().replace(' ', '-')}`}>
                    {viewingSupplier.status}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="detail-tabs">
                <button
                  className={`tab-btn ${activeDetailTab === 'performance' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('performance')}
                >
                  📈 Performance
                </button>
                <button
                  className={`tab-btn ${activeDetailTab === 'contract' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('contract')}
                >
                  📜 Contract
                </button>
                <button
                  className={`tab-btn ${activeDetailTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('history')}
                >
                  ⏳ Timeline ({procurementHistory?.history?.length || 0})
                </button>
                <button
                  className={`tab-btn ${activeDetailTab === 'alerts' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('alerts')}
                  style={{ position: 'relative' }}
                >
                  ⚠️ Restock Alerts
                  {(() => {
                    const count = alerts.filter(
                      a => mapProductToCategory(a.product?.name) === viewingSupplier.category
                    ).length;
                    return count > 0 ? (
                      <span className="tab-badge-count">{count}</span>
                    ) : null;
                  })()}
                </button>
              </div>

              {/* Tab Content */}
              {loadingDetails ? (
                <div className="detail-loading">
                  <div className="spinner"></div>
                  <p>Analyzing metrics and procurement logs...</p>
                </div>
              ) : (
                <div className="tab-pane-content">
                  {activeDetailTab === 'performance' && (
                    <div className="performance-tab-content">
                      {/* Main Performance Grid */}
                      <div className="perf-grid">
                        <div className="perf-meter-card">
                          <div className="progress-circle" style={{ '--progress-pct': `${selectedSupplierDetails?.performance?.onTimeDelivery || 95}` }}>
                            <span className="value">{selectedSupplierDetails?.performance?.onTimeDelivery || 95}%</span>
                          </div>
                          <span className="label">On-Time Delivery</span>
                        </div>

                        <div className="perf-meter-card">
                          <div className="progress-circle" style={{ '--progress-pct': `${selectedSupplierDetails?.performance?.qualityScore || 95}` }}>
                            <span className="value">{selectedSupplierDetails?.performance?.qualityScore || 95}%</span>
                          </div>
                          <span className="label">Quality Index</span>
                        </div>

                        <div className="perf-stat-card">
                          <span className="label">⏰ Avg. Lead Time</span>
                          <div className="number">{selectedSupplierDetails?.performance?.leadTimeDays || 3} Days</div>
                          <span className="subtext">From PO to Delivery</span>
                        </div>

                        <div className="perf-stat-card">
                          <span className="label">🔄 Return Rate</span>
                          <div className={`number ${selectedSupplierDetails?.performance?.returnRate > 10 ? 'bad' : 'good'}`}>
                            {selectedSupplierDetails?.performance?.returnRate || 0.0}%
                          </div>
                          <span className="subtext">Damaged/Rejected items</span>
                        </div>
                      </div>

                      {/* AI Recommendation Card */}
                      <div className={`ai-insight-card ${getAIRecommendationStyle(selectedSupplierDetails?.aiRecommendation)}`}>
                        <div className="ai-insight-title">
                          <span className="sparkles">✨</span>
                          <h4>AI Procurement Recommendation</h4>
                        </div>
                        <p className="ai-insight-text">
                          {selectedSupplierDetails?.aiRecommendation || "Stable performance. Standard operations recommended."}
                        </p>
                      </div>

                      {/* Additional Details */}
                      <div className="contact-details-box">
                        <h4>Contact & Business Details</h4>
                        <div className="contact-grid">
                          <div className="grid-item">
                            <span>Contact Person</span>
                            <strong>{viewingSupplier.contactPerson}</strong>
                          </div>
                          <div className="grid-item">
                            <span>Email Address</span>
                            <strong>{viewingSupplier.email}</strong>
                          </div>
                          <div className="grid-item">
                            <span>Phone Number</span>
                            <strong>{viewingSupplier.phone}</strong>
                          </div>
                          <div className="grid-item full-width">
                            <span>Office Address</span>
                            <strong>{viewingSupplier.address}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDetailTab === 'contract' && (
                    <div className="contract-tab-content">
                      <div className="contract-status-summary">
                        <div className="info-badge-row">
                          <span className={`status-pill ${((selectedSupplierDetails?.contract?.status || viewingSupplier?.contract?.status || 'Under Negotiation').toLowerCase().replace(' ', '-'))}`}>
                            Contract: {selectedSupplierDetails?.contract?.status || viewingSupplier?.contract?.status || 'Under Negotiation'}
                          </span>
                        </div>
                        {isAdminOrManager && (
                          <button className="register-btn contract-edit-btn" onClick={handleOpenContractModal}>
                            ✏️ Manage Contract
                          </button>
                        )}
                      </div>

                      <div className="contract-details-grid">
                        <div className="contract-detail-item">
                          <span>Start Date</span>
                          <strong>{selectedSupplierDetails?.contract?.startDate ? formatDate(selectedSupplierDetails.contract.startDate) : 'Not Specified'}</strong>
                        </div>
                        <div className="contract-detail-item">
                          <span>End Date</span>
                          <strong>{selectedSupplierDetails?.contract?.endDate ? formatDate(selectedSupplierDetails.contract.endDate) : 'Not Specified'}</strong>
                        </div>
                        <div className="contract-detail-item">
                          <span>Payment Terms</span>
                          <strong className="badge-term">{selectedSupplierDetails?.contract?.paymentTerms || viewingSupplier?.contract?.paymentTerms || 'COD'}</strong>
                        </div>
                        <div className="contract-detail-item full-width">
                          <span>SLA (Service Level Agreements)</span>
                          <p className="doc-paragraph">{selectedSupplierDetails?.contract?.sla || viewingSupplier?.contract?.sla || 'No SLA terms defined yet.'}</p>
                        </div>
                        <div className="contract-detail-item full-width">
                          <span>Terms & Conditions</span>
                          <p className="doc-paragraph">{selectedSupplierDetails?.contract?.terms || viewingSupplier?.contract?.terms || 'No contract terms defined.'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDetailTab === 'history' && (
                    <div className="history-tab-content">
                      <div className="history-header">
                        <div className="history-stats">
                          <span>Spend: <strong>Rs. {procurementHistory?.totalSpend?.toLocaleString() || 0}</strong></span>
                          <span>PO: <strong>{procurementHistory?.metrics?.purchaseOrderCount || 0}</strong></span>
                          <span>Manual: <strong>{procurementHistory?.metrics?.manualCount || 0}</strong></span>
                        </div>
                        {isAdminOrManager && (
                          <button className="register-btn record-txn-btn" onClick={handleOpenTransactionModal}>
                            + Log Manual Supply
                          </button>
                        )}
                      </div>

                      <div className="table-responsive">
                        <table className="transaction-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Date</th>
                              <th>Items</th>
                              <th>Cost</th>
                              <th>Type</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {!procurementHistory?.history || procurementHistory.history.length === 0 ? (
                              <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                                  No transaction records found.
                                </td>
                              </tr>
                            ) : (
                              procurementHistory.history.map(tx => (
                                <tr key={tx.id}>
                                  <td className="order-id">📋 {tx.id}</td>
                                  <td>{formatDate(tx.date)}</td>
                                  <td>{tx.itemsCount} units</td>
                                  <td><strong>Rs. {tx.amount.toLocaleString()}</strong></td>
                                  <td>
                                    <span className={`type-badge ${tx.type.toLowerCase().replace(' ', '-')}`}>
                                      {tx.type}
                                    </span>
                                  </td>
                                  <td>
                                    {isAdminOrManager ? (
                                      <select
                                        value={tx.status}
                                        onChange={(e) => handleStatusChange(tx.id, e.target.value)}
                                        className={`status-pill ${tx.status.toLowerCase()}`}
                                        style={{
                                          border: 'none',
                                          cursor: 'pointer',
                                          outline: 'none',
                                          padding: '3px 16px 3px 8px',
                                          backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
                                          backgroundRepeat: 'no-repeat',
                                          backgroundPosition: 'right 4px center',
                                          backgroundSize: '8px',
                                          appearance: 'none',
                                          WebkitAppearance: 'none',
                                          MozAppearance: 'none'
                                        }}
                                      >
                                        <option value="Pending" style={{ background: '#ffffff', color: '#1e293b' }}>Pending</option>
                                        <option value="Delivered" style={{ background: '#ffffff', color: '#1e293b' }}>Delivered</option>
                                        <option value="Cancelled" style={{ background: '#ffffff', color: '#1e293b' }}>Cancelled</option>
                                      </select>
                                    ) : (
                                      <span className={`status-pill ${tx.status.toLowerCase()}`}>
                                        {tx.status}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeDetailTab === 'alerts' && (
                    <div className="alerts-tab-content">
                      {(() => {
                        const supplierAlerts = alerts.filter(
                          alert => mapProductToCategory(alert.product?.name) === viewingSupplier.category
                        );
                        if (supplierAlerts.length === 0) {
                          return (
                            <div className="empty-state">
                              <span className="empty-icon">✅</span>
                              <p className="empty-title">Stock Levels Healthy</p>
                              <p className="empty-subtitle">All products in the &ldquo;{viewingSupplier.category}&rdquo; category supplied by this vendor are currently above reorder levels.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="restock-alerts-container">
                            <h4 className="section-subtitle" style={{ fontSize: '13px', fontWeight: '700', marginBottom: '16px', color: '#475569' }}>
                              ⚠️ Stock shortages in &ldquo;{viewingSupplier.category}&rdquo; category:
                            </h4>
                            <div className="alerts-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {supplierAlerts.map(alert => (
                                <div
                                  key={alert._id}
                                  className="restock-alert-card bg-glass"
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    background: 'rgba(254, 242, 242, 0.5)'
                                  }}
                                >
                                  <div className="alert-card-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div className="alert-product-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>📦 {alert.product?.name || "Unknown Product"}</strong>
                                      <span className="branch-label" style={{ fontSize: '10px', background: 'rgba(15, 23, 42, 0.05)', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>📍 {alert.branch?.name || "Global"}</span>
                                    </div>
                                    <div className="alert-stock-details" style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                                      <span className="current-stock-label">Current Stock: <strong style={{ color: '#dc2626', fontWeight: '800' }}>{alert.quantity}</strong></span>
                                      <span className="reorder-label">Reorder Limit: <strong style={{ color: '#1e293b' }}>{alert.product?.reorderLevel || 0}</strong></span>
                                    </div>
                                  </div>
                                  <button
                                    className="register-btn restock-action-btn"
                                    onClick={() => handleQuickRestock(alert, viewingSupplier)}
                                    style={{
                                      height: '32px',
                                      padding: '0 12px',
                                      fontSize: '11px',
                                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                                    }}
                                  >
                                    ⚡ Quick Restock
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection bg-glass">
              <span className="big-icon">📊</span>
              <h3>No Supplier Selected</h3>
              <p>Click a supplier card to inspect performance analytics, contract information, and procurement logs.</p>
            </div>
          )}
        </div>
      </div>

      {/* Supplier Registration / Edit Form Modal */}
      {isFormOpen && (
        <div className="modal-backdrop">
          <div className="modal-content bg-glass">
            <div className="modal-header">
              <h3>{formMode === 'create' ? '🚚 Register New Supplier' : '✏️ Edit Supplier Information'}</h3>
              <button className="close-btn" onClick={() => setIsFormOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Company Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={formErrors.companyName ? 'error' : ''}
                    placeholder="Enter company name..."
                  />
                  {formErrors.companyName && <span className="error-text">{formErrors.companyName}</span>}
                </div>

                <div className="form-group">
                  <label>Contact Person Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className={formErrors.contactPerson ? 'error' : ''}
                    placeholder="e.g. Sunil Perera"
                  />
                  {formErrors.contactPerson && <span className="error-text">{formErrors.contactPerson}</span>}
                </div>

                <div className="form-group">
                  <label>Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={formErrors.email ? 'error' : ''}
                    placeholder="e.g. supplier@domain.com"
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Phone Number <span className="required">*</span></label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={formErrors.phone ? 'error' : ''}
                    placeholder="e.g. 0771234567"
                    maxLength={10}
                  />
                  {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                </div>

                <div className="form-group">
                  <label>Primary Supply Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Supplier Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Office Address <span className="required">*</span></label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={formErrors.address ? 'error' : ''}
                    placeholder="Enter supplier office location details..."
                    rows="2"
                  />
                  {formErrors.address && <span className="error-text">{formErrors.address}</span>}
                </div>

                {/* Contract initialization if creating */}
                {formMode === 'create' && (
                  <>
                    <div className="form-section-title full-width">
                      <h4>📜 Initial Contract Information</h4>
                    </div>

                    <div className="form-group">
                      <label>Contract Start Date</label>
                      <input
                        type="date"
                        name="contract.startDate"
                        value={formData.contract.startDate}
                        onChange={handleInputChange}
                        className={formErrors.startDate ? 'error' : ''}
                        min={getLocalDateString()}
                      />
                      {formErrors.startDate && <span className="error-text">{formErrors.startDate}</span>}
                    </div>

                    <div className="form-group">
                      <label>Contract End Date</label>
                      <input
                        type="date"
                        name="contract.endDate"
                        value={formData.contract.endDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Payment Terms</label>
                      <select name="contract.paymentTerms" value={formData.contract.paymentTerms} onChange={handleInputChange}>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 60">Net 60</option>
                        <option value="COD">COD (Cash on Delivery)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Contract Status</label>
                      <select name="contract.status" value={formData.contract.status} onChange={handleInputChange}>
                        <option value="Under Negotiation">Under Negotiation</option>
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                        <option value="Terminated">Terminated</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label>Contract SLA (Service Level Agreement)</label>
                      <input
                        type="text"
                        name="contract.sla"
                        value={formData.contract.sla}
                        onChange={handleInputChange}
                        placeholder="e.g. Deliver within 3 days of order placement"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Terms & Conditions</label>
                      <textarea
                        name="contract.terms"
                        value={formData.contract.terms}
                        onChange={handleInputChange}
                        placeholder="Detail any contract agreements and pricing policies here..."
                        rows="2"
                      />
                    </div>
                  </>
                )}

                {/* Initial performance scores (For simulation/edit) */}
                <div className="form-section-title full-width">
                  <h4>📊 Performance Metrics</h4>
                </div>

                <div className="form-group">
                  <label>On-Time Delivery Rate (%)</label>
                  <input
                    type="number"
                    name="performance.onTimeDelivery"
                    min="0"
                    max="100"
                    value={formData.performance.onTimeDelivery}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Quality Score (%)</label>
                  <input
                    type="number"
                    name="performance.qualityScore"
                    min="0"
                    max="100"
                    value={formData.performance.qualityScore}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Average Lead Time (Days)</label>
                  <input
                    type="number"
                    name="performance.leadTimeDays"
                    min="1"
                    value={formData.performance.leadTimeDays}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Return Rate (%)</label>
                  <input
                    type="number"
                    name="performance.returnRate"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.performance.returnRate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {formMode === 'create' ? 'Register Supplier' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contract Edit Modal */}
      {isContractModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content bg-glass">
            <div className="modal-header">
              <h3>📜 Edit Supplier Contract</h3>
              <button className="close-btn" onClick={() => setIsContractModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleContractSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Contract Start Date</label>
                  <input
                    type="date"
                    value={contractFormData.startDate}
                    onChange={e => setContractFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().substring(0, 10)}
                  />
                </div>

                <div className="form-group">
                  <label>Contract End Date</label>
                  <input
                    type="date"
                    value={contractFormData.endDate}
                    onChange={e => setContractFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Contract Status</label>
                  <select
                    value={contractFormData.status}
                    onChange={e => setContractFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Under Negotiation">Under Negotiation</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Terms</label>
                  <select
                    value={contractFormData.paymentTerms}
                    onChange={e => setContractFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="COD">COD (Cash on Delivery)</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Service Level Agreement (SLA)</label>
                  <input
                    type="text"
                    value={contractFormData.sla}
                    onChange={e => setContractFormData(prev => ({ ...prev, sla: e.target.value }))}
                    placeholder="e.g. Delivery within 2 days of PO issuance"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Contract Terms & Conditions</label>
                  <textarea
                    value={contractFormData.terms}
                    onChange={e => setContractFormData(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Enter detailed contract terms..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsContractModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Transaction Modal */}
      {isTransactionModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content bg-glass">
            <div className="modal-header">
              <h3>➕ Record Manual Procurement Supply</h3>
              <button className="close-btn" onClick={() => setIsTransactionModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleTransactionSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Transaction/Ref ID <span className="required">*</span></label>
                  <input
                    type="text"
                    value={transactionFormData.id}
                    onChange={e => setTransactionFormData(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="e.g. TXN-101"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Supply Date <span className="required">*</span></label>
                  <input
                    type="date"
                    value={transactionFormData.date}
                    onChange={e => setTransactionFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Total Items Count <span className="required">*</span></label>
                  <input
                    type="number"
                    value={transactionFormData.itemsCount}
                    onChange={e => setTransactionFormData(prev => ({ ...prev, itemsCount: parseInt(e.target.value) || 0 }))}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Total Cost (Rs.) <span className="required">*</span></label>
                  <input
                    type="number"
                    value={transactionFormData.amount}
                    onChange={e => setTransactionFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Supply Delivery Status</label>
                  <select
                    value={transactionFormData.status}
                    onChange={e => setTransactionFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Delivered">Delivered</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsTransactionModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Record Supply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Alert Restock Modal */}
      {clickedAlert && (
        <div className="modal-backdrop">
          <div className="modal-content bg-glass">
            <div className="modal-header">
              <h3>⚡ Quick Restock: {clickedAlert.product?.name}</h3>
              <button className="close-btn" onClick={() => setClickedAlert(null)}>✕</button>
            </div>

            <form onSubmit={handleRestockSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Select Supplier for Category: &ldquo;{mapProductToCategory(clickedAlert.product?.name)}&rdquo;</label>
                  <select
                    value={selectedRestockSupplierId}
                    onChange={e => setSelectedRestockSupplierId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers
                      .filter(s => s.status === 'Active')
                      .map(s => {
                        const isMatch = s.category === mapProductToCategory(clickedAlert.product?.name);
                        return (
                          <option key={s.id || s._id} value={s.id || s._id}>
                            {s.companyName} {isMatch ? '⭐ (Matches Category)' : `(${s.category})`} (Rating: {s.rating || '5.0'} ★)
                          </option>
                        );
                      })
                    }
                  </select>
                  {suppliers.filter(s => s.status === 'Active').length === 0 && (
                    <span className="error-text">⚠️ No active suppliers registered in the system.</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Order Reference ID</label>
                  <input
                    type="text"
                    value={restockFormData.id}
                    onChange={e => setRestockFormData(prev => ({ ...prev, id: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Branch Location</label>
                  <input
                    type="text"
                    value={clickedAlert.branch?.name || "Global"}
                    disabled
                    style={{ background: 'rgba(0, 0, 0, 0.05)', color: '#64748b' }}
                  />
                </div>

                <div className="form-group">
                  <label>Order Quantity (units)</label>
                  <input
                    type="number"
                    value={restockFormData.itemsCount}
                    onChange={e => setRestockFormData(prev => ({ ...prev, itemsCount: parseInt(e.target.value) || 0 }))}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Estimated Cost (Rs.)</label>
                  <input
                    type="number"
                    value={restockFormData.amount}
                    onChange={e => setRestockFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Order Status</label>
                  <select
                    value={restockFormData.status}
                    onChange={e => setRestockFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Pending">Pending (Not received yet)</option>
                    <option value="Delivered">Delivered (Restock immediately)</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setClickedAlert(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!selectedRestockSupplierId}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  ⚡ Record Restock Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled JSX - Premium design fitting with dashboard */}
      <style>{`
        .suppliers-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: #1e293b;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Glassmorphism utility */
        .bg-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
        }

        .hover-scale {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-scale:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }

        /* Metrics grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .metric-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }
        .metric-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .metric-icon-wrapper.blue { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
        .metric-icon-wrapper.green { background: rgba(16, 185, 129, 0.15); color: #059669; }
        .metric-icon-wrapper.orange { background: rgba(245, 158, 11, 0.15); color: #d97706; }
        .metric-icon-wrapper.gold { background: rgba(234, 179, 8, 0.15); color: #b45309; }

        .metric-details {
          display: flex;
          flex-direction: column;
        }
        .metric-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
        .metric-value {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 4px;
        }
        .value-sub {
          font-size: 13px;
          color: #64748b;
          font-weight: 400;
        }

        /* Controls Panel */
        .controls-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .search-box {
          position: relative;
          width: 100%;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: #94a3b8;
        }
        .search-box input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.6);
          color: #1e293b;
          font-size: 14px;
          transition: outline 0.15s, border-color 0.15s;
        }
        .search-box input:focus {
          outline: 2px solid #3b82f6;
          border-color: transparent;
        }

        .filters-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: flex-end;
        }
        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 140px;
        }
        .filter-item label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          font-weight: 700;
        }
        .filter-item select {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          color: #334155;
          cursor: pointer;
        }
        .register-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: transform 0.15s, box-shadow 0.15s;
          height: 40px;
          align-self: flex-end;
        }
        .register-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
        .register-btn:active {
          transform: translateY(0);
        }

        /* Layout panels */
        .suppliers-content-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .suppliers-content-layout {
            grid-template-columns: 1fr;
          }
          .supplier-detail-panel {
            position: fixed;
            top: 0;
            right: -100%;
            height: 100vh;
            width: 90% !important;
            max-width: 480px;
            z-index: 1000;
            transition: right 0.3s ease-in-out;
            box-shadow: -10px 0 30px rgba(0,0,0,0.15) !important;
            border-radius: 0 !important;
            border-left: 1px solid rgba(255,255,255,0.4) !important;
          }
          .supplier-detail-panel.open {
            right: 0;
          }
          .detail-close-btn {
            display: block !important;
          }
        }

        .suppliers-list-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .list-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 8px;
        }

        .suppliers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        /* Loading UI & Spinner */
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: #64748b;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(59, 130, 246, 0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .detail-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          color: #64748b;
          font-size: 13px;
        }

        /* Cards style */
        .supplier-item-card {
          padding: 16px;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.4);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .supplier-item-card.selected {
          border: 2px solid #3b82f6;
          background: rgba(255, 255, 255, 0.95);
        }
        .card-top {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
        }
        .supplier-icon-placeholder {
          font-size: 24px;
          background: rgba(15, 23, 42, 0.05);
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .title-area {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }
        .supplier-id {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 700;
        }
        .supplier-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin: 2px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .category-badge {
          font-size: 10px;
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
          padding: 2px 6px;
          border-radius: 6px;
          align-self: flex-start;
          font-weight: 600;
        }
        .category-badge.large {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .status-pill {
          font-size: 9px;
          padding: 3px 8px;
          border-radius: 10px;
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .status-pill.active { background: rgba(16, 185, 129, 0.15); color: #059669; }
        .status-pill.under-review { background: rgba(245, 158, 11, 0.15); color: #d97706; }
        .status-pill.under-negotiation { background: rgba(245, 158, 11, 0.15); color: #d97706; }
        .status-pill.inactive { background: rgba(100, 116, 139, 0.15); color: #64748b; }
        .status-pill.expired { background: rgba(100, 116, 139, 0.15); color: #64748b; }
        .status-pill.terminated { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
        .status-pill.delivered { background: rgba(16, 185, 129, 0.15); color: #059669; }
        .status-pill.pending { background: rgba(245, 158, 11, 0.15); color: #d97706; }
        .status-pill.cancelled { background: rgba(239, 68, 68, 0.15); color: #dc2626; }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          border-top: 1px dashed rgba(0, 0, 0, 0.05);
          border-bottom: 1px dashed rgba(0, 0, 0, 0.05);
          padding: 10px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          color: #475569;
        }
        .star-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #f59e0b;
          font-weight: 700;
        }
        .card-mini-metrics {
          display: flex;
          justify-content: space-between;
          background: rgba(15, 23, 42, 0.03);
          padding: 8px 12px;
          border-radius: 8px;
        }
        .mini-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mini-stat .label { font-size: 9px; color: #64748b; font-weight: 500; }
        .mini-stat .value { font-size: 12px; font-weight: 700; }
        .mini-stat .value.good { color: #059669; }
        .mini-stat .value.warn { color: #d97706; }
        .mini-stat .value.bad { color: #dc2626; }

        .card-actions {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }
        .edit-icon-btn {
          font-size: 11px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          font-weight: 600;
          color: #475569;
        }
        .edit-icon-btn:hover { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
        .edit-icon-btn.delete-btn:hover { background: rgba(239, 68, 68, 0.1); color: #dc2626; }

        .status-toggle-btn {
          font-size: 11px;
          background: transparent;
          border: 1px dashed rgba(0,0,0,0.15);
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          font-weight: 600;
          margin-left: auto;
        }
        .status-toggle-btn.deactivate { color: #dc2626; }
        .status-toggle-btn.deactivate:hover { background: rgba(239, 68, 68, 0.1); }
        .status-toggle-btn.activate { color: #059669; }
        .status-toggle-btn.activate:hover { background: rgba(16, 185, 129, 0.1); }

        /* Detail Panel */
        .supplier-detail-panel {
          width: 100%;
          min-height: 500px;
          align-self: stretch;
          padding: 24px;
          display: flex;
          flex-direction: column;
        }
        .no-selection {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }
        .no-selection .big-icon { font-size: 60px; margin-bottom: 16px; opacity: 0.6; }
        .no-selection h3 { font-size: 18px; font-weight: 700; color: #334155; margin-bottom: 8px; }
        .no-selection p { font-size: 13px; max-width: 240px; }

        .detail-close-btn {
          display: none;
          position: absolute;
          top: 20px; right: 20px;
          background: rgba(0,0,0,0.05);
          border: none; border-radius: 50%;
          width: 32px; height: 32px;
          font-size: 14px; color: #475569;
          cursor: pointer;
        }

        .detail-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }
        .detail-id { font-size: 11px; font-weight: 800; color: #3b82f6; letter-spacing: 0.05em; }
        .detail-header h2 { font-size: 22px; font-weight: 800; color: #0f172a; }
        .header-meta { display: flex; align-items: center; gap: 12px; margin-top: 4px; }

        .detail-tabs {
          display: flex;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
          gap: 4px;
        }
        .tab-btn {
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          border: none;
          background: transparent;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .tab-btn:hover { color: #0f172a; }
        .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }

        /* Performance Analytics Tab */
        .perf-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }
        .perf-meter-card {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .progress-circle {
          --size: 70px;
          --bar-w: 6px;
          width: var(--size);
          height: var(--size);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(closest-side, white 79%, transparent 80% 100%),
                      conic-gradient(#2563eb calc(var(--progress-pct) * 1%), rgba(37, 99, 235, 0.1) 0);
          position: relative;
        }
        .progress-circle .value {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }
        .perf-meter-card .label { font-size: 11px; font-weight: 600; color: #475569; }

        .perf-stat-card {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .perf-stat-card .label { font-size: 11px; font-weight: 600; color: #64748b; }
        .perf-stat-card .number { font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0; }
        .perf-stat-card .number.good { color: #059669; }
        .perf-stat-card .number.bad { color: #dc2626; }
        .perf-stat-card .subtext { font-size: 9px; color: #94a3b8; }

        /* AI Insight */
        .ai-insight-card {
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
          border: 1px solid transparent;
        }
        .ai-insight-card.excellent {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
          border-color: rgba(16, 185, 129, 0.2);
        }
        .ai-insight-card.caution {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(239, 68, 68, 0.05) 100%);
          border-color: rgba(245, 158, 11, 0.25);
        }
        .ai-insight-card.warning {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(245, 158, 11, 0.05) 100%);
          border-color: rgba(239, 68, 68, 0.2);
        }
        .ai-insight-card.normal {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%);
          border-color: rgba(37, 99, 235, 0.15);
        }
        .ai-insight-card::before {
          content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 80%);
          pointer-events: none;
        }
        .ai-insight-title {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #1e293b;
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 6px;
        }
        .ai-insight-card.excellent .ai-insight-title { color: #047857; }
        .ai-insight-card.caution .ai-insight-title { color: #b45309; }
        .ai-insight-card.warning .ai-insight-title { color: #b91c1c; }
        .ai-insight-card.normal .ai-insight-title { color: #1d4ed8; }

        .sparkles { font-size: 14px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        .ai-insight-text { font-size: 12px; color: #334155; line-height: 1.5; font-weight: 500; }

        /* Contact Box */
        .contact-details-box {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        .contact-details-box h4 { font-size: 13px; font-weight: 700; margin-bottom: 12px; color: #334155; }
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .grid-item { display: flex; flex-direction: column; gap: 2px; }
        .grid-item.full-width { grid-column: span 2; }
        .grid-item span { font-size: 10px; color: #64748b; font-weight: 500; }
        .grid-item strong { font-size: 12px; color: #1e293b; font-weight: 600; word-break: break-all; }

        /* Contract tab styles */
        .contract-status-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(15, 23, 42, 0.03);
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .contract-edit-btn {
          height: 32px;
          align-self: center;
        }
        .contract-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .contract-detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .contract-detail-item.full-width {
          grid-column: span 2;
        }
        .contract-detail-item span {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
        }
        .contract-detail-item strong {
          font-size: 14px;
          color: #0f172a;
        }
        .badge-term {
          font-size: 12px;
          background: rgba(37, 99, 235, 0.1);
          color: #1d4ed8;
          padding: 4px 10px;
          border-radius: 6px;
          align-self: flex-start;
        }
        .doc-paragraph {
          font-size: 13px;
          color: #334155;
          line-height: 1.6;
          background: rgba(255, 255, 255, 0.4);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.03);
          margin-top: 4px;
        }

        /* Transaction History Tab */
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .history-stats {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #475569;
        }
        .record-txn-btn {
          height: 32px;
          align-self: center;
          font-size: 12px;
          padding: 0 12px;
        }
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .transaction-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          text-align: left;
        }
        .transaction-table th {
          padding: 10px 8px;
          border-bottom: 1.5px solid rgba(0, 0, 0, 0.08);
          color: #475569;
          font-weight: 700;
        }
        .transaction-table td {
          padding: 12px 8px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }
        .transaction-table tbody tr:hover {
          background: rgba(0, 0, 0, 0.01);
        }
        .order-id { font-weight: 600; color: #2563eb; }

        .type-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .type-badge.manual { background: rgba(147, 51, 234, 0.1); color: #7c3aed; }
        .type-badge.purchase-order { background: rgba(59, 130, 246, 0.1); color: #2563eb; }

        /* Modal styling */
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-content {
          width: 100%;
          max-width: 580px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 16px;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding-bottom: 12px;
        }
        .modal-header h3 { font-size: 18px; font-weight: 800; color: #0f172a; }
        .modal-header .close-btn {
          background: transparent; border: none; font-size: 16px; color: #64748b; cursor: pointer;
        }
        .modal-header .close-btn:hover { color: #0f172a; }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group.full-width { grid-column: span 2; }
        .form-group label {
          font-size: 11px; font-weight: 700; color: #475569;
        }
        .form-group input, .form-group select, .form-group textarea {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          color: #1e293b;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: 2px solid #3b82f6;
          border-color: transparent;
        }
        .form-group input.error, .form-group textarea.error {
          border-color: #ef4444;
          outline-color: #ef4444;
        }
        .error-text { font-size: 10px; color: #ef4444; font-weight: 600; }
        .required { color: #ef4444; }

        .form-section-title {
          margin-top: 14px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding-bottom: 6px;
        }
        .form-section-title h4 { font-size: 12px; font-weight: 700; color: #1d4ed8; }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          padding-top: 16px;
        }
        .cancel-btn {
          background: transparent; border: 1px solid rgba(0,0,0,0.1);
          color: #475569; font-weight: 600; padding: 10px 20px;
          border-radius: 8px; cursor: pointer; font-size: 13px;
        }
        .cancel-btn:hover { background: rgba(0, 0, 0, 0.03); color: #0f172a; }
        .submit-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white; font-weight: 600; padding: 10px 20px;
          border-radius: 8px; border: none; cursor: pointer; font-size: 13px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        .submit-btn:hover { box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3); }

        .empty-state {
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .empty-state.error-state {
          border: 1px solid rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.03);
        }
        .empty-icon { font-size: 40px; margin-bottom: 12px; }
        .empty-title { font-size: 14px; font-weight: 700; color: #334155; }
        .empty-subtitle { font-size: 12px; color: #64748b; margin-bottom: 14px; }

        /* Custom alerts styling */
        .alert-badge {
          font-size: 10px;
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 2px;
          border: 1px solid rgba(239, 68, 68, 0.15);
        }
        .pulsing-alert {
          animation: pulse-border 2s infinite ease-in-out;
        }
        @keyframes pulse-border {
          0%, 100% {
            background-color: rgba(239, 68, 68, 0.08);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2);
          }
          50% {
            background-color: rgba(239, 68, 68, 0.18);
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0);
          }
        }
        .card-has-alerts {
          border-left: 4px solid #ef4444 !important;
        }
        .tab-badge-count {
          position: absolute;
          top: -6px;
          right: -12px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 800;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
};

export default SuppliersPage;
