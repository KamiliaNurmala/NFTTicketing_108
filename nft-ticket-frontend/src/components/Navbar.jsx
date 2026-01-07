import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WalletButton from './WalletButton';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎫</span>
            <span className="text-xl font-bold text-white">NFT Tickets</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Events
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/my-tickets"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  My Tickets
                </Link>

                <WalletButton />

                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 text-sm">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;