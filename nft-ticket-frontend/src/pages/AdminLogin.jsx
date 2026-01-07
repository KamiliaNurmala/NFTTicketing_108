import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../services/api';

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await adminAPI.login({ email, password });

            if (response.data.success) {
                // Clear other tokens to prevent conflicts
                localStorage.removeItem('developerToken');
                localStorage.removeItem('token');

                localStorage.setItem('adminToken', response.data.data.token);
                localStorage.setItem('admin', JSON.stringify(response.data.data.admin));
                navigate('/admin/dashboard');
            } else {
                setError(response.data.error?.message || 'Login failed');
            }
        } catch (err) {
            console.error('Admin login error:', err);
            setError(err.response?.data?.error?.message || 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-red-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-orange-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <span className="text-6xl mb-4 block animate-float">🔐</span>
                    <h1 className="text-3xl font-bold">
                        <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Admin Panel</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Login to manage your NFT Ticketing platform</p>
                </div>

                {/* Form Card */}
                <div className="glass rounded-xl p-8 animate-fade-in-up">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Admin Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                                placeholder="admin@nftticket.com"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Logging in...
                                </>
                            ) : (
                                'Login to Admin Panel'
                            )}
                        </button>
                    </form>
                </div>

                {/* Register Link */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        Don't have an admin account?{' '}
                        <Link to="/admin/register" className="text-red-400 hover:text-red-300 font-medium">
                            Register here
                        </Link>
                    </p>
                </div>

                {/* Back link */}
                <div className="mt-4 text-center">
                    <a href="/" className="text-gray-400 hover:text-gray-300 text-sm">
                        ← Back to Homepage
                    </a>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
