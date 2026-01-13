import { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initial load from localStorage
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('techhat_users')) || [];
    const activeUserName = localStorage.getItem('techhat_active_user');

    console.log('🔄 Loading from localStorage...');
    console.log('👥 Total users:', savedUsers.length);
    console.log('👤 Active user:', activeUserName);

    setUsers(savedUsers);

    if (activeUserName) {
      const foundUser = savedUsers.find(u => u.name === activeUserName);
      if (foundUser) {
        // পুরনো ইউজারদের জন্য ডাটা স্ট্রাকচার ফিক্স (Backward compatibility)
        if (!foundUser.completedDrills) foundUser.completedDrills = [];
        if (!foundUser.progress) foundUser.progress = {};
        setCurrentUser(foundUser);
        console.log('✅ User restored:', foundUser.name, 'Completed drills:', foundUser.completedDrills.length);
      } else {
        console.log('⚠️ Active user not found in saved users');
      }
    }
    setLoading(false);
    setInitialized(true);
  }, []);

  // Save to localStorage only after initialization
  useEffect(() => {
    if (initialized && users.length >= 0) {
      localStorage.setItem('techhat_users', JSON.stringify(users));
      console.log('💾 Saved to localStorage:', users.length, 'users');
    }
  }, [users, initialized]);

  const loginUser = (name) => {
    const existingUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    let userToLogin;

    if (existingUser) {
      if (!existingUser.completedDrills) existingUser.completedDrills = [];
      if (!existingUser.progress) existingUser.progress = {};
      userToLogin = existingUser;
    } else {
      const newUser = {
        id: Date.now(),
        name: name,
        currentLesson: 1,
        completedDrills: [], // নির্দিষ্ট ড্রিল আইডি রাখার জন্য (যেমন: "1.1", "1.2")
        progress: {}, 
        lastActive: new Date().toISOString()
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('techhat_users', JSON.stringify(updatedUsers));
      userToLogin = newUser;
    }

    setCurrentUser(userToLogin);
    localStorage.setItem('techhat_active_user', userToLogin.name);
    console.log('✅ User logged in:', userToLogin.name, 'Completed drills:', userToLogin.completedDrills);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('techhat_active_user');
  };

  // ড্রিল শেষ করার ফাংশন
  const markDrillComplete = (lessonId, drillId, stats) => {
    if (!currentUser) return;
    
    // ডুপ্লিকেট চেক (যদি আগে থেকেই কমপ্লিট থাকে)
    const newCompletedDrills = currentUser.completedDrills.includes(drillId) 
      ? currentUser.completedDrills 
      : [...currentUser.completedDrills, drillId];

    const updatedUser = {
      ...currentUser,
      completedDrills: newCompletedDrills,
      progress: { ...currentUser.progress, [drillId]: stats },
      lastActive: new Date().toISOString()
    };

    setCurrentUser(updatedUser);
    
    // Users array update করি এবং তাৎক্ষণিকভাবে localStorage-এ save করি
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('techhat_users', JSON.stringify(updatedUsers));
    localStorage.setItem('techhat_active_user', updatedUser.name);
    
    console.log('✅ Drill completed:', drillId, 'Total completed:', newCompletedDrills.length);
    console.log('📊 Stats:', stats);
    console.log('💾 Saved to localStorage');
  };

  return (
    <UserContext.Provider value={{ users, currentUser, loading, loginUser, logout, markDrillComplete }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);