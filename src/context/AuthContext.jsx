import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { INSTRUCTORS } from '../data/mockData';

const AuthContext = createContext(null);

const EMPLOYEE_ID_REGEX = /^I\d{4}$/;
const ADMIN_ID = 'A0000';

// Pre-seed registered users from mock instructors
const INITIAL_USERS = INSTRUCTORS.map(inst => ({
  fullName: inst.name,
  employeeId: inst.employeeId,
  email: inst.email,
  instructorId: inst.id,
  role: inst.employeeId === ADMIN_ID ? 'admin' : 'instructor',
  status: 'approved', // Pre-seeded users are automatically approved
}));

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('worklog_users');
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem('worklog_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const isAuthenticated = !!currentUser;

  const validateEmployeeId = useCallback((employeeId) => {
    return EMPLOYEE_ID_REGEX.test(employeeId) || employeeId === ADMIN_ID;
  }, []);

  const signUp = useCallback((fullName, employeeId, email) => {
    if (!EMPLOYEE_ID_REGEX.test(employeeId)) {
      return { success: false, error: 'Instructor ID must match format I followed by 4 digits (e.g., I0001)' };
    }

    const existing = registeredUsers.find(u => u.employeeId === employeeId);
    if (existing) {
      return { success: false, error: 'This Employee ID is already registered.' };
    }

    const emailExists = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return { success: false, error: 'This email is already associated with another account.' };
    }

    const newUser = {
      fullName,
      employeeId,
      email,
      instructorId: `inst-${Date.now()}`,
      role: 'instructor',
      status: 'pending', // New signups require approval
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    // Do NOT auto-login, wait for approval
    return { success: true, user: newUser };
  }, [registeredUsers]);

  const login = useCallback((employeeId) => {
    if (!validateEmployeeId(employeeId)) {
      return { success: false, error: 'Invalid Employee ID format.' };
    }

    const user = registeredUsers.find(u => u.employeeId === employeeId);
    if (!user) {
      return { success: false, error: 'No account found with this Employee ID.' };
    }

    if (user.status === 'pending') {
      return { success: false, error: 'Your account is pending admin approval. Please wait for access.' };
    }

    if (user.status === 'rejected') {
      return { success: false, error: 'Your access request has been denied.' };
    }

    setCurrentUser(user);
    return { success: true, user };
  }, [registeredUsers, validateEmployeeId]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const approveUser = useCallback((employeeId) => {
    setRegisteredUsers(prev => prev.map(u => 
      u.employeeId === employeeId ? { ...u, status: 'approved' } : u
    ));
  }, []);

  const rejectUser = useCallback((employeeId) => {
    setRegisteredUsers(prev => prev.map(u => 
      u.employeeId === employeeId ? { ...u, status: 'rejected' } : u
    ));
  }, []);

  const value = {
    currentUser,
    isAuthenticated,
    registeredUsers,
    validateEmployeeId,
    signUp,
    login,
    logout,
    approveUser,
    rejectUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
