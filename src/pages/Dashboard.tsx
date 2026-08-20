import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Monitor, BookOpen, CheckCircle, Bell, X, Megaphone, CreditCard, AlertTriangle, Pause, Play } from 'lucide-react';
import Navbar from '../components/Navbar';
import PWAInstallPrompt from '../components/PWAInstallPrompt'; // <-- Added PWA Install Prompt
import { supabase } from '../services/supabaseClient';

// Helper function to calculate dynamic time left, accounting for paused days
const calculateDynamicTimeLeft = (endDateStr: string, startDateStr: string, pausedDays: number = 0) => {
  // Add paused days to the end date (in milliseconds)
  const end = new Date(endDateStr).getTime() + (pausedDays * 24 * 60 * 60 * 1000);
  const start = new Date(startDateStr).getTime();
  const now = new Date().getTime();

  if (now < start) return { status: 'not_started', timeLeft: null, percentage: 0 };
  if (now > end) return { status: 'completed', timeLeft: null, percentage: 100 };

  const totalDuration = end - start;
  const timeRemaining = end - now;
  const timeElapsed = now - start;
  const percentage = Math.min(100, Math.max(0, (timeElapsed / totalDuration) * 100));

  const seconds = Math.floor((timeRemaining / 1000) % 60);
  const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
  const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  
  const totalMonths = Math.floor(days / 30);
  const remainingDaysAfterMonths = days % 30;
  const weeks = Math.floor(remainingDaysAfterMonths / 7);
  const finalDays = remainingDaysAfterMonths % 7;

  return {
    status: 'active',
    timeLeft: { months: totalMonths, weeks, days: finalDays, hours: String(hours).padStart(2, '0'), minutes: String(minutes).padStart(2, '0'), seconds: String(seconds).padStart(2, '0'), percentage },
    percentage
  };
};

