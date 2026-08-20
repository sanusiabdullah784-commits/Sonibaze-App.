import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, UserCheck, UserX, Clock, Loader2, 
  CheckCircle, Ban, Calendar, X, AlertCircle, Pause, Play, Archive, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../services/supabaseClient';

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false); // New state for archived filter
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Pause Modal State
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseDaysInput, setPauseDaysInput] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setNotification({ message: 'Failed to load students.', type: 'error' });
    } else {
      setStudents(data || []);
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (studentId: string, newStatus: string) => {
    const { error } = await supabase.from('students').update({ status: newStatus }).eq('id', studentId);
    if (error) {
      setNotification({ message: 'Failed to update status.', type: 'error' });
    } else {
      setNotification({ message: `Student status updated to ${newStatus}!`, type: 'success' });
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleArchiveStudent = async (studentId: string) => {
    if (!window.confirm('Are you sure you want to archive this student? They will be removed from the active list.')) return;
    
    const { error } = await supabase.from('students').update({ status: 'archived' }).eq('id', studentId);
    if (error) {
      setNotification({ message: 'Failed to archive student.', type: 'error' });
    } else {
      setNotification({ message: 'Student archived successfully.', type: 'success' });
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'archived' } : s));
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRestoreStudent = async (studentId: string) => {
    const { error } = await supabase.from('students').update({ status: 'approved' }).eq('id', studentId);
    if (error) {
      setNotification({ message: 'Failed to restore student.', type: 'error' });
    } else {
      setNotification({ message: 'Student restored to active list.', type: 'success' });
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'approved' } : s));
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const openScheduleModal = (student: any) => {
    setSelectedStudent(student);
    setTempStartDate(student.start_date || '');
    setTempEndDate(student.end_date || '');
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async () => {
    if (!selectedStudent || !tempStartDate || !tempEndDate) {
      alert('Please select both start and end dates.');
      return;
    }
    setIsSaving(true);
    const { error } = await supabase
      .from('students')
      .update({ start_date: tempStartDate, end_date: tempEndDate })
      .eq('id', selectedStudent.id)
      .select();

    if (error) {
      setNotification({ message: 'Failed to save schedule: ' + error.message, type: 'error' });
    } else {
      setNotification({ message: 'Schedule saved successfully!', type: 'success' });
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, start_date: tempStartDate, end_date: tempEndDate } : s));
      setShowScheduleModal(false);
    }
    setIsSaving(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const openPauseModal = (student: any) => {
    setSelectedStudent(student);
    setPauseDaysInput('');
    setShowPauseModal(true);
  };

  const handlePauseStudent = async () => {
    const days = parseInt(pauseDaysInput, 10);
    if (!selectedStudent || isNaN(days) || days <= 0) {
      alert('Please enter a valid number of days.');
      return;
    }
    setIsSaving(true);
    const currentPaused = selectedStudent.paused_days || 0;
    const { error } = await supabase
      .from('students')
      .update({ paused_days: currentPaused + days })
      .eq('id', selectedStudent.id)
      .select();

    if (error) {
      setNotification({ message: 'Failed to pause student: ' + error.message, type: 'error' });
    } else {
      setNotification({ message: `Granted ${days} days of approved leave!`, type: 'success' });
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, paused_days: currentPaused + days } : s));
      setShowPauseModal(false);
    }
    setIsSaving(false);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter logic: matches search AND (showArchived is true OR status is not archived)
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArchiveFilter = showArchived ? true : s.status !== 'archived';
    return matchesSearch && matchesArchiveFilter;
  });

  return (
    // FIXED: Changed 'pl-64' to 'md:pl-64' for mobile responsiveness
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:pl-64 transition-colors duration-500">
      <Navbar />
      
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md ${
              notification.type === 'success' ? 'bg-green-50/90 dark:bg-green-900/80 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-100' : 'bg-red-50/90 dark:bg-red-900/80 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-100'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-semibold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Student Management 👥</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Set schedules, grant leave, and manage student statuses.</p>
        </motion.div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
          </div>
          
          {/* Archive Toggle */}
          <button 
            onClick={() => setShowArchived(!showArchived)}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition border ${
              showArchived 
                ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300' 
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <Archive className="w-4 h-4" />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-2xl"><Loader2 className="w-10 h-10 text-purple-600 animate-spin" /></div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                    <th className="p-4">Student</th>
                    <th className="p-4 hidden sm:table-cell">Schedule</th>
                    <th className="p-4 hidden md:table-cell">Paused Days</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No students found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition ${student.status === 'archived' ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {student.full_name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white">{student.full_name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                              {/* Show schedule on mobile if hidden */}
                              {student.start_date && student.end_date && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1">
                                  {student.start_date} to {student.end_date}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          {student.start_date && student.end_date ? (
                            <div className="flex flex-col text-sm text-gray-600 dark:text-gray-300">
                              <span>Start: <span className="font-semibold text-gray-800 dark:text-white">{student.start_date}</span></span>
                              <span>End: <span className="font-semibold text-gray-800 dark:text-white">{student.end_date}</span></span>
                            </div>
                          ) : (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Not Set</span>
                          )}
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {student.paused_days > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold">
                              <Pause className="w-3 h-3" /> {student.paused_days} Days
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">0 Days</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            student.status === 'archived' ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                            student.status === 'approved' || student.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            student.status === 'suspended' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {student.status === 'archived' ? <><Archive className="w-3 h-3" /> Archived</> :
                             student.status === 'approved' || student.status === 'active' ? <><UserCheck className="w-3 h-3" /> Approved</> :
                             student.status === 'suspended' ? <><Ban className="w-3 h-3" /> Suspended</> :
                             <><Clock className="w-3 h-3" /> Pending</>}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {student.status === 'archived' ? (
                              <button onClick={() => handleRestoreStudent(student.id)} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 transition" title="Restore Student">
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            ) : (
                              <>
                                <button onClick={() => openScheduleModal(student)} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 transition" title="Set Schedule">
                                  <Calendar className="w-4 h-4" />
                                </button>
                                <button onClick={() => openPauseModal(student)} className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 transition" title="Grant Leave / Pause Timer">
                                  <Pause className="w-4 h-4" />
                                </button>
                                {student.status === 'pending' && (
                                  <button onClick={() => handleStatusChange(student.id, 'approved')} className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 transition" title="Approve">
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                {/* Archive Button */}
                                <button onClick={() => handleArchiveStudent(student.id)} className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition" title="Archive Student">
                                  <Archive className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && selectedStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowScheduleModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-600" /> Set Training Schedule</h3>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Setting schedule for <span className="font-bold text-purple-600 dark:text-purple-400">{selectedStudent.full_name}</span></p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                  <input type="date" value={tempStartDate} onChange={(e) => setTempStartDate(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                  <input type="date" value={tempEndDate} onChange={(e) => setTempEndDate(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <button onClick={handleSaveSchedule} disabled={isSaving || !tempStartDate || !tempEndDate} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  {isSaving ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause / Grant Leave Modal */}
      <AnimatePresence>
        {showPauseModal && selectedStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowPauseModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2"><Pause className="w-5 h-5 text-yellow-600" /> Grant Approved Leave</h3>
                <button onClick={() => setShowPauseModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Granting leave for <span className="font-bold text-yellow-600 dark:text-yellow-400">{selectedStudent.full_name}</span></p>
                <p className="text-xs text-gray-400">Current paused days: <span className="font-bold">{selectedStudent.paused_days || 0}</span></p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Number of Days to Pause</label>
                  <input type="number" min="1" value={pauseDaysInput} onChange={(e) => setPauseDaysInput(e.target.value)} placeholder="e.g., 3" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                </div>
                <button onClick={handlePauseStudent} disabled={isSaving || !pauseDaysInput} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-70">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Pause className="w-5 h-5" />}
                  {isSaving ? 'Processing...' : 'Pause Timer & Extend End Date'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}