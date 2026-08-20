import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, Send, Users, Clock, CheckCircle, 
  AlertTriangle, History, ArrowLeft, Sparkles, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../services/supabaseClient';

export default function Broadcast() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [adminName, setAdminName] = useState('Admin');
  const [formData, setFormData] = useState({
    recipient: 'all',
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and fetch data
  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        setAdminName('SoniBaze Admin');
      }
      await fetchBroadcasts();
      setIsLoading(false);
    }
    initialize();

    // Real-time subscription for new broadcasts
    const subscription = supabase
      .channel('broadcasts-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'broadcasts' },
        (payload) => {
          setBroadcastHistory(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchBroadcasts = async () => {
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setBroadcastHistory(data);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message || !currentUser) return;

    setIsSending(true);
    
    const { error } = await supabase
      .from('broadcasts')
      .insert([
        {
          sender_id: currentUser.id,
          sender_name: adminName,
          subject: formData.subject,
          message: formData.message,
          recipient_type: formData.recipient,
          priority: formData.priority
        }
      ]);

    if (error) {
      console.error('Error sending broadcast:', error);
      alert('Failed to send broadcast: ' + error.message);
    } else {
      setShowSuccess(true);
      setFormData({ recipient: 'all', subject: '', message: '', priority: 'normal' });
      setTimeout(() => setShowSuccess(false), 4000);
    }
    
    setIsSending(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRecipientLabel = (type: string) => {
    switch(type) {
      case 'all': return 'All Students';
      case 'networking': return 'Computer Networking';
      case 'uiux': return 'UI/UX Design';
      case 'data': return 'Data Science';
      case 'pending': return 'Pending Approvals';
      default: return 'All Students';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pl-64 transition-colors duration-500">
      <Navbar />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 mb-4 transition">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-green-600 rounded-xl shadow-lg">
              <Megaphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Broadcast Center 📢</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Send instant announcements to your students.</p>
            </div>
          </div>
        </motion.div>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 right-8 z-50 bg-green-50 dark:bg-green-900/80 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-100 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md"
            >
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-bold">Broadcast Sent Successfully!</p>
                <p className="text-xs opacity-80">Notifications have been pushed to all selected students.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Compose Broadcast Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" /> Compose New Message
            </h2>

            <form onSubmit={handleSend} className="space-y-6">
              
              {/* Recipient & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select 
                      value={formData.recipient}
                      onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                    >
                      <option value="all">All Students</option>
                      <option value="networking">Computer Networking</option>
                      <option value="uiux">UI/UX Design</option>
                      <option value="data">Data Science</option>
                      <option value="pending">Pending Approvals</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority Level</label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                    >
                      <option value="normal">Normal (Standard)</option>
                      <option value="important">Important (Highlighted)</option>
                      <option value="urgent">Urgent (Push Notification)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subject / Title</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="e.g., Important Update Regarding Next Week's Classes"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message Body</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={6}
                  placeholder="Type your announcement here..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                ></textarea>
                <p className="text-xs text-gray-400 mt-2 text-right">{formData.message.length} characters</p>
              </div>

              {/* Send Button */}
              <div className="flex justify-end pt-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isSending || !formData.subject || !formData.message}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all duration-200 ${
                    isSending || !formData.subject || !formData.message
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-green-600 hover:shadow-lg hover:shadow-purple-500/30'
                  }`}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Send Broadcast
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* RIGHT: Broadcast History */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Recent Broadcasts
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : broadcastHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No broadcasts sent yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {broadcastHistory.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition line-clamp-1">
                        {item.subject}
                      </h4>
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{item.message}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <Users className="w-3 h-3" /> {getRecipientLabel(item.recipient_type)}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(item.created_at)}
                      </span>
                      {item.priority === 'urgent' && (
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                          URGENT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}