export default function Dashboard() {
  const [studentData, setStudentData] = useState<any>(null);
  const [timeData, setTimeData] = useState<any>({ status: 'loading', timeLeft: null, percentage: 0 });
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Student Data & Schedule
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('students')
          .select('full_name, course, duration, mode, status, start_date, end_date, paused_days')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setStudentData(data);
          if (!data.start_date || !data.end_date) {
            setTimeData({ status: 'no_dates', timeLeft: null, percentage: 0 });
          }
        } else {
          setTimeData({ status: 'error', timeLeft: null, percentage: 0 });
        }
      }
    }
    fetchData();
  }, []);

  // 2. Start Countdown Timer ONLY if dates exist
  useEffect(() => {
    if (studentData?.start_date && studentData?.end_date) {
      const updateTimer = () => {
        const result = calculateDynamicTimeLeft(studentData.end_date, studentData.start_date, studentData.paused_days || 0);
        setTimeData(result);
      };
      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [studentData]);

  // 3. Fetch Broadcasts
  useEffect(() => {
    async function fetchBroadcasts() {
      const { data } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(5);
      if (data) setBroadcasts(data);
    }
    fetchBroadcasts();
    const subscription = supabase.channel('student-broadcasts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'broadcasts' }, (payload) => {
      setBroadcasts(prev => [payload.new, ...prev].slice(0, 5));
    }).subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setShowNotifDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const studentNotifications = [
    { id: 1, title: 'Payment Approved', message: 'Your payment evidence has been verified.', time: '2 hours ago', icon: CreditCard, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', read: false },
    { id: 2, title: 'New Broadcast', message: 'Admin: Holiday Notice - Classes paused.', time: '5 hours ago', icon: Megaphone, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', read: false },
  ];
  const unreadCount = studentNotifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pl-64 transition-colors duration-500">
      <Navbar />
      <div className="p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors">Welcome back, {studentData?.full_name?.split(' ')[0] || 'Student'}! 👋</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">Here is your training progress for today.</p>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition border border-gray-200 dark:border-gray-700 relative">
              <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">{unreadCount}</span>}
            </button>
            <AnimatePresence>
              {showNotifDropdown && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-3 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
                    <button onClick={() => setShowNotifDropdown(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {studentNotifications.map((notif) => (
                      <div key={notif.id} className={`p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition cursor-pointer ${!notif.read ? 'bg-purple-50/30 dark:bg-purple-900/10' : ''}`}>
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.color}`}><notif.icon className="w-5 h-5" /></div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{notif.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2">{notif.time}</p>
                          </div>
                          {!notif.read && <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-purple-600 via-blue-900 to-green-600 p-6 md:p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5" />
                  <h2 className="text-lg font-semibold tracking-wide uppercase">Your Training Countdown</h2>
                </div>

                {timeData.status === 'loading' && (
                  <div className="text-center py-8"><div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div></div>
                )}

                {(timeData.status === 'no_dates' || timeData.status === 'error') && (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <h3 className="text-2xl font-bold mb-2">Schedule Pending</h3>
                    <p className="opacity-90">Your training schedule has not been set by the admin yet.</p>
                  </div>
                )}

                {timeData.status === 'not_started' && (
                  <div className="text-center py-8">
                    <Pause className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <h3 className="text-2xl font-bold mb-2">Training Hasn't Started Yet</h3>
                    <p className="opacity-90">Your training is scheduled to begin on <span className="font-bold">{studentData?.start_date}</span>.</p>
                  </div>
                )}

                {timeData.status === 'completed' && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-300" />
                    <h3 className="text-2xl font-bold mb-2">Training Completed! 🎉</h3>
                    <p className="opacity-90">Congratulations on finishing your program.</p>
                  </div>
                )}

                {timeData.status === 'active' && timeData.timeLeft && (
                  <>
                    {studentData?.paused_days > 0 && (
                      <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                        <Pause className="w-6 h-6 text-yellow-300" />
                        <div>
                          <p className="font-bold text-yellow-100">Approved Leave Active</p>
                          <p className="text-xs text-yellow-200">Your end date has been extended by {studentData.paused_days} days.</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                        <div className="text-3xl md:text-4xl font-black">{timeData.timeLeft.months}</div>
                        <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-80 mt-1">Months</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                        <div className="text-3xl md:text-4xl font-black">{timeData.timeLeft.weeks}</div>
                        <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-80 mt-1">Weeks</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                        <div className="text-3xl md:text-4xl font-black">{timeData.timeLeft.days}</div>
                        <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-80 mt-1">Days</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                        <div className="text-3xl md:text-4xl font-black">{timeData.timeLeft.hours}</div>
                        <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-80 mt-1">Hours</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                        <div className="text-3xl md:text-4xl font-black">{timeData.timeLeft.minutes}</div>
                        <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-80 mt-1">Mins</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                        <div className="text-3xl md:text-4xl font-black text-green-300">{timeData.timeLeft.seconds}</div>
                        <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-80 mt-1">Secs</div>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-sm opacity-90">
                      <span>Training Progress</span>
                      <span className="font-bold">{Math.round(timeData.percentage)}% Completed</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div className="bg-green-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${timeData.percentage}%` }}></div>
                    </div>
                    <p className="text-center text-xs mt-4 opacity-70">Training Ends: {studentData?.end_date} {studentData?.paused_days > 0 ? `(Extended by ${studentData.paused_days} days)` : ''}</p>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700 transition-colors duration-500">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Training Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold transition-colors">Course</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white transition-colors">{studentData?.course || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold transition-colors">Duration</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white transition-colors">{studentData?.duration || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold transition-colors">Mode</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white transition-colors">{studentData?.mode || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold transition-colors">Status</p>
                  <p className={`text-lg font-bold flex items-center gap-1 transition-colors ${studentData?.status === 'approved' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    <CheckCircle className="w-4 h-4" /> {studentData?.status === 'approved' ? 'Active' : 'Pending'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700 transition-colors duration-500">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                <Calendar className="w-5 h-5 text-blue-900 dark:text-blue-400" /> Upcoming Classes
              </h3>
              <div className="space-y-3">
                {[{ day: 'Monday', time: '10:00 AM - 12:00 PM', mode: 'Physical' }, { day: 'Wednesday', time: '10:00 AM - 12:00 PM', mode: 'Physical' }, { day: 'Friday', time: '02:00 PM - 04:00 PM', mode: 'Online' }].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-700 transition cursor-pointer">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white transition-colors">{item.day}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{item.time}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.mode === 'Physical' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>{item.mode}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700 transition-colors duration-500">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                <Megaphone className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Announcements
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {broadcasts.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No announcements yet.</p> : broadcasts.map((b) => (
                  <div key={b.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-l-4 border-l-purple-600">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm text-gray-800 dark:text-white">{b.subject}</p>
                      {b.priority === 'urgent' && <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">URGENT</span>}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{b.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-blue-900 dark:bg-blue-800 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2">
              <Monitor className="w-5 h-5" /> Join Online Class
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* PWA Install Prompt Component */}
      <PWAInstallPrompt />
    </div>
  );
}