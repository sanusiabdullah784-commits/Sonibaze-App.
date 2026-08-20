import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, Clock, Monitor, CreditCard, ArrowLeft, Loader2, Phone, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    course: '',
    duration: '6 Months',
    mode: 'Physical',
    payment: 'Full Payment'
  });

  const courses = [
    'Computer Networking', 'Staff Training', 'Software Development', 
    'Mobile App Development', 'Cybersecurity', 'Web Development', 
    'Cloud Computing', 'Data Analytics', 'Data Science', 
    'AI Automation', 'AI Engineer/Builder', 'Machine Learning (ML)', 
    'Computer Training', 'Project Management', 'Digital Marketing', 
    'UI/UX Design', 'Video Editing'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.fullName } }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: dbError } = await supabase
          .from('students')
          .insert([
            {
              id: authData.user.id,
              full_name: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              course: formData.course,
              duration: formData.duration,
              mode: formData.mode,
              payment_option: formData.payment,
              status: 'pending'
            }
          ]);

        if (dbError) throw dbError;
        
        alert('Account created successfully! Please check your email to confirm, then login.');
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-2xl border border-white/50 dark:border-gray-700 relative z-10 transition-colors duration-500">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-white transition-colors">Create Your Account</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">Join SoniBaze Digital today</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Row 1: Full Name & Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm transition-colors">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input name="fullName" value={formData.fullName} onChange={handleChange} type="text" required placeholder="John Doe" className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 pl-12" />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm transition-colors">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input name="phone" value={formData.phone} onChange={handleChange} type="tel" required placeholder="08012345678" className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 pl-12" />
              </div>
            </div>
          </div>

          {/* Row 2: Email & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input name="email" value={formData.email} onChange={handleChange} type="email" required placeholder="you@example.com" className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 pl-12" />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm transition-colors">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input name="password" value={formData.password} onChange={handleChange} type="password" required placeholder="Create a strong password" className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 pl-12" />
              </div>
            </div>
          </div>

          {/* Row 3: Course Selection Dropdown */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm transition-colors">Select Course</label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select name="course" value={formData.course} onChange={handleChange} required className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-12 appearance-none cursor-pointer">
                <option value="" disabled>Choose your training program...</option>
                {courses.map((course, index) => (
                  <option key={index} value={course}>{course}</option>
                ))}
              </select>
              {/* Custom Dropdown Arrow */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Row 4: Duration, Mode, Payment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm transition-colors">Duration</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select name="duration" value={formData.duration} onChange={handleChange} className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-12 appearance-none cursor-pointer">
                  <option>3 Months</option>
                  <option>6 Months</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm transition-colors">Class Mode</label>
              <div className="relative">
                <Monitor className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select name="mode" value={formData.mode} onChange={handleChange} className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-12 appearance-none cursor-pointer">
                  <option>Physical</option>
                  <option>Online</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm transition-colors">Payment</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select name="payment" value={formData.payment} onChange={handleChange} className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white pl-12 appearance-none cursor-pointer">
                  <option>Full Payment</option>
                  <option>Installment</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</> : 'Create Account & Proceed'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}