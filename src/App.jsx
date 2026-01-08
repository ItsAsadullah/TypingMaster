import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseHome from './pages/CourseHome'; // নতুন পেজ
import Lesson from './pages/Lesson';
import Layout from './components/Layout';
import { useUser } from './context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useUser();
  if (loading) return <div>লোড হচ্ছে...</div>;
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* কোর্স হোম পেজ (যেখানে ৬-৭টা পর্বের লিস্ট থাকবে) */}
        <Route path="/course/:lessonId" element={<ProtectedRoute><CourseHome /></ProtectedRoute>} />

        {/* আসল টাইপিং পেজ (ড্রিল) */}
        <Route path="/lesson/:lessonId/:drillId" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
        
        {/* পুরনো রাউট সাপোর্টের জন্য (যদি সরাসরি কেউ হিট করে) */}
        <Route path="/lesson/:lessonId" element={<Navigate to="/course/1" />} />
      </Route>
    </Routes>
  );
}

export default App;