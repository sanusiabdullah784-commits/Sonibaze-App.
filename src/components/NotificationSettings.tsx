import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Smartphone, CheckCircle } from 'lucide-react';
import { 
  requestNotificationPermission, 
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestNotification
} from '../services/pushNotificationService';

export default function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    const hasPermission = await requestNotificationPermission();
    
    if (hasPermission) {
      await subscribeToPushNotifications();
      setNotificationsEnabled(true);
    }
    
    setIsLoading(false);
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    await unsubscribeFromPushNotifications();
    setNotificationsEnabled(false);
    setIsLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-green-600 rounded-xl flex items-center justify-center">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Push Notifications</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Stay updated with important announcements</p>
        </div>
      </div>

      <div className="space-y-4">
        {notificationsEnabled ? (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Notifications Enabled</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-300 mb-3">
              You will receive push notifications for important updates, announcements, and reminders.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={sendTestNotification}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Send Test
              </button>
              <button 
                onClick={handleDisableNotifications}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
              >
                <BellOff className="w-4 h-4" />
                {isLoading ? 'Disabling...' : 'Disable'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <BellOff className="w-5 h-5" />
              <span className="font-semibold">Notifications Disabled</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Enable push notifications to receive important updates about your courses, announcements, and reminders.
            </p>
            <button 
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-green-600 hover:shadow-lg text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Smartphone className="w-5 h-5" />
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}