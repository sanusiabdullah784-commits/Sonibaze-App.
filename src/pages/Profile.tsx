import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, BookOpen, Calendar, Shield, ArrowLeft, Edit, Loader2, AlertCircle, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NotificationSettings from '../components/NotificationSettings';
import { supabase } from '../services/supabaseClient';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ fullName: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      // 1. Get the currently logged-in user from Auth
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);
      
      if (user) {
        // 2. Fetch their details from the 'students' table
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.log("No student profile found yet, using Auth data.");
        } else {
          setProfile(data);
          setEditData({ fullName: data.full_name || '', phone: data.phone || '' });
        }
      }
      setIsLoading(false);
    }

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('students')
      .update({ full_name: editData.fullName, phone: editData.phone })
      .eq('id', authUser.id);

    if (error) {
      alert('Failed to update profile.');
    } else {
      // Update local state instantly
      setProfile(prev => prev ? { ...prev, ...editData } : { id: authUser.id, ...editData, email: authUser.email });
      setShowEditModal(false);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      // FIXED: Changed 'pl-64' to 'md:pl-64'
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:pl-64 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  // Smart Fallback Data
  const name = profile?.full_name || authUser?.user_metadata?.full_name || 'Student';
  const email = profile?.email || authUser?.email || 'student@sonibaze.ng';
  const course = profile?.course || 'Not Enrolled';
  const duration = profile?.duration || 'N/A';
  const mode = profile?.mode || 'N/A';
  const paymentStatus = profile?.status === 'approved' ? 'Verified' : (profile?.status === 'rejected' ? 'Rejected' : 'Pending Verification');
  const studentId = profile?.id ? `SBD-${profile.id.substring(0, 6).toUpperCase()}` : 'SBD-000000';

  return (
    // FIXED: Changed 'pl-64' to 'md:pl-64'
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:pl-64 transition-colors duration-500">
      <Navbar />
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-end">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 mb-4 transition">
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">My Profile 👤</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and training details.</p>
          </div>
          {/* WORKING EDIT BUTTON */}
          <button 
            onClick={() => setShowEditModal(true)}
            className="btn-primary flex items-center gap-2 text-sm md:text-base"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Avatar & Basic Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center transition-colors"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-green-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4">
              {name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Student</p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3 mb-4">
              <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold mb-1">Student ID</p>
              <p className="text-lg font-black text-blue-900 dark:text-blue-100 tracking-wider">{studentId}</p>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" /> 
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400" /> 
                <span>{profile?.phone || 'Not provided'}</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Training Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Training Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Enrolled Course</p>
                <p className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" /> {course}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Training Duration</p>
                <p className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> {duration}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Class Mode</p>
                <p className="text-base font-bold text-gray-800 dark:text-white">{mode}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Payment Status</p>
                <p className={`text-base font-bold flex items-center gap-2 ${
                  paymentStatus === 'Verified' ? 'text-green-600 dark:text-green-400' :
                  paymentStatus === 'Rejected' ? 'text-red-600 dark:text-red-400' :
                  'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {paymentStatus === 'Pending Verification' && <AlertCircle className="w-4 h-4" />}
                  {paymentStatus}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors sm:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Account Status</p>
                <p className="text-base font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Active & Approved
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Push Notification Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <NotificationSettings />
        </motion.div>

      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-purple-600" /> Edit Profile
                </h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={editData.fullName}
                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-xs text-blue-600 dark:text-blue-400">
                  Note: Email and Course cannot be changed after registration.
                </div>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}