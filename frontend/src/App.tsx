import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './contexts/AppContext';
import { usePerformanceMonitor } from './services/performanceMonitor.jsx';
import Layout from './components/Layout';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Restaurant from './pages/Restaurant';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/UserDashboard';
import StaffDashboard from './pages/StaffDashboard';
import BookRoom from './pages/BookRoom';
import BookingForm from './pages/BookingForm';
import EnhancedBookingForm from './pages/EnhancedBookingForm';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Initialize performance monitoring
  usePerformanceMonitor();

  useEffect(() => {
    // Check for authentication token and user data
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);

    // Check for redirect after login
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      localStorage.removeItem('redirectAfterLogin');
      window.location.href = redirectPath; // Use window.location for full page reload with new auth state
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Get role-based dashboard route
  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'admin':
      case 'manager':
        return '/admin-dashboard';
      case 'staff':
        return '/staff-dashboard';
      case 'user':
      default:
        return '/dashboard';
    }
  };

  // Protected Route Component
  const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
    children,
    allowedRoles = []
  }) => {
    if (!isAuthenticated || !user) {
      return <Navigate to="/auth" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      return <Navigate to={getDashboardRoute(user.role)} replace />;
    }

    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/rooms" element={
          <Layout>
            <Rooms />
          </Layout>
        } />
        <Route path="/restaurant" element={
          <Layout>
            <Restaurant />
          </Layout>
        } />
        <Route path="/gallery" element={
          <Layout>
            <Gallery />
          </Layout>
        } />
        <Route path="/contact" element={
          <Layout>
            <Contact />
          </Layout>
        } />

        {/* Authentication */}
        <Route path="/auth" element={
          !isAuthenticated ? <AuthPage /> : <Navigate to={getDashboardRoute(user?.role || 'user')} replace />
        } />

        {/* Booking Routes - Allow access but require auth for actual booking */}
        <Route path="/booking/:roomId" element={
          <Layout>
            <EnhancedBookingForm isAuthenticated={isAuthenticated} user={user} />
          </Layout>
        } />

        <Route path="/room-booking/:roomId" element={
          <Layout>
            <EnhancedBookingForm isAuthenticated={isAuthenticated} user={user} />
          </Layout>
        } />

        {/* User Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        } />

        {/* Manager Dashboard (redirect to admin dashboard) */}
        <Route path="/manager-dashboard" element={
          <Navigate to="/admin-dashboard" replace />
        } />

        {/* Book Room */}
        <Route path="/book-room" element={
          <ProtectedRoute allowedRoles={['user']}>
            <BookRoom />
          </ProtectedRoute>
        } />

        {/* Staff Dashboard */}
        <Route path="/staff-dashboard" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Dashboard */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Dashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Executive Dashboard */}
        <Route path="/executive-dashboard" element={
          <ProtectedRoute allowedRoles={['ceo']}>
            <Dashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Legacy booking route */}
        <Route path="/booking-form/:roomId" element={
          <Layout>
            <BookingForm />
          </Layout>
        } />

        {/* Legacy Admin Routes */}
        <Route path="/admin" element={
          !isAuthenticated ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Navigate to="/admin-dashboard" replace />
          )
        } />
        <Route path="/admin/dashboard" element={
          isAuthenticated ? (
            <Dashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/admin" replace />
          )
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
};

export default App;