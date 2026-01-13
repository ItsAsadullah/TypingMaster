import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseHome from './pages/CourseHome';
import Lesson from './pages/Lesson';
import Layout from './components/Layout';
import { useUser } from './context/UserContext';

// প্রোটেক্টেড রাউট কম্পোনেন্ট (লগইন ছাড়া পেজ এক্সেস আটকাবে)
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useUser();
  
  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>লোড হচ্ছে...</div>;
  
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      {/* ডিফল্ট রাউট: লগইন পেজে নিয়ে যাবে */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      
      {/* লেআউট এরিয়া (ড্যাশবোর্ড, কোর্স, লেসন) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* কোর্স হোম পেজ */}
        <Route path="/course/:lessonId" element={<ProtectedRoute><CourseHome /></ProtectedRoute>} />

        {/* লেসন/ড্রিল পেজ */}
        <Route path="/lesson/:lessonId/:drillId" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
        
        {/* পুরনো লিংক ফিক্স (রিডাইরেক্ট) */}
        <Route path="/lesson/:lessonId" element={<Navigate to="/course/1" />} />
      </Route>
    </Routes>
  );
}

export default App;

