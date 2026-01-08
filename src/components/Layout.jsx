import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useParams } from 'react-router-dom';
import { FaBookOpen, FaTachometerAlt, FaUserEdit, FaKeyboard, FaGamepad, FaChartBar, FaCog, FaInfoCircle, FaBars, FaTimes } from 'react-icons/fa';
import CourseSidebar from './CourseSidebar'; // নতুন সাইডবার ইম্পোর্ট

const Layout = () => {
  const location = useLocation();
  const params = useParams(); // URL থেকে ID পাওয়ার জন্য (যদিও এখানে সরাসরি কাজ করবে না Layout এ)
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // আমরা চেক করব ইউজার এখন কোর্সের ভেতরে আছে কিনা
  const isCoursePage = location.pathname.includes('/course/');
  
  // URL থেকে লেসন আইডি বের করার লজিক (Simple string split)
  const currentLessonId = isCoursePage ? location.pathname.split('/')[2] : null;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.container}>
      
      {/* লজিক: 
         ১. যদি মোবাইল হয় -> মোবাইল মেনু বাটন দেখাবে।
         ২. যদি পিসি হয় এবং কোর্স পেজ হয় -> CourseSidebar দেখাবে (বাম পাশে)।
         ৩. যদি পিসি হয় এবং ড্যাশবোর্ড হয় -> MainSidebar দেখাবে (বাম/ডান পাশে আপনার পছন্দমত)।
      */}

      {/* বাম পাশের সাইডবার (Course Sidebar or Main Sidebar) */}
      {!isMobile && (
        <aside style={styles.sidebarContainer}>
          {isCoursePage ? (
            <CourseSidebar currentLessonId={currentLessonId} />
          ) : (
            <MainSidebar />
          )}
        </aside>
      )}

      {/* মেইন কন্টেন্ট এরিয়া */}
      <main style={styles.mainContent}>
        {isMobile && (
          <button style={styles.mobileMenuBtn} onClick={() => setSidebarOpen(true)}>
            <FaBars /> মেনু
          </button>
        )}
        <Outlet />
      </main>

      {/* মোবাইল সাইডবার ড্রয়ার */}
      {isMobile && isSidebarOpen && (
        <>
          <div style={styles.overlay} onClick={() => setSidebarOpen(false)}></div>
          <div style={styles.mobileDrawer}>
            <div style={styles.closeBtn} onClick={() => setSidebarOpen(false)}>Close <FaTimes/></div>
            {isCoursePage ? <CourseSidebar currentLessonId={currentLessonId} /> : <MainSidebar />}
          </div>
        </>
      )}

    </div>
  );
};

// সাধারণ মেইন সাইডবার কম্পোনেন্ট
const MainSidebar = () => (
  <div style={styles.mainSidebar}>
    <div style={styles.logoArea}>
      <h3 style={{color: '#1565c0'}}>TechHat Typing</h3>
    </div>
    <nav>
      <ul style={styles.navList}>
        <NavItem to="/dashboard" icon={<FaBookOpen />} label="কোর্সসমূহ" active />
        <NavItem to="/meter" icon={<FaTachometerAlt />} label="টাইপিং মিটার" />
        <NavItem to="/review" icon={<FaUserEdit />} label="রিভিউ" />
        <NavItem to="/games" icon={<FaGamepad />} label="গেমস" />
        <NavItem to="/stats" icon={<FaChartBar />} label="পরিসংখ্যান" />
        <NavItem to="/settings" icon={<FaCog />} label="সেটিংস" />
      </ul>
    </nav>
  </div>
);

const NavItem = ({ to, icon, label, active }) => (
  <li style={{ marginBottom: '5px' }}>
    <Link to={to} style={{ ...styles.link, background: active ? '#e3f2fd' : 'transparent', color: active ? '#1565c0' : '#555' }}>
      <span style={{ marginRight: '10px' }}>{icon}</span> {label}
    </Link>
  </li>
);

const styles = {
  container: { display: 'flex', height: '100vh', background: '#f0f2f5', overflow: 'hidden' },
  sidebarContainer: { height: '100%', zIndex: 10 },
  mainContent: { flex: 1, padding: '20px', overflowY: 'auto', background: '#eef2f6' },
  mainSidebar: { width: '240px', background: '#fff', height: '100%', borderRight: '1px solid #ddd' },
  mobileDrawer: { position: 'fixed', top: 0, left: 0, height: '100%', background: '#fff', zIndex: 1000, boxShadow: '2px 0 5px rgba(0,0,0,0.2)' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 900 },
  mobileMenuBtn: { padding: '8px 15px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '5px', marginBottom: '15px' },
  closeBtn: { padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee' },
  navList: { listStyle: 'none', padding: '10px' },
  link: { display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', borderRadius: '5px', fontSize: '15px' },
  logoArea: { padding: '20px', borderBottom: '1px solid #eee' }
};

export default Layout;