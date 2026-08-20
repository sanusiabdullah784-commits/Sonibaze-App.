import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Analytics() {
  const navigate = useNavigate();

  // Mock data for the bar chart
  const monthlyRevenue = [
    { month: 'Jan', value: 40 },
    { month: 'Feb', value: 65 },
    { month: 'Mar', value: 45 },
    { month: 'Apr', value: 80 },
    { month: 'May', value: 55 },
    { month: 'Jun', value: 95 },
    { month: 'Jul', value: 70 },
  ];

  // Mock data for course popularity
  const courseStats = [
    { name: 'Computer Networking', students: 120, color: 'bg-purple-500' },
    { name: 'UI/UX Design', students: 85, color: 'bg-blue-500' },
    { name: 'Data Science', students: 60, color: 'bg-green-500' },
    { name: 'Cybersecurity', students: 45, color: 'bg-yellow-500' },
  ];

  return (
    // FIXED: Changed 'pl-64' to 'md:pl-64' for mobile responsiveness
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:pl-64 transition-colors duration-500">
      <Navbar />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 mb-4 transition">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Analytics & Graphs 📊</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Visual overview of platform performance.</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {[
            { title: 'Monthly Growth', value: '+24%', icon: TrendingUp, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
            { title: 'New Students', value: '142', icon: Users, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
            { title: 'Revenue This Month', value: '₦2.4M', icon: DollarSign, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
          ].map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Bar Chart: Monthly Revenue */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" /> Monthly Revenue (Millions ₦)
            </h3>
            
            <div className="flex items-end justify-between h-64 gap-2 pt-4 border-b border-gray-200 dark:border-gray-700">
              {monthlyRevenue.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="relative w-full flex justify-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${item.value * 2}px` }}
                      transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-purple-600 to-green-500 rounded-t-lg group-hover:opacity-80 transition cursor-pointer relative"
                    >
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition">
                        {item.value}
                      </span>
                    </motion.div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.month}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Horizontal Bar Chart: Course Popularity */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-6">Course Popularity</h3>
            
            <div className="space-y-6">
              {courseStats.map((course, index) => {
                const maxStudents = 150;
                const percentage = (course.students / maxStudents) * 100;
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{course.name}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">{course.students} students</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.2, duration: 1 }}
                        className={`h-full rounded-full ${course.color}`}
                      ></motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}