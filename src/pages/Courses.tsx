import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Courses() {
  const navigate = useNavigate();

  const courses = [
    {
      title: 'Computer Networking',
      instructor: 'Engr. Musa Ibrahim',
      progress: 25,
      nextClass: 'Monday, 10:00 AM',
      totalModules: 24,
      completedModules: 6
    },
    {
      title: 'Staff Training: Digital Literacy',
      instructor: 'Mrs. Amina Yusuf',
      progress: 10,
      nextClass: 'Wednesday, 2:00 PM',
      totalModules: 12,
      completedModules: 1
    }
  ];

  return (
    // FIXED: Changed 'pl-64' to 'md:pl-64' for mobile responsiveness
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 md:pl-64 transition-colors duration-500">
      <Navbar />
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 mb-4 transition">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">My Courses 📚</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your learning progress and upcoming modules.</p>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700 hover:shadow-2xl transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> Active
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{course.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Instructor: {course.instructor}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Course Progress</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-purple-600 to-green-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{course.completedModules} of {course.totalModules} modules completed</p>
              </div>

              {/* Next Class Info */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">Next Class</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{course.nextClass}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}