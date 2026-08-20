import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, Phone, Mail, Globe, MapPin, ArrowLeft, FileImage, X, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../services/supabaseClient';

export default function Payment() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check if user is logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('image/') && selectedFile.size <= 5 * 1024 * 1024) {
        setFile(selectedFile);
        setUploadSuccess(false);
        setError('');
      } else {
        setError('Please select a valid image file (JPG, PNG) under 5MB.');
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !currentUser) {
      setError('You must be logged in to upload payment evidence.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // 1. Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

      // 2. Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('payment-evidence')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 3. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-evidence')
        .getPublicUrl(fileName);

      // 4. Save the record to the database
      const { error: dbError } = await supabase
        .from('payments')
        .insert([
          {
            student_id: currentUser.id,
            student_email: currentUser.email,
            file_url: publicUrl,
            status: 'pending'
          }
        ]);

      if (dbError) throw dbError;

      // Success!
      setUploadSuccess(true);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload payment evidence.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pl-64 transition-colors duration-500">
      <Navbar />
      
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 mb-4 transition font-medium">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Payment & Verification 💳</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Upload your payment evidence to activate your training account.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Upload Area */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Upload Payment Evidence</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Please make your payment to the official SoniBaze bank account, then upload a clear screenshot or photo of the transaction receipt below.</p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
              </div>
            )}

            {!uploadSuccess ? (
              <form onSubmit={handleSubmit}>
                <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-2xl p-8 text-center hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition cursor-pointer relative group">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="flex flex-col items-center gap-3 pointer-events-none">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{file ? file.name : "Click or drag to upload image"}</p>
                    <p className="text-xs text-gray-400">Supports: JPG, PNG (Max 5MB)</p>
                  </div>
                </div>

                {file && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileImage className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={handleRemoveFile} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full text-red-500 transition"><X className="w-5 h-5" /></button>
                  </motion.div>
                )}

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={!file || isUploading} className={`w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all duration-200 ${!file || isUploading ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-green-600 hover:shadow-lg hover:shadow-purple-500/30'}`}>
                  {isUploading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Uploading to Cloud...</>) : (<><CheckCircle className="w-5 h-5" /> Submit Payment Evidence</>)}
                </motion.button>
              </form>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" /></div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Upload Successful! </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Your payment evidence has been securely saved. Our admin team will verify it within 24 hours.</p>
                <button onClick={() => navigate('/dashboard')} className="btn-primary inline-flex items-center gap-2">Return to Dashboard</button>
              </motion.div>
            )}
          </motion.div>

          {/* RIGHT: Official Contact Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Official Contact</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0"><Phone className="w-5 h-5 text-green-400" /></div>
                  <div><p className="text-xs text-blue-200 uppercase font-semibold tracking-wider">Phone / WhatsApp</p><p className="font-bold text-lg">09031301773</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0"><Mail className="w-5 h-5 text-green-400" /></div>
                  <div><p className="text-xs text-blue-200 uppercase font-semibold tracking-wider">Email Support</p><p className="font-semibold">support@sonibaze.ng</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0"><Globe className="w-5 h-5 text-green-400" /></div>
                  <div><p className="text-xs text-blue-200 uppercase font-semibold tracking-wider">Website</p><p className="font-semibold">www.sonibaze.ng</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0"><MapPin className="w-5 h-5 text-green-400" /></div>
                  <div><p className="text-xs text-blue-200 uppercase font-semibold tracking-wider">Office Address</p><p className="font-semibold text-sm leading-relaxed">Opposite CBN Quarters,<br />Karu Site, Abuja.</p></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}