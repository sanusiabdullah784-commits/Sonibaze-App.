import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Send, Loader2, Bot, User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../services/supabaseClient';

export default function AdminMessages() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, selectedStudentId]);

  // 1. Initialize and Fetch Data
  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        await fetchAllMessages();
      }
      setIsLoading(false);
    }
    initialize();

    // 2. Real-time subscription for instant updates
    const subscription = supabase
      .channel('admin-messages-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setAllMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchAllMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setAllMessages(data);
      if (!selectedStudentId) {
        const firstStudent = data.find(m => m.sender_role === 'student');
        if (firstStudent) setSelectedStudentId(firstStudent.sender_id);
      }
    }
  };

  const conversations = React.useMemo(() => {
    const studentMap = new Map();
    allMessages.forEach(msg => {
      if (msg.sender_role === 'student') {
        if (!studentMap.has(msg.sender_id)) {
          studentMap.set(msg.sender_id, {
            id: msg.sender_id,
            name: msg.sender_name || 'Unknown Student',
            lastMessage: msg.message_text,
            time: msg.created_at,
            unread: false
          });
        } else {
          studentMap.set(msg.sender_id, {
            ...studentMap.get(msg.sender_id),
            lastMessage: msg.message_text,
            time: msg.created_at
          });
        }
      }
    });
    return Array.from(studentMap.values()).sort((a, b) => 
      new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  }, [allMessages]);

  const activeMessages = allMessages.filter(
    msg => msg.sender_id === selectedStudentId || (msg.sender_role === 'admin' && msg.recipient_role === 'student' && selectedStudentId)
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedStudentId) return;

    const messageText = newMessage;
    setNewMessage('');
    setIsSending(true);

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: currentUser.id,
          sender_name: 'SoniBaze Admin',
          sender_role: 'admin',
          recipient_role: 'student',
          message_text: messageText
        }
      ]);

    if (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send message.');
    }
    setIsSending(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const selectedStudent = conversations.find(s => s.id === selectedStudentId);

  return (
    // FIXED: Changed 'pl-64' to 'md:pl-64' for mobile responsiveness
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:pl-64 transition-colors duration-500">
      <Navbar />
      <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-8rem)] md:h-[calc(100vh-2rem)]">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 mb-4 transition">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Admin Messages & Support 💬</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Reply to student inquiries in real-time.</p>
        </motion.div>

        {/* Chat Interface */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          // FIXED: Changed to flex-col on mobile, flex-row on desktop. Adjusted height for mobile.
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-250px)] md:h-[calc(100%-120px)]"
        >
          
          {/* LEFT: Conversations List */}
          {/* FIXED: Hidden on mobile when a student is selected, full width on mobile otherwise */}
          <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-900/30 ${selectedStudentId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 text-purple-600 animate-spin" /></div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No messages yet.</div>
              ) : (
                conversations.map((chat) => (
                  <div 
                    key={chat.id}
                    onClick={() => setSelectedStudentId(chat.id)}
                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white dark:hover:bg-gray-700/50 transition border-b border-gray-100 dark:border-gray-700/50 ${selectedStudentId === chat.id ? 'bg-white dark:bg-gray-700/80 border-l-4 border-l-purple-600 md:border-l-4' : ''}`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {chat.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">{chat.name}</p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(chat.time)}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Active Chat Window */}
          {/* FIXED: Hidden on mobile when NO student is selected, full width on mobile when selected */}
          <div className={`flex-1 flex flex-col bg-white dark:bg-gray-800 ${!selectedStudentId ? 'hidden md:flex' : 'flex'}`}>
            {selectedStudent ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/30">
                  {/* Mobile Back Button */}
                  <button onClick={() => setSelectedStudentId(null)} className="md:hidden p-2 -ml-2 mr-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 dark:text-white truncate">{selectedStudent.name}</p>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span> Student
                    </p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800">
                  {activeMessages.map((msg, index) => {
                    const isAdmin = msg.sender_role === 'admin';
                    return (
                      <motion.div 
                        key={msg.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-end gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isAdmin && (
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                          isAdmin 
                            ? 'bg-gradient-to-r from-purple-600 to-green-600 text-white rounded-bl-sm' 
                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-100 dark:border-gray-600 rounded-br-sm'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.message_text}</p>
                          <p className={`text-[10px] mt-1 ${isAdmin ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 py-2">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Reply to ${selectedStudent.name}...`} 
                      className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400 py-2" 
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit" 
                      disabled={!newMessage.trim() || isSending}
                      className="w-10 h-10 bg-gradient-to-r from-purple-600 to-green-600 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Select a Conversation</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">Choose a student from the left panel to view their messages and send a reply.</p>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
}