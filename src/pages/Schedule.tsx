import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Monitor, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Schedule() {
  const navigate = useNavigate();

  const weeklySchedule = [
    { day: 'Monday', time: '10:00 AM - 12:00 PM', course: 'Computer Networking', mode: 'Physical', location: 'Main Hall, Karu Site' },
    { day: 'Wednesday', time: '10:00 AM - 12:00 PM', course: 'Computer Networking', mode: 'Physical', location: 'Main Hall, Karu Site' },
    { day: 'Friday', time: '02:00 PM - 04:00 PM', course: 'Staff Training', mode: 'Online', location: 'Google Meet (Link provided)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 pl-64">
      <Navbar />
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-4 transition">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Class Schedule 📅</h1>
          <p className="text-gray-500 mt-1">Your weekly training timetable.</p>
        </motion.div>

        {/* Schedule List */}
        <div className="space-y-4">
          {weeklySchedule.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-2xl transition"
            >
              {/* Day & Time */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex flex-col items-center justify-center text-purple-700">
                  <span className="text-xs font-bold uppercase">{item.day.substring(0, 3)}</span>
                  <span className="text-xl font-black">{item.day.substring(0, 2)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{item.course}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4" /> {item.time}
                  </div>
                </div>
              </div>

              {/* Mode & Location */}
              <div className="flex items-center gap-4 md:justify-end">
                <div className="text-right hidden md:block">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Location</p>
                  <p className="text-sm font-medium text-gray-700 flex items-center justify-end gap-1">
                    {item.mode === 'Physical' ? <MapPin className="w-4 h-4 text-green-600" /> : <Monitor className="w-4 h-4 text-blue-600" />}
                    {item.location}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  item.mode === 'Physical' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {item.mode}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}