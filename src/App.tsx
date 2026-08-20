import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Payment from './pages/Payment';
import Courses from './pages/Courses';
import Schedule from './pages/Schedule';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Messages from './pages/Messages';
import Students from './pages/Students';
import AdminPayments from './pages/AdminPayments';
import Settings from './pages/Settings';
import Broadcast from './pages/Broadcast';
import StudentMessages from './pages/StudentMessages'; // <-- Added Student Messages import!

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Student Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/payments" element={<Payment />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<StudentMessages />} /> {/* <-- Added Student Messages route! */}
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/broadcast" element={<Broadcast />} />
        <Route path="/admin/messages" element={<Messages />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;