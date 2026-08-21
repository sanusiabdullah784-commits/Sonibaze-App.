import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Calendar, CreditCard, User, LogOut, Bell, 
  BarChart3, Users, MessageSquare, Settings, Megaphone, X, CheckCircle, AlertTriangle,
  Menu, Download, Smartphone
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // PWA Install States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Listen for the browser's install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // Android/Chrome: Trigger the native install prompt
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else {
      // iOS/Safari: Show manual instructions
      setShowIOSModal(true);
    }
  };

  const isAdmin = location.pathname.startsWith('/admin');

  const studentMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Courses', icon: BookOpen, path: '/courses' },
    { name: 'Schedule', icon: Calendar, path: '/schedule' },
    { name: 'Payments', icon: CreditCard, path: '/payments' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const adminMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { name: 'Students', icon: Users, path: '/admin/students' },
    { name: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { name: 'Broadcast', icon: Megaphone, path: '/admin/broadcast' },
    { name: 'Messages', icon: MessageSquare, path: '/admin/messages' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const menuItems = isAdmin ? adminMenu : studentMenu;
  const portalName = isAdmin ? 'Admin Console' : 'Student Portal';

  const notificationsList = [
    { id: 1, title: 'System Update', message: 'Platform successfully updated to v2.0.', time: '10 mins ago', icon: CheckCircle, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', read: false },
    { id: 2, title: 'New Activity', message: 'A new student just registered for UI/UX Design.', time: '1 hour ago', icon: Users, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', read: false },
    { id: 3, title: 'Security Alert', message: 'New login detected from Abuja, Nigeria.', time: '5 hours ago', icon: AlertTriangle, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400', read: true },
  ];

  return (
    <>
      <ThemeToggle />

      {/* MOBILE HAMBURGER BUTTON */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* iOS INSTALL INSTRUCTIONS MODAL */}
      <AnimatePresence>
        {showIOSModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowIOSModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden p-6 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Install on iPhone</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                To install <strong>SONIBAZE DIGITAL</strong> on your home screen:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-left text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <p>1. Tap the <strong>Share</strong> button <span className="text-blue-500">️</span> at the bottom of Safari.</p>
                <p>2. Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                <p>3. Tap <strong>"Add"</strong> in the top right corner.</p>
              </div>
              <button onClick={() => setShowIOSModal(false)} className="w-full btn-primary">Got it!</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATION MODAL */}
      <AnimatePresence>
        {showNotifModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowNotifModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" /> Notifications
                </h3>
                <button onClick={() => setShowNotifModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto p-2">
                {notificationsList.map((notif) => (
                  <div key={notif.id} className={`p-4 rounded-xl mb-2 flex gap-3 transition cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!notif.read ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                      <notif.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800 dark:text-white">{notif.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-2">{notif.time}</p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>}
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button className="w-full py-2.5 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition">
                  Mark All as Read
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THE SIDEBAR */}
      <motion.div 
        initial={false}
        animate={{ 
          x: isMobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -300 : 0),
          opacity: 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-full w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col p-6 z-50 transition-colors duration-500
          md:translate-x-0 md:z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="flex items-center gap-3 mb-10 mt-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <h1 className="text-xl font-black text-white">S|B</h1>
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-900 dark:text-white transition-colors">SoniBaze</h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">{portalName}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-green-600 text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400'}`} />
                <span className="font-semibold text-sm">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-3 mt-auto">
          {/* INSTALL APP BUTTON */}
          {!deferredPrompt && !showIOSModal && (
            <button 
              onClick={handleInstallClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-sm">Install App</span>
            </button>
          )}

          <button 
            onClick={() => {
              setShowNotifModal(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 transition"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-sm">Notifications</span>
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold text-sm">Log Out</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}