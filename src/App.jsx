import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import RouteGuard from './components/auth/RouteGuard';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import DailyLog from './pages/instructor/DailyLog';
import AdminDashboard from './pages/admin/AdminDashboard';
import CategoryManager from './pages/admin/CategoryManager';
import TimeSlotSettings from './pages/admin/TimeSlotSettings';
import AccessRequests from './pages/admin/AccessRequests';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected Routes */}
            <Route path="/instructor" element={<RouteGuard requireRole="instructor"><Layout /></RouteGuard>}>
              <Route index element={<InstructorDashboard />} />
              <Route path="log" element={<DailyLog />} />
            </Route>

            <Route path="/admin" element={<RouteGuard requireRole="admin"><Layout /></RouteGuard>}>
              <Route index element={<AdminDashboard />} />
              <Route path="requests" element={<AccessRequests />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="settings" element={<TimeSlotSettings />} />
            </Route>

            {/* Default redirect to a guarded index */}
            <Route path="/" element={<RouteGuard><Navigate to="/instructor" replace /></RouteGuard>} />
            <Route path="*" element={<RouteGuard><Navigate to="/instructor" replace /></RouteGuard>} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
