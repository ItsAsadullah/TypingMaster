import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaKeyboard, FaUserPlus, FaClock, FaHeart } from 'react-icons/fa';

const Login = () => {
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [name, setName] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const { users, loginUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = () => {
    let userName = '';
    
    if (showNewUserForm) {
      userName = name.trim();
      if (!userName) return alert("দয়া করে আপনার নাম লিখুন");
    } else {
      if (!selectedUser) return alert("একজন ইউজার সিলেক্ট করুন");
      userName = selectedUser.name;
    }
    
    loginUser(userName);
    
    // ইউজার last যেখানে ছিল সেখানে পাঠাবো
    const user = users.find(u => u.name.toLowerCase() === userName.toLowerCase());
    if (user && user.completedDrills && user.completedDrills.length > 0) {
      navigate('/course/1');
    } else {
      navigate('/dashboard');
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const formatLastActive = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'এইমাত্র';
    if (diffMins < 60) return `${diffMins} মিনিট আগে`;
    if (diffHours < 24) return `${diffHours} ঘন্টা আগে`;
    return `${diffDays} দিন আগে`;
  };

  return (
    <div style={styles.container}>
      {/* Background decoration */}
      <div style={styles.bgCircle1}></div>
      <div style={styles.bgCircle2}></div>
      
      <div style={styles.loginCard}>
        {/* Logo & Title */}
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <svg width="80" height="80" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="techhatLoginGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#e91e63', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#9c27b0', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" 
                    fill="url(#techhatLoginGrad)" fontSize="120" fontWeight="bold" fontFamily="Arial">
                টেক
              </text>
            </svg>
          </div>
          <h1 style={styles.title}>
            <span style={{color: '#1976d2'}}>TechHat </span>
            <span style={{color: '#0d47a1'}}>Typing Master</span>
          </h1>
          <p style={styles.subtitle}>
            <FaHeart style={{color: '#e91e63', marginRight: '5px', fontSize: '12px'}} />
            টেকহাটের পক্ষ থেকে শুভেচ্ছা
          </p>
        </div>

        {/* Content Area */}
        <div style={styles.content}>
          {!showNewUserForm ? (
            // Existing Users List
            <div style={styles.existingUserSection}>
              <label style={styles.label}>আপনার নাম সিলেক্ট করুন</label>
              <div style={styles.userListWrapper}>
                {users.length === 0 ? (
                  <div style={styles.emptyState}>
                    <FaUser size={40} color="#ccc" />
                    <p style={{color: '#999', marginTop: '10px', marginBottom: '5px'}}>
                      কোনো ইউজার পাওয়া যায়নি
                    </p>
                    <p style={{fontSize: '13px', color: '#666'}}>
                      আপনি যদি নতুন ইউজার হন তাহলে <strong>New User</strong> বাটনে ক্লিক করুন।
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={styles.userGrid}>
                      {users.map(user => (
                        <div 
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          style={{
                            ...styles.userCard,
                            ...(selectedUser?.id === user.id ? styles.selectedUserCard : {})
                          }}
                        >
                          <div style={styles.userAvatar}>
                            <FaUser size={24} />
                          </div>
                          <div style={styles.userInfo}>
                            <div style={styles.userName}>{user.name}</div>
                            <div style={styles.userStats}>
                              <span>✓ {user.completedDrills?.length || 0} drills</span>
                              <span style={{marginLeft: '10px'}}>
                                <FaClock size={10} style={{marginRight: '3px'}} />
                                {formatLastActive(user.lastActive)}
                              </span>
                            </div>
                          </div>
                          {selectedUser?.id === user.id && (
                            <div style={styles.checkMark}>✓</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p style={{fontSize: '13px', color: '#666', textAlign: 'center', marginTop: '15px'}}>
                      আপনি যদি নতুন ইউজার হন তাহলে <strong>New User</strong> বাটনে ক্লিক করুন।
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            // New User Registration Form
            <div style={styles.newUserSection}>
              <label style={styles.label}>আপনার নাম লিখুন</label>
              <div style={styles.inputWrapper}>
                <input 
                  type="text" 
                  placeholder="User" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  autoFocus
                />
              </div>
              <div style={styles.infoBox}>
                <p style={{margin: 0, fontSize: '13px', color: '#666'}}>
                  আপনার নাম ব্যবহার করে একটি নতুন অ্যাকাউন্ট তৈরি হবে এবং আপনার সমস্ত progress সংরক্ষিত থাকবে।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div style={styles.footer}>
          {!showNewUserForm ? (
            <>
              <button 
                onClick={() => setShowNewUserForm(true)}
                style={styles.newUserBtn}
              >
                <FaUserPlus style={{marginRight: '8px'}} />
                New User
              </button>
              <button 
                onClick={handleLogin}
                style={styles.loginBtn}
                disabled={!selectedUser}
              >
                Login
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => {
                  setShowNewUserForm(false);
                  setName('');
                }}
                style={styles.backBtn}
              >
                ← Back
              </button>
              <button 
                onClick={handleLogin}
                style={styles.loginBtn}
                disabled={!name.trim()}
              >
                Enter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  bgCircle1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    top: '-100px',
    left: '-100px'
  },
  bgCircle2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    bottom: '-150px',
    right: '-150px'
  },
  loginCard: {
    background: 'white',
    width: '90%',
    maxWidth: '480px',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1
  },
  header: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '40px 20px 30px',
    textAlign: 'center',
    position: 'relative'
  },
  logoCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  },
  title: {
    margin: '0 0 10px',
    fontSize: '28px',
    fontWeight: 'bold',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#555',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    padding: '30px',
    minHeight: '280px'
  },
  existingUserSection: {
    animation: 'fadeIn 0.3s'
  },
  newUserSection: {
    animation: 'fadeIn 0.3s'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '12px',
    textAlign: 'center'
  },
  userListWrapper: {
    maxHeight: '280px',
    overflowY: 'auto',
    paddingRight: '5px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#999'
  },
  userGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: 'white',
    position: 'relative'
  },
  selectedUserCard: {
    border: '2px solid #1976d2',
    background: '#e3f2fd',
    boxShadow: '0 4px 12px rgba(25,118,210,0.2)'
  },
  userAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    marginRight: '15px',
    flexShrink: 0
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '5px'
  },
  userStats: {
    fontSize: '12px',
    color: '#888',
    display: 'flex',
    alignItems: 'center'
  },
  checkMark: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#1976d2',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border 0.3s',
    boxSizing: 'border-box'
  },
  infoBox: {
    background: '#e3f2fd',
    padding: '12px',
    borderRadius: '8px',
    borderLeft: '4px solid #1976d2'
  },
  footer: {
    padding: '20px 30px 30px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  newUserBtn: {
    flex: 1,
    padding: '14px',
    border: '2px solid #1976d2',
    borderRadius: '8px',
    background: 'white',
    color: '#1976d2',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backBtn: {
    flex: 1,
    padding: '14px',
    border: '2px solid #757575',
    borderRadius: '8px',
    background: 'white',
    color: '#757575',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.3s'
  },
  loginBtn: {
    flex: 1,
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
  }
};

export default Login;
