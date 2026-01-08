import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaKeyboard } from 'react-icons/fa';

const Login = () => {
  const [name, setName] = useState('');
  const { users, loginUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = (selectedName) => {
    const userName = selectedName || name;
    if (!userName.trim()) return alert("দয়া করে আপনার নাম লিখুন");
    
    loginUser(userName);
    navigate('/dashboard'); // লগইনের পর ড্যাশবোর্ডে নিয়ে যাবে
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        {/* Header Section */}
        <div style={styles.header}>
          <FaKeyboard size={50} color="#fff" />
          <h1 style={{color: '#fff', margin: '10px 0'}}>TechHat Typing Master</h1>
        </div>

        <div style={styles.body}>
          <h2 style={{color: '#1e88e5'}}>স্বাগতম! (Welcome)</h2>
          <p style={{color: '#666', marginBottom: '20px'}}>
            নতুন ইউজার হলে নাম লিখুন এবং Enter দিন। পুরাতন ইউজার হলে লিস্ট থেকে নাম সিলেক্ট করুন।
          </p>

          {/* New User Entry */}
          <div style={styles.inputGroup}>
            <FaUser style={styles.icon} />
            <input 
              type="text" 
              placeholder="আপনার নাম লিখুন..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <button onClick={() => handleLogin()} style={styles.enterBtn}>
            প্রবেশ করুন (Enter)
          </button>

          {/* Existing Users List */}
          {users.length > 0 && (
            <div style={styles.userListContainer}>
              <h4 style={{borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
                পুরাতন স্টুডেন্ট লিস্ট:
              </h4>
              <ul style={styles.userList}>
                {users.map(u => (
                  <li 
                    key={u.id} 
                    onClick={() => handleLogin(u.name)}
                    style={styles.userItem}
                  >
                    <span style={{fontWeight: 'bold'}}>👤 {u.name}</span>
                    <span style={{fontSize: '12px', color: '#888'}}>
                      লেসন: {u.currentLesson}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Inline Styles
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1e88e5 0%, #bbdefb 100%)',
    fontFamily: 'Segoe UI, sans-serif'
  },
  loginCard: {
    background: 'white',
    width: '90%',
    maxWidth: '500px',
    borderRadius: '15px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
    overflow: 'hidden'
  },
  header: {
    background: '#1565c0',
    padding: '30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  body: {
    padding: '40px',
    textAlign: 'center'
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    background: '#f5f5f5',
    padding: '10px 15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #ddd'
  },
  icon: {
    color: '#888',
    marginRight: '10px'
  },
  input: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '16px',
    color: '#333'
  },
  enterBtn: {
    width: '100%',
    padding: '12px',
    background: '#1e88e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: '0.3s',
    fontWeight: 'bold'
  },
  userListContainer: {
    marginTop: '30px',
    textAlign: 'left'
  },
  userList: {
    listStyle: 'none',
    padding: 0,
    maxHeight: '150px',
    overflowY: 'auto',
    marginTop: '10px'
  },
  userItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    transition: '0.2s'
  }
};

export default Login;
