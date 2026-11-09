import React, { useEffect, useState } from 'react';
import { RefreshCw, UserRound, Sparkles, UserCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPersonalizedRecommendations, getCustomerList } from '../../services/recommendationApi';
import RecommendationCard from './RecommendationCard';

const PersonalizedRecommendations = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const customer = customers.find((item) => item.id === selectedCustomerId);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch real customer list from backend on mount
  useEffect(() => {
    const loadCustomers = async () => {
      setCustomersLoading(true);
      try {
        const list = await getCustomerList();
        setCustomers(list);
        if (list.length > 0) {
          setSelectedCustomerId(list[0].id);
        }
      } catch (err) {
        setError('Could not load customer list from the backend.');
      } finally {
        setCustomersLoading(false);
      }
    };
    loadCustomers();
  }, []);

  // Fetch personalized recommendations when customer changes
  const fetchPersonalized = async () => {
    if (!selectedCustomerId) return;
    setLoading(true);
    setIsRefreshing(true);
    setError('');

    try {
      const recommendations = await getPersonalizedRecommendations(selectedCustomerId, 8);
      setProducts(recommendations);
    } catch (err) {
      setError('Personalized recommendations could not be loaded.');
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      fetchPersonalized();
    }
  }, [selectedCustomerId]);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-6 md:p-8 h-full"
    >
      {/* Decorative gradient orb */}
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold tracking-wider text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-full">
              Personalized
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            For {customer?.name || 'Customer'}
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            AI-driven suggestions based on unique purchase history.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <UserRound className="h-4 w-4 text-slate-400" />
            </div>
            {customersLoading ? (
              <div className="flex items-center gap-2 pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-400 font-semibold shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading customers...
              </div>
            ) : (
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer hover:border-slate-300 transition-colors text-left"
                >
                  <span className="truncate">{customer?.name || 'Select Customer'}</span>
                  <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                    >
                      {customers.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedCustomerId(item.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 transition-colors ${selectedCustomerId === item.id ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600' : 'text-slate-700'}`}
                        >
                          {item.name}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex justify-center items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors"
            onClick={fetchPersonalized} 
            disabled={loading || customersLoading}
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            Refresh
          </motion.button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence mode="wait">
          {loading || customersLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={`skeleton-pers-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[260px] rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%] animate-[pulse_2s_ease-in-out_infinite] border border-white"
              />
            ))
          ) : products.length > 0 ? (
            products.slice(0, 4).map((product, index) => (
              <RecommendationCard
                key={product.productId || product._id || `personalized-${index}`}
                product={product}
                rank={index + 1}
                variant="personalized"
                index={index}
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-10 flex flex-col items-center justify-center text-slate-400 bg-white/40 rounded-2xl border border-dashed border-slate-200"
            >
              <Sparkles className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-medium">No personalized recommendations found.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default PersonalizedRecommendations;
