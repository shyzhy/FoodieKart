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

      <main className="flex-grow flex flex-col">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/menu" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer */}
          <Route path="/menu" element={<ProtectedRoute><div className="container mx-auto px-4 py-8"><MenuPage /></div></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><div className="container mx-auto px-4 py-8"><CartPage /></div></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><div className="container mx-auto px-4 py-8"><OrderHistoryPage /></div></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowBoth><div className="container mx-auto px-4 py-8"><ProfilePage /></div></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<Navigate to="/admin/orders" />} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><div className="container mx-auto px-4 py-8"><AdminOrderQueuePage /></div></ProtectedRoute>} />
          <Route path="/admin/menu" element={<ProtectedRoute adminOnly><div className="container mx-auto px-4 py-8"><AdminMenuPage /></div></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
