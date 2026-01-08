import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  
  // ডিফল্টভাবে প্রথম কোর্সটি খোলা থাকবে
  const [activeCourse, setActiveCourse] = useState('fast-touch');

  const toggleCourse = (courseId) => {
    setActiveCourse(courseId);
  };

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.topHeader}>
        <h2 style={{fontWeight: '400', color: '#333'}}>কোর্স সিলেক্ট করুন (Choose Course)</h2>
        <select style={styles.dropdown}>
          <option>English</option>
          <option>Bengali (Coming Soon)</option>
        </select>
      </div>

      {/* ==================== 1. Fast Touch Typing Course ==================== */}
      <div style={styles.courseContainer}>
        {activeCourse === 'fast-touch' ? (
          <div style={styles.courseCard}>
            <div style={styles.cardHeader} onClick={() => toggleCourse('fast-touch')}>
              <h3>ফাস্ট টাচ টাইপিং কোর্স (Fast Touch Typing)</h3>
              <FaChevronUp />
            </div>
            
            <div style={styles.cardBody}>
              <p style={styles.description}>
                এই কোর্সে আপনি কীবোর্ডের অক্ষরের অবস্থান এবং বিরাম চিহ্নগুলো মুখস্থ করবেন।
                কোর্সটি শেষ করার পর আপনি কীবোর্ডের দিকে না তাকিয়েই ১০ আঙ্গুল দিয়ে টাইপ করতে পারবেন।
                <br/><br/>
                <span style={{fontSize: '0.9em', opacity: 0.8}}>
                (In this course, you will learn keyboard positions by heart. After completing, you can type with 10 fingers without looking.)
                </span>
              </p>
              
              <div style={styles.statsRow}>
                <div style={styles.statItem}><strong>সময়কাল:</strong> ৩:১০ - ৫:২০ ঘণ্টা</div>
                <div style={styles.statItem}><strong>লেসন:</strong> ১২টি লেসন</div>
                <div style={styles.statItem}>
                  <strong>অগ্রগতি:</strong> {currentUser?.currentLesson > 1 ? `${currentUser.currentLesson - 1} সম্পন্ন` : 'শুরু হয়নি'}
                </div>
              </div>

              <button onClick={() => navigate('/lesson/1')} style={styles.startBtn}>
                {currentUser?.currentLesson > 1 ? 'চালিয়ে যান (Continue)' : 'শুরু করুন (Start Now)'}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.collapsedHeader} onClick={() => toggleCourse('fast-touch')}>
            <span>ফাস্ট টাচ টাইপিং কোর্স (Fast Touch Typing)</span>
            <FaChevronDown />
          </div>
        )}
      </div>

      {/* ==================== 2. Speed Building Course ==================== */}
      <div style={styles.courseContainer}>
        {activeCourse === 'speed' ? (
          <div style={styles.courseCard}>
            <div style={styles.cardHeader} onClick={() => toggleCourse('speed')}>
              <h3>স্পিড বিল্ডিং কোর্স (Speed Building Course)</h3>
              <FaChevronUp />
            </div>
            
            <div style={styles.cardBody}>
              <p style={styles.description}>
                এই কোর্সটি আপনার টাইপিং স্পিড এবং নির্ভুলতা বাড়ানোর জন্য ডিজাইন করা হয়েছে। 
                এখানে আপনি কঠিন শব্দ এবং লম্বা প্যারাগ্রাফ টাইপ প্র্যাকটিস করবেন।
              </p>
              
              <div style={styles.statsRow}>
                <div style={styles.statItem}><strong>সময়কাল:</strong> ২:০০ - ৩:০০ ঘণ্টা</div>
                <div style={styles.statItem}><strong>লেসন:</strong> ৬টি লেসন</div>
                <div style={styles.statItem}><strong>অগ্রগতি:</strong> শুরু হয়নি</div>
              </div>

              <button style={styles.startBtn} onClick={() => alert("এই কোর্সটি পরে যুক্ত করা হবে!")}>
                শুরু করুন (Start Now)
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.collapsedHeader} onClick={() => toggleCourse('speed')}>
            <span>স্পিড বিল্ডিং কোর্স (Speed Building Course)</span>
            <FaChevronDown />
          </div>
        )}
      </div>
      
      {/* ==================== 3. Extra Courses ==================== */}
      <div style={styles.courseContainer}>
        {activeCourse === 'extra' ? (
          <div style={styles.courseCard}>
            <div style={styles.cardHeader} onClick={() => toggleCourse('extra')}>
              <h3>অতিরিক্ত কোর্স (Extra Courses)</h3>
              <FaChevronUp />
            </div>
            
            <div style={styles.cardBody}>
              <p style={styles.description}>
                নাম্বার প্যাড, বিশেষ চিহ্ন (Special Keys) এবং ১০-কি টাইপিং শেখার জন্য এই কোর্সটি করুন।
              </p>
              
              <div style={styles.statsRow}>
                <div style={styles.statItem}><strong>সময়কাল:</strong> ১:০০ ঘণ্টা</div>
                <div style={styles.statItem}><strong>লেসন:</strong> ৪টি লেসন</div>
                <div style={styles.statItem}><strong>অগ্রগতি:</strong> শুরু হয়নি</div>
              </div>

              <button style={styles.startBtn} onClick={() => alert("শীঘ্রই আসছে!")}>
                শুরু করুন (Start Now)
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.collapsedHeader} onClick={() => toggleCourse('extra')}>
            <span>অতিরিক্ত কোর্স (Extra Courses)</span>
            <FaChevronDown />
          </div>
        )}
      </div>

    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: "'Segoe UI', 'Hind Siliguri', sans-serif"
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #ccc',
    paddingBottom: '10px'
  },
  dropdown: { padding: '5px 10px' },
  courseContainer: {
    marginBottom: '10px'
  },
  courseCard: {
    background: 'linear-gradient(to bottom, #1976d2 0%, #1565c0 100%)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    color: 'white',
    animation: 'fadeIn 0.3s ease-in'
  },
  cardHeader: {
    background: '#0d47a1',
    padding: '15px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardBody: {
    padding: '25px',
    background: 'linear-gradient(to bottom, #42a5f5 0%, #1e88e5 100%)',
    position: 'relative'
  },
  collapsedHeader: {
    background: '#1976d2',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'background 0.2s'
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '20px',
    maxWidth: '85%'
  },
  statsRow: { fontSize: '14px', marginBottom: '20px' },
  statItem: { marginBottom: '5px' },
  startBtn: {
    position: 'absolute',
    right: '25px',
    bottom: '25px',
    padding: '10px 20px',
    background: '#0d47a1',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  }
};

export default Dashboard;

