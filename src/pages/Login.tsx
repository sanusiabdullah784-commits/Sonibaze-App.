import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackgroundEffects from '../components/BackgroundEffects';
import AIChat from '../components/AIChat';
import ThemeToggle from '../components/ThemeToggle';
import { supabase } from '../services/supabaseClient';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        // Successfully logged in! Redirect to dashboard.
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Handle specific Supabase errors nicely
      if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before logging in.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ThemeToggle />
      <AIChat />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative overflow-hidden pt-16 transition-colors duration-500">
        <BackgroundEffects />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 dark:border-gray-700 relative z-10 transition-colors duration-500"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-green-600 rounded-2xl shadow-lg mb-4">
              <h1 className="text-4xl font-black text-white">S<span className="mx-0.5">|</span>B</h1>
            </div>
            <h2 className="text-3xl font-bold text-blue-900 dark:text-white transition-colors">SoniBaze</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium transition-colors">Student Management Platform</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com" 
                  className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 pl-12" 
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm transition-colors">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••" 
                  className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 pl-12 pr-12" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700 transition-colors"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white/80 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium transition-colors">Official SoniBaze Contact</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-center text-xs text-gray-600 dark:text-gray-400 mb-6 transition-colors">
            <div className="flex flex-col items-center gap-1">
              <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold">09031301773</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold">Karu Site, Abuja</span>
            </div>
          </div>

          <p className="text-center text-gray-600 dark:text-gray-400 text-sm transition-colors">
            Don't have an account?{' '}
            <span 
              onClick={() => navigate('/register')} 
              className="text-green-600 dark:text-green-400 font-bold cursor-pointer hover:underline"
            >
              Create Account
            </span>
          </p>
        </motion.div>
      </div>
    </>
  );
}