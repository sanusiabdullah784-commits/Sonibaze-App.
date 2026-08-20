import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle, XCircle, Eye, DollarSign, Clock, 
  Loader2, AlertCircle, Image as ImageIcon, Search, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../services/supabaseClient';

export default function AdminPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch payments from Supabase on load
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
    } else {
      setPayments(data || []);
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (id: string, status: 'Approved' | 'Rejected') => {
    const { error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id);

    if (error) {
      setNotification({ message: 'Failed to update status.', type: 'error' });
    } else {
      setNotification({ message: `Payment ${status.toLowerCase()} successfully!`, type: 'success' });
      // Update local state instantly
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    }
    
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter Logic
  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.student_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    // FIXED: Changed 'pl-64' to 'md:pl-64' for mobile responsiveness
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:pl-64 transition-colors duration-500">
      <Navbar />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md ${
              notification.type === 'success' 
                ? 'bg-green-50/90 dark:bg-green-900/80 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-100' 
                : 'bg-red-50/90 dark:bg-red-900/80 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-100'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-semibold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 mb-4 transition">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Payment Verification 💳</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and approve student payment evidence from the cloud.</p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4"
        >
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by student email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer transition"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {/* Custom Dropdown Arrow */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </motion.div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">No Payments Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPayments.map((payment, index) => (
              <motion.div 
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col"
              >
                {/* Real Image Preview from Supabase Storage */}
                <div className="h-52 bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative group overflow-hidden">
                  {payment.file_url ? (
                    <img 
                      src={payment.file_url} 
                      alt="Payment Receipt" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-500" />
                  )}
                  
                  {/* Hover Overlay to view full size */}
                  <a 
                    href={payment.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="w-8 h-8 text-white" />
                  </a>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{payment.student_email}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {formatDate(payment.created_at)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      payment.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      payment.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {payment.status}
                    </span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate max-w-[150px]">ID: {payment.id.substring(0, 8)}...</p>
                    {payment.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusChange(payment.id, 'Rejected')}
                          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                          title="Reject Payment"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(payment.id, 'Approved')}
                          className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                          title="Approve Payment"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}