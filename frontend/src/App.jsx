import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';

import AdminOrderQueuePage from './pages/AdminOrderQueuePage';
import AdminMenuPage from './pages/AdminMenuPage';

const ProtectedRoute = ({ children, adminOnly = false, allowBoth = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center animate-pulse">Loading auth...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/menu" />;
  if (!allowBoth && !adminOnly && isAdmin) return <Navigate to="/admin" />;

  return children;
};

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-900">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/menu" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer */}
          <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowBoth><ProfilePage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<Navigate to="/admin/orders" />} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrderQueuePage /></ProtectedRoute>} />
          <Route path="/admin/menu" element={<ProtectedRoute adminOnly><AdminMenuPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
