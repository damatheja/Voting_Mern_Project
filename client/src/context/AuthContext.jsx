import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [voter, setVoter]     = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on app start
    const storedVoter = localStorage.getItem('voter');
    const storedAdmin = localStorage.getItem('isAdmin');
    if (storedVoter) setVoter(JSON.parse(storedVoter));
    if (storedAdmin) setIsAdmin(true);
    setLoading(false);
  }, []);

  const loginVoter = (voterData) => {
    setVoter(voterData);
    localStorage.setItem('voter', JSON.stringify(voterData));
  };

  const logoutVoter = () => {
    setVoter(null);
    localStorage.removeItem('voter');
  };

  const loginAdmin = () => {
    setIsAdmin(true);
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminSecret', 'admin@voting123');
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminSecret');
  };

  return (
    <AuthContext.Provider value={{
      voter, isAdmin, loading,
      loginVoter, logoutVoter,
      loginAdmin, logoutAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);