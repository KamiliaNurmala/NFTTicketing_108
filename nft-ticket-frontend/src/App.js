import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// Original Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetail from './pages/EventDetail';
import MyTickets from './pages/MyTickets';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';

// Developer Portal Pages
import DeveloperRegister from './pages/DeveloperRegister';
import DeveloperLogin from './pages/DeveloperLogin';
import DeveloperDashboard from './pages/DeveloperDashboard';
import ApiDemo from './pages/ApiDemo';

// Layout component to conditionally show Navbar
function Layout({ children }) {
  const location = useLocation();
  const hideNavbarPaths = ['/admin', '/admin/dashboard', '/developer/login', '/developer/register', '/developer/dashboard'];
  const shouldHideNavbar = hideNavbarPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-gray-900">
      {!shouldHideNavbar && <Navbar />}
      {children}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Original User Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/my-tickets" element={<MyTickets />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Developer Portal Routes */}
            <Route path="/developer/register" element={<DeveloperRegister />} />
            <Route path="/developer/login" element={<DeveloperLogin />} />
            <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
            <Route path="/api-demo" element={<ApiDemo />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;