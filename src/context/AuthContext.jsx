import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { INSTRUCTORS } from '../data/mockData';

const AuthContext = createContext(null);

const EMPLOYEE_ID_REGEX = /^NW\d{7}$/;
const ADMIN_EMPLOYEE_ID = 'NW2000001'; // The pre-seeded admin
const DEFAULT_PASSWORD = 'Welcome@1'; // Default password for pre-seeded demo users

// Pre-seed registered users from mock instructors
const INITIAL_USERS = INSTRUCTORS.map(inst => ({
  fullName: inst.name,
  employeeId: inst.employeeId,
  email: inst.email,
  password: DEFAULT_PASSWORD,
  instructorId: inst.id,
  role: inst.employeeId === ADMIN_EMPLOYEE_ID ? 'admin' : 'instructor',
  status: 'approved', // Pre-seeded users are automatically approved
}));

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('worklog_users');
      const version = localStorage.getItem('worklog_users_version');
      
      // If version doesn't match, the ID format has changed — re-seed
      if (version !== '2') {
        localStorage.setItem('worklog_users_version', '2');
        // If there was stored data, preserve any custom-added users (non pre-seeded ones)
        if (stored) {
          const parsed = JSON.parse(stored);
          const preSeededIds = new Set(['A0000', 'I0001', 'I0002', 'I0003', 'I0004', 'I0005',
            'NW2000001', 'NW2000563', 'NW2000128', 'NW2000347', 'NW2000891', 'NW2000045']);
          const customUsers = parsed.filter(u => !preSeededIds.has(u.employeeId));
          // Backfill password for custom users
          const migratedCustom = customUsers.map(u => u.password ? u : { ...u, password: DEFAULT_PASSWORD });
          return [...INITIAL_USERS, ...migratedCustom];
        }
        return INITIAL_USERS;
      }

      if (stored) {
        const parsed = JSON.parse(stored);
        // Backfill password if missing
        return parsed.map(u => u.password ? u : { ...u, password: DEFAULT_PASSWORD });
      }
      return INITIAL_USERS;
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
    return EMPLOYEE_ID_REGEX.test(employeeId);
  }, []);

  const signUp = useCallback((fullName, employeeId, email, password, requestedRole = 'instructor') => {
    if (!EMPLOYEE_ID_REGEX.test(employeeId)) {
      return { success: false, error: 'Employee ID must match format NW followed by 7 digits (e.g., NW2000563)' };
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
      password,
      instructorId: `inst-${Date.now()}`,
      role: requestedRole,
      status: 'pending', // New signups require approval
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    // Do NOT auto-login, wait for approval
    return { success: true, user: newUser };
  }, [registeredUsers]);

  const login = useCallback((employeeId, password) => {
    if (!validateEmployeeId(employeeId)) {
      return { success: false, error: 'Invalid Employee ID format. Must be NW followed by 7 digits.' };
    }

    const user = registeredUsers.find(u => u.employeeId === employeeId);
    if (!user) {
      return { success: false, error: 'No account found with this Employee ID.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
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

  const promoteToAdmin = useCallback((employeeId) => {
    setRegisteredUsers(prev => prev.map(u =>
      u.employeeId === employeeId ? { ...u, role: 'admin' } : u
    ));
  }, []);

  const demoteToInstructor = useCallback((employeeId) => {
    setRegisteredUsers(prev => prev.map(u =>
      u.employeeId === employeeId ? { ...u, role: 'instructor' } : u
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
    rejectUser,
    promoteToAdmin,
    demoteToInstructor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
