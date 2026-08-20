import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, BookOpen, DollarSign, TrendingUp, Search, 
  Download, CheckCircle, XCircle, Clock, Activity, Bell, Ban, AlertTriangle, X
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'warning' } | null>(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock data for pending approvals
  const [pendingStudents, setPendingStudents] = useState([
    { id: 'SBD-001', name: 'Abdullah Musa', course: 'Computer Networking', amount: '₦150,000', date: '2 hrs ago', status: 'Pending Payment' },
    { id: 'SBD-002', name: 'Fatima Ibrahim', course: 'UI/UX Design', amount: '₦120,000', date: '5 hrs ago', status: 'Pending Approval' },
    { id: 'SBD-003', name: 'Chinedu Okafor', course: 'Data Science', amount: '₦200,000', date: '1 day ago', status: 'Pending Schedule' },
    { id: 'SBD-004', name: 'Amina Yusuf', course: 'Cybersecurity', amount: '₦180,000', date: '1 day ago', status: 'Pending Payment' },
  ]);

  // Mock Notifications Data
  const notificationsList = [
    { id: 1, title: 'New Registration', message: 'Abdullah Musa just signed up for Computer Networking.', time: '10 mins ago', icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', read: false },
    { id: 2, title: 'Payment Uploaded', message: 'Fatima Ibrahim uploaded a payment receipt.', time: '1 hour ago', icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', read: false },
    { id: 3, title: 'System Alert', message: 'Daily backup completed successfully.', time: '5 hours ago', icon: CheckCircle, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', read: true },
  ];

  // Function to handle admin actions
  const handleAction = (studentId: string, action: 'approve' | 'suspend' | 'reject') => {
    const student = pendingStudents.find(s => s.id === studentId);
    if (!student) return;

    let message = '';
    let type: 'success' | 'error' | 'warning' = 'success';

    if (action === 'approve') { message = `${student.name} has been successfully approved!`; type = 'success'; } 
    else if (action === 'suspend') { message = `${student.name} has been suspended.`; type = 'warning'; } 
    else { message = `${student.name} has been rejected.`; type = 'error'; }

    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
    setPendingStudents(prev => prev.filter(s => s.id !== studentId));
  };

  // Function to Export CSV
  const handleExport = () => {
    const headers = "ID,Name,Course,Amount,Date,Status\n";
    const rows = pendingStudents.map(s => 
      `${s.id},"${s.name}","${s.course}",${s.amount},"${s.date}","${s.status}"`
    ).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sonibaze_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification({ message: 'Report exported successfully!', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredStudents = pendingStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = notificationsList.filter(n => !n.read).length;

  return (
    // FIXED: Changed 'pl-64' to 'md:pl-64' for mobile responsiveness
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:pl-64 transition-colors duration-500">
      <Navbar />
      
      {/* Premium Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${
              notification.type === 'success' ? 'bg-green-50/90 dark:bg-green-900/80 border-green-200 dark:border-green-800 text-green-800 dark:text-green-100' :
              notification.type === 'warning' ? 'bg-yellow-50/90 dark:bg-yellow-900/80 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-100' :
              'bg-red-50/90 dark:bg-red-900/80 border-red-200 dark:border-red-800 text-red-800 dark:text-red-100'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5" />}
            <span className="font-semibold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        
        {/* Top Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white transition-colors">Admin Command Center 👨‍💼</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">Manage students, courses, and financials.</p>
          </div>
          
          <div className="flex gap-3 relative w-full md:w-auto">
            {/* 1. Working Export Button */}
            <button 
              onClick={handleExport}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm text-sm font-semibold"
            >
              <Download className="w-4 h-4" /> Export
            </button>

            {/* 2. Working Notifications Button */}
            <div className="relative flex-1 md:flex-none">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-green-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition font-semibold text-sm"
              >
                <Bell className="w-4 h-4" /> Notifications
                {unreadCount > 0 && (
                  <span className="bg-white text-purple-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                      <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
                      <button onClick={() => setShowNotifDropdown(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {notificationsList.map((notif) => (
                        <div key={notif.id} className={`p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition ${!notif.read ? 'bg-purple-50/30 dark:bg-purple-900/10' : ''}`}>
                          <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                              <notif.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-800 dark:text-white">{notif.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                              <p className="text-[10px] text-gray-400 mt-2">{notif.time}</p>
                            </div>
                            {!notif.read && <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full py-3 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-center">
                      View All Notifications
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { title: 'Total Students', value: '425', trend: '+12%', icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
            { title: 'Pending Approval', value: String(pendingStudents.length), trend: 'Live', icon: Clock, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
            { title: 'Active Courses', value: '15', trend: 'Stable', icon: BookOpen, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
            { title: 'Total Revenue', value: '₦12.5M', trend: '+18%', icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
          ].map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> {stat.trend}
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.title}</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Pending Approvals Table */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" /> Pending Approvals
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by name or ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            </div>
            
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
                <p className="font-semibold">All caught up! No pending approvals.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                      <th className="pb-3 pl-2">Student</th>
                      <th className="pb-3 hidden sm:table-cell">Course</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 hidden md:table-cell">Status</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white">{student.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{student.id} • {student.date}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{student.course}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{student.course}</td>
                        <td className="py-4 font-semibold text-gray-800 dark:text-white">{student.amount}</td>
                        <td className="py-4 hidden md:table-cell">
                          <span className="text-xs font-semibold px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                            {student.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleAction(student.id, 'approve')} title="Approve" className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleAction(student.id, 'suspend')} title="Suspend" className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition">
                              <Ban className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleAction(student.id, 'reject')} title="Reject" className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* RIGHT: Recent Activity Feed */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6"
          >
            <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Recent Activity
            </h3>
            
            <div className="space-y-6 relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-700"></div>
              {[
                { action: 'New registration', user: 'John Doe', time: '10 mins ago', icon: Users, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { action: 'Payment evidence uploaded', user: 'Sarah Smith', time: '1 hour ago', icon: DollarSign, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { action: 'Course completed', user: 'Michael Johnson', time: '3 hours ago', icon: BookOpen, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
              ].map((item, index) => (
                <div key={index} className="relative flex gap-4">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">by <span className="font-medium text-purple-600 dark:text-purple-400">{item.user}</span></p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition">
              View All Activity
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}