import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { FaChevronRight, FaSignOutAlt, FaUser, FaBook, FaTrophy, FaFire, FaClock, FaStar, FaChartLine, FaRocket, FaLock } from 'react-icons/fa';
import techHatLogo from '../assets/images/Logo.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('আপনি কি লগআউট করতে চান?')) {
      logout();
      navigate('/');
    }
  };

  const completedDrills = currentUser?.completedDrills?.length || 0;
  const progressPercentage = Math.min((completedDrills / 12) * 100, 100);

  return (
    <div style={styles.pageWrapper}>
      {/* Top Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.navLeft}>
            <img src={techHatLogo} alt="TechHat Logo" style={styles.logoImage} />
            <span style={styles.brandName}>TechHat Typing Master</span>
          </div>
          <div style={styles.navRight}>
            <div style={styles.userProfile}>
              <div style={styles.userAvatar}>
                <FaUser size={14} />
              </div>
              <span style={styles.userName}>{currentUser?.name}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutButton}>
              <FaSignOutAlt size={16} />
            </button>
          </div>
        </div>
      </nav>

      <div style={styles.mainContent}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.heroContent}>
            <div style={styles.welcomeText}>
              <div style={styles.greetingBadge}>
                <img src={techHatLogo} alt="TechHat" style={styles.heroLogo} />
                <span style={styles.greetingText}>TechHat এর পক্ষ থেকে</span>
              </div>
              <h1 style={styles.heroTitle}>
                স্বাগতম, {currentUser?.name}! 👋
              </h1>
              <p style={styles.heroSubtitle}>
                আমরা আনন্দিত যে আপনি আপনার টাইপিং দক্ষতা উন্নত করতে এসেছেন। চলুন আজ আপনার টাইপিং দক্ষতা আরও এগিয়ে নিয়ে যাই এবং একজন দক্ষ টাইপিস্ট হয়ে উঠি! 🚀
              </p>
            </div>
            <button onClick={() => navigate('/course/1')} style={styles.heroCTA}>
              <FaRocket style={{marginRight: '8px'}} />
              {completedDrills > 0 ? 'চালিয়ে যান' : 'শুরু করুন'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCardModern}>
            <div style={styles.statCardHeader}>
              <div style={{...styles.statIconCircle, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <FaTrophy size={20} />
              </div>
              <span style={styles.statCardTitle}>সম্পন্ন ড্রিল</span>
            </div>
            <div style={styles.statCardValue}>{completedDrills}</div>
            <div style={styles.statCardFooter}>
              <span style={styles.statCardLabel}>মোট ১২টির মধ্যে</span>
            </div>
          </div>

          <div style={styles.statCardModern}>
            <div style={styles.statCardHeader}>
              <div style={{...styles.statIconCircle, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <FaBook size={20} />
              </div>
              <span style={styles.statCardTitle}>বর্তমান লেসন</span>
            </div>
            <div style={styles.statCardValue}>লেসন {currentUser?.currentLesson || 1}</div>
            <div style={styles.statCardFooter}>
              <span style={styles.statCardLabel}>১২টি লেসন</span>
            </div>
          </div>

          <div style={styles.statCardModern}>
            <div style={styles.statCardHeader}>
              <div style={{...styles.statIconCircle, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
                <FaFire size={20} />
              </div>
              <span style={styles.statCardTitle}>আপনার স্ট্যাটাস</span>
            </div>
            <div style={styles.statCardValue}>
              {completedDrills > 5 ? '🔥' : '💪'}
            </div>
            <div style={styles.statCardFooter}>
              <span style={styles.statCardLabel}>
                {completedDrills > 5 ? 'দুর্দান্ত!' : 'চালিয়ে যান!'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <h3 style={styles.progressTitle}>আপনার অগ্রগতি</h3>
            <span style={styles.progressPercent}>{Math.round(progressPercentage)}%</span>
          </div>
          <div style={styles.progressBarContainer}>
            <div style={{...styles.progressBarFill, width: `${progressPercentage}%`}}></div>
          </div>
          <p style={styles.progressText}>
            {completedDrills === 0 && 'শুরু করুন এবং আপনার প্রথম লেসন সম্পন্ন করুন! 🎯'}
            {completedDrills > 0 && completedDrills < 6 && 'দারুণ শুরু! চালিয়ে যান! 💪'}
            {completedDrills >= 6 && completedDrills < 12 && 'অসাধারণ! আপনি প্রায় শেষের দিকে! 🚀'}
            {completedDrills === 12 && 'অভিনন্দন! আপনি কোর্সটি সম্পন্ন করেছেন! 🎉'}
          </p>
        </div>

        {/* Courses Section */}
        <div style={styles.coursesSection}>
          <div style={styles.sectionHeaderModern}>
            <h2 style={styles.sectionTitleModern}>উপলব্ধ কোর্স</h2>
            <p style={styles.sectionSubtitle}>আপনার দক্ষতা অনুযায়ী কোর্স বেছে নিন</p>
          </div>

          <div style={styles.coursesGrid}>
            {/* Course 1: Fast Touch Typing */}
            <div style={styles.courseCardModern}>
              <div style={styles.courseBadgeContainer}>
                <div style={{...styles.courseNumberBadge, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                  1
                </div>
                <span style={styles.courseStatus}>✅ সক্রিয়</span>
              </div>
              
              <div style={styles.courseContent}>
                <h3 style={styles.courseNameModern}>ফাস্ট টাচ টাইপিং কোর্স</h3>
                <p style={styles.courseNameEnglish}>Fast Touch Typing Course</p>
                <p style={styles.courseDescription}>
                  কীবোর্ডের অক্ষরের অবস্থান এবং বিরাম চিহ্নগুলো মুখস্থ করুন এবং দ্রুত টাইপ করতে শিখুন。
                </p>

                <div style={styles.courseFeatures}>
                  <div style={styles.featureItem}>
                    <FaClock style={styles.featureIcon} />
                    <span>৩-৫ ঘণ্টা</span>
                  </div>
                  <div style={styles.featureItem}>
                    <FaBook style={styles.featureIcon} />
                    <span>১২টি লেসন</span>
                  </div>
                  <div style={styles.featureItem}>
                    <FaStar style={styles.featureIcon} />
                    <span>বিগিনার ফ্রেন্ডলি</span>
                  </div>
                </div>

                <div style={styles.courseProgress}>
                  <div style={styles.courseProgressBar}>
                    <div style={{...styles.courseProgressFill, width: `${progressPercentage}%`}}></div>
                  </div>
                  <span style={styles.courseProgressText}>
                    {completedDrills}/12 ড্রিল সম্পন্ন
                  </span>
                </div>
              </div>

              <button onClick={() => navigate('/course/1')} style={styles.courseButtonPrimary}>
                {completedDrills > 0 ? (
                  <>
                    <FaChartLine style={{marginRight: '8px'}} />
                    চালিয়ে যান
                  </>
                ) : (
                  <>
                    <FaRocket style={{marginRight: '8px'}} />
                    শুরু করুন
                  </>
                )}
              </button>
            </div>

            {/* Course 2: Speed Building */}
            <div style={{...styles.courseCardModern, opacity: 0.7}}>
              <div style={styles.courseBadgeContainer}>
                <div style={{...styles.courseNumberBadge, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                  2
                </div>
                <span style={{...styles.courseStatus, background: '#ffc107', color: '#000'}}>
                  🔒 শীঘ্রই
                </span>
              </div>
              
              <div style={styles.courseContent}>
                <h3 style={styles.courseNameModern}>স্পিড বিল্ডিং কোর্স</h3>
                <p style={styles.courseNameEnglish}>Speed Building Course</p>
                <p style={styles.courseDescription}>
                  আপনার টাইপিং স্পিড বাড়ান এবং প্রফেশনাল লেভেলে পৌঁছান。
                </p>

                <div style={styles.courseFeatures}>
                  <div style={styles.featureItem}>
                    <FaClock style={styles.featureIcon} />
                    <span>২-৪ ঘণ্টা</span>
                  </div>
                  <div style={styles.featureItem}>
                    <FaBook style={styles.featureIcon} />
                    <span>৮টি লেসন</span>
                  </div>
                  <div style={styles.featureItem}>
                    <FaStar style={styles.featureIcon} />
                    <span>ইন্টারমিডিয়েট</span>
                  </div>
                </div>

                <div style={styles.courseProgress}>
                  <div style={styles.courseProgressBar}>
                    <div style={{...styles.courseProgressFill, width: '0%'}}></div>
                  </div>
                  <span style={styles.courseProgressText}>লক করা আছে</span>
                </div>
              </div>

              <button style={styles.courseButtonDisabled} disabled>
                <FaLock style={{marginRight: '8px'}} />
                শীঘ্রই আসছে
              </button>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div style={styles.tipsSection}>
          <h3 style={styles.tipsTitle}>💡 দ্রুত টিপস</h3>
          <div style={styles.tipsGrid}>
            <div style={styles.tipCard}>
              <span style={styles.tipEmoji}>✋</span>
              <p style={styles.tipText}>আঙ্গুল সঠিক অবস্থানে রাখুন</p>
            </div>
            <div style={styles.tipCard}>
              <span style={styles.tipEmoji}>👀</span>
              <p style={styles.tipText}>স্ক্রিনের দিকে তাকিয়ে টাইপ করুন</p>
            </div>
            <div style={styles.tipCard}>
              <span style={styles.tipEmoji}>⏰</span>
              <p style={styles.tipText}>প্রতিদিন অনুশীলন করুন</p>
            </div>
            <div style={styles.tipCard}>
              <span style={styles.tipEmoji}>🎯</span>
              <p style={styles.tipText}>স্পিডের আগে নির্ভুলতা</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <img src={techHatLogo} alt="TechHat Logo" style={styles.footerLogo} />
          <p style={styles.footerText}>© 2026 TechHat Typing Master • Made with ❤️ in Bangladesh</p>
          <p style={styles.footerSubtext}>আপনার সফলতাই আমাদের লক্ষ্য</p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: '#f5f7fa',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  navbar: {
    background: 'white',
    borderBottom: '1px solid #e1e8ed',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  navContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoImage: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    objectFit: 'contain'
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 16px',
    background: '#f5f7fa',
    borderRadius: '20px'
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  logoutButton: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#fee',
    color: '#dc3545',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  heroSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '48px 40px',
    marginBottom: '32px',
    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
  },
  heroContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '24px'
  },
  welcomeText: {
    flex: 1,
    minWidth: '300px'
  },
  greetingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '10px 20px',
    borderRadius: '30px',
    marginBottom: '16px',
    backdropFilter: 'blur(10px)'
  },
  heroLogo: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    objectFit: 'contain'
  },
  greetingText: {
    fontSize: '14px',
    color: 'white',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  heroTitle: {
    margin: 0,
    fontSize: '36px',
    color: 'white',
    fontWeight: '700',
    marginBottom: '12px'
  },
  heroSubtitle: {
    margin: 0,
    fontSize: '16px',
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '400',
    lineHeight: '1.6',
    maxWidth: '600px'
  },
  heroCTA: {
    padding: '16px 32px',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  statCardModern: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease'
  },
  statCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  statIconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  statCardTitle: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '600'
  },
  statCardValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '8px'
  },
  statCardFooter: {
    borderTop: '1px solid #f0f0f0',
    paddingTop: '12px',
    marginTop: '12px'
  },
  statCardLabel: {
    fontSize: '13px',
    color: '#999'
  },
  progressSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  progressTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#333'
  },
  progressPercent: {
    fontSize: '24px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  progressBarContainer: {
    width: '100%',
    height: '12px',
    background: '#f0f0f0',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '12px'
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '6px',
    transition: 'width 0.5s ease'
  },
  progressText: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    textAlign: 'center'
  },
  coursesSection: {
    marginBottom: '32px'
  },
  sectionHeaderModern: {
    marginBottom: '24px'
  },
  sectionTitleModern: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '8px'
  },
  sectionSubtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#666'
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '24px'
  },
  courseCardModern: {
    background: 'white',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    border: '2px solid transparent'
  },
  courseBadgeContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  courseNumberBadge: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    fontWeight: '700'
  },
  courseStatus: {
    padding: '6px 12px',
    background: '#4caf50',
    color: 'white',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600'
  },
  courseContent: {
    marginBottom: '24px'
  },
  courseNameModern: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '4px'
  },
  courseNameEnglish: {
    margin: 0,
    fontSize: '14px',
    color: '#999',
    marginBottom: '16px'
  },
  courseDescription: {
    fontSize: '15px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  courseFeatures: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#666',
    padding: '8px 12px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  featureIcon: {
    color: '#667eea'
  },
  courseProgress: {
    marginTop: '16px'
  },
  courseProgressBar: {
    width: '100%',
    height: '8px',
    background: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  courseProgressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '4px',
    transition: 'width 0.5s ease'
  },
  courseProgressText: {
    fontSize: '13px',
    color: '#999'
  },
  courseButtonPrimary: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  courseButtonDisabled: {
    width: '100%',
    padding: '16px',
    background: '#e0e0e0',
    color: '#999',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tipsSection: {
    background: 'white',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  tipsTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '20px'
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  tipCard: {
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '12px',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  },
  tipEmoji: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '12px'
  },
  tipText: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.4'
  },
  footer: {
    background: 'white',
    borderTop: '1px solid #e1e8ed',
    padding: '32px 24px',
    textAlign: 'center'
  },
  footerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  footerLogo: {
    width: '50px',
    height: '50px',
    marginBottom: '8px',
    borderRadius: '12px',
    objectFit: 'contain'
  },
  footerText: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  footerSubtext: {
    margin: 0,
    fontSize: '13px',
    color: '#999',
    fontStyle: 'italic'
  }
};

export default Dashboard;

