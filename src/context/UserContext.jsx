import { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('techhat_users')) || [];
    const activeUserName = localStorage.getItem('techhat_active_user');

    setUsers(savedUsers);

    if (activeUserName) {
      const foundUser = savedUsers.find(u => u.name === activeUserName);
      if (foundUser) {
        // পুরনো ইউজারদের জন্য ডাটা স্ট্রাকচার ফিক্স (Backward compatibility)
        if (!foundUser.completedDrills) foundUser.completedDrills = [];
        setCurrentUser(foundUser);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('techhat_users', JSON.stringify(users));
  }, [users]);

  const loginUser = (name) => {
    const existingUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    let userToLogin;

    if (existingUser) {
      if (!existingUser.completedDrills) existingUser.completedDrills = [];
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
      setUsers([...users, newUser]);
      userToLogin = newUser;
    }

    setCurrentUser(userToLogin);
    localStorage.setItem('techhat_active_user', userToLogin.name);
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
      progress: { ...currentUser.progress, [drillId]: stats }
    };

    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  return (
    <UserContext.Provider value={{ users, currentUser, loading, loginUser, logout, markDrillComplete }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);