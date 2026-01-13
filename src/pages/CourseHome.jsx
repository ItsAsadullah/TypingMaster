import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseData } from '../utils/courseData';
import { useUser } from '../context/UserContext';
import { FaPlay, FaKeyboard, FaBook, FaCheckCircle, FaLock, FaArrowLeft, FaHome, FaEdit, FaFileAlt, FaVial, FaGamepad, FaRedo, FaEye } from 'react-icons/fa';

const CourseHome = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [duration, setDuration] = useState('unlimited');

  const currentLesson = courseData.find(l => l.id === parseInt(lessonId)) || courseData[0];
  const completedDrills = currentUser?.completedDrills || [];

  // পরবর্তী ড্রিল কোনটি হবে তা বের করা
  const activeDrill = currentLesson.modules.find(m => !completedDrills.includes(m.id)) || currentLesson.modules[currentLesson.modules.length - 1];

  // Hover effect এর জন্য CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .back-to-dashboard-btn:hover {
        background: #f5f5f5 !important;
        border-color: #1e88e5 !important;
        color: #1e88e5 !important;
        transform: translateX(-3px);
      }
      .home-icon-btn:hover {
        background: #1e88e5 !important;
        color: white !important;
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Enter চাপলে পরের পর্বে যাওয়ার লজিক
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        if (activeDrill && !completedDrills.includes(activeDrill.id)) {
          navigate(`/lesson/${lessonId}/${activeDrill.id}`);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeDrill, completedDrills, navigate, lessonId]);

  return (
    <div style={styles.container}>
      
      {/* ব্যাক টু ড্যাশবোর্ড বাটন */}
      <button onClick={() => navigate('/dashboard')} style={styles.backBtn} className="back-to-dashboard-btn">
        <FaArrowLeft style={{marginRight: '8px'}} />
        ড্যাশবোর্ডে ফিরে যান
      </button>
      
      {/* হেডার */}
      <div style={styles.header}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div>
            <h2 style={{margin: 0, color: '#1565c0'}}>{currentLesson.title}</h2>
            <p style={{color: '#666', marginTop: '5px', marginBottom: 0}}>
              Press <span style={styles.keyBadge}>Enter</span> to start the next exercise.
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} style={styles.homeBtn} className="home-icon-btn">
            <FaHome />
          </button>
        </div>
      </div>

      {/* মডিউল লিস্ট */}
      <div style={styles.moduleList}>
        {currentLesson.modules.map((module) => {
          const isCompleted = completedDrills.includes(module.id);
          const isActive = activeDrill.id === module.id && !isCompleted;
          
          return (
            <div 
              key={module.id} 
              style={{
                ...styles.moduleItem,
                background: isActive ? '#e3f2fd' : 'white', // হাইলাইট কালার
                borderLeft: isActive ? '4px solid #1e88e5' : '4px solid transparent'
              }} 
              onClick={() => navigate(`/lesson/${lessonId}/${module.id}`)}
            >
              <div style={styles.moduleIcon}>
                {isCompleted ? (
                  <FaCheckCircle color="#2ecc71" size={22} />
                ) : module.type === 'instruction' ? (
                  <FaBook color="#ffa000" size={20} />
                ) : module.type === 'key_drill' ? (
                  <FaKeyboard color="#1e88e5" size={20} />
                ) : module.type === 'word_drill' ? (
                  <FaKeyboard color="#9c27b0" size={20} />
                ) : module.type === 'paragraph' ? (
                  <FaKeyboard color="#ff6f00" size={20} />
                ) : module.type === 'test' ? (
                  <FaEye color="#d32f2f" size={20} />
                ) : module.type === 'review' ? (
                  <FaRedo color="#43a047" size={20} />
                ) : module.type === 'game' ? (
                  <FaGamepad color="#00acc1" size={20} />
                ) : (
                  <FaPlay color="#757575" size={20} />
                )}
              </div>
              
              <div style={styles.moduleInfo}>
                <h4 style={{margin: 0, fontSize: '15px', color: '#333'}}>
                  {module.id} {module.title}
                </h4>
                <div style={{display: 'flex', gap: '10px', marginTop: '3px'}}>
                   <span style={styles.badge}>{module.type.replace('_', ' ').toUpperCase()}</span>
                   <span style={{fontSize: '11px', color: '#777'}}>{module.duration}</span>
                </div>
              </div>

              <div style={styles.moduleAction}>
                {isCompleted ? (
                   <span style={{fontSize: '12px', color: '#2ecc71', fontWeight: 'bold'}}>Completed</span>
                ) : (
                   isActive && <button style={styles.startBtn}>Start <FaPlay size={10} style={{marginLeft: '5px'}}/></button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.footerSettings}>
        <label style={{fontWeight: 'bold', color: '#555', marginRight: '10px'}}>Lesson Duration:</label>
        <select style={styles.select} value={duration} onChange={(e) => setDuration(e.target.value)}>
          <option value="unlimited">Optimized (Unlimited)</option>
          <option value="5">5 Minutes</option>
        </select>
      </div>

    </div>
  );
};

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', fontFamily: "'Segoe UI', sans-serif", padding: '20px 10px' },
  backBtn: { 
    background: 'transparent', 
    border: '1px solid #ccc', 
    padding: '8px 16px', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center',
    fontSize: '14px',
    color: '#555',
    marginBottom: '15px',
    transition: 'all 0.3s ease',
    fontWeight: '500'
  },
  homeBtn: {
    background: '#f5f5f5',
    border: '1px solid #ddd',
    padding: '10px 14px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#1565c0',
    transition: 'all 0.3s ease'
  },
  header: { background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  keyBadge: { background: '#eee', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', fontWeight: 'bold' },
  moduleList: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  moduleItem: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: '0.2s' },
  moduleIcon: { 
    width: '42px', 
    height: '42px', 
    background: '#f5f7fa', 
    borderRadius: '8px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: '15px',
    border: '1px solid #e8ebed',
    flexShrink: 0
  },
  moduleInfo: { flex: 1 },
  badge: { fontSize: '10px', background: '#eee', color: '#555', padding: '3px 8px', borderRadius: '4px', fontWeight: '500', textTransform: 'uppercase' },
  moduleAction: { marginLeft: '15px' },
  startBtn: { background: '#1e88e5', color: '#fff', border: 'none', padding: '6px 15px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '600' },
  footerSettings: { marginTop: '15px', background: '#fff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ffa000' },
  select: { padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }
};

export default CourseHome;