import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { developerAPI } from '../services/api';
import axios from 'axios';

function DeveloperDashboard() {
    const navigate = useNavigate();
    const [developer, setDeveloper] = useState(null);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    // API Tester state
    const [selectedEndpoint, setSelectedEndpoint] = useState('GET /api/v1/events');
    const [paramEventId, setParamEventId] = useState('');
    const [paramTokenId, setParamTokenId] = useState('');
    const [paramWalletAddress, setParamWalletAddress] = useState('');
    const [paramTxHash, setParamTxHash] = useState('');
    const [paramToAddress, setParamToAddress] = useState('');
    const [apiResponse, setApiResponse] = useState(null);
    const [apiLoading, setApiLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const API_ENDPOINTS = [
        { value: 'GET /api/v1/events', label: 'GET /api/v1/events - List all events', params: [] },
        { value: 'GET /api/v1/events/:id', label: 'GET /api/v1/events/:id - Get event details', params: ['eventId'] },
        { value: 'POST /api/v1/tickets/mint', label: 'POST /api/v1/tickets/mint - Mint NFT ticket', params: ['eventId', 'walletAddress'] },
        { value: 'GET /api/v1/tickets/:tokenId', label: 'GET /api/v1/tickets/:tokenId - Get ticket by token', params: ['tokenId'] },
        { value: 'GET /api/v1/tickets/verify/:tokenId', label: 'GET /api/v1/tickets/verify/:tokenId - Verify ticket', params: ['tokenId'] },
        { value: 'GET /api/v1/blockchain/tx/:txHash', label: 'GET /api/v1/blockchain/tx/:txHash - Check TX status', params: ['txHash'] },
    ];

    const getRequiredParams = () => {
        const endpoint = API_ENDPOINTS.find(e => e.value === selectedEndpoint);
        return endpoint ? endpoint.params : [];
    };

    const sendApiRequest = async () => {
        setApiLoading(true);
        setApiError(null);
        setApiResponse(null);

        try {
            const [method, path] = selectedEndpoint.split(' ');
            let url = `http://localhost:3000${path}`;

            // Replace path parameters
            url = url.replace(':id', paramEventId);
            url = url.replace(':tokenId', paramTokenId);
            url = url.replace(':txHash', paramTxHash);

            const config = {
                method: method.toLowerCase(),
                url,
                headers: {
                    'X-API-Key': developer?.apiKey
                }
            };

            // Add body for POST requests
            if (method === 'POST') {
                if (path.includes('/mint')) {
                    config.data = { eventId: parseInt(paramEventId), walletAddress: paramWalletAddress };
                } else if (path.includes('/transfer')) {
                    config.data = { tokenId: parseInt(paramTokenId), toAddress: paramToAddress };
                }
            }

            const response = await axios(config);
            setApiResponse(response.data);
        } catch (error) {
            setApiError(error.response?.data || { error: error.message });
        } finally {
            setApiLoading(false);
        }
    };

    useEffect(() => {
        const devData = localStorage.getItem('developer');
        const devToken = localStorage.getItem('developerToken');

        if (!devToken || !devData) {
            navigate('/developer/login');
            return;
        }

        setDeveloper(JSON.parse(devData));
        fetchProfile();
    }, [navigate]);

    const fetchProfile = async () => {
        try {
            const [profileRes, usageRes] = await Promise.all([
                developerAPI.getProfile(),
                developerAPI.getUsage()
            ]);

            if (profileRes.data.success) {
                setDeveloper(profileRes.data.data.developer);
                localStorage.setItem('developer', JSON.stringify(profileRes.data.data.developer));
            }
            if (usageRes.data.success) {
                setUsage(usageRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('developerToken');
        localStorage.removeItem('developer');
        navigate('/developer/login');
    };

    const copyApiKey = () => {
        navigator.clipboard.writeText(developer?.apiKey || '');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleRegenerateKey = async () => {
        if (!window.confirm('Are you sure? Your old API key will stop working immediately.')) return;

        setRegenerating(true);
        try {
            const response = await developerAPI.regenerateKey();
            if (response.data.success) {
                const updatedDev = { ...developer, apiKey: response.data.data.apiKey };
                setDeveloper(updatedDev);
                localStorage.setItem('developer', JSON.stringify(updatedDev));
            }
        } catch (error) {
            console.error('Error regenerating key:', error);
            alert('Failed to regenerate API key');
        } finally {
            setRegenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <span className="text-2xl mr-2">👨‍💻</span>
                            <span className="text-white font-bold">Developer Portal</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-300">{developer?.name}</span>
                            <span className={`px-2 py-1 rounded text-xs ${developer?.tier === 'free' ? 'bg-gray-600 text-gray-300' :
                                developer?.tier === 'pro' ? 'bg-blue-600 text-white' :
                                    'bg-purple-600 text-white'
                                }`}>
                                {developer?.tier?.toUpperCase()}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* API Key Card */}
                <div className="bg-gradient-to-r from-blue-900 to-cyan-900 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">🔑 Your API Key</h2>
                    <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-900/50 rounded-lg px-4 py-3 font-mono text-sm text-cyan-300 overflow-x-auto">
                            {developer?.apiKey}
                        </div>
                        <button
                            onClick={copyApiKey}
                            className={`px-4 py-3 rounded-lg font-medium transition ${copySuccess
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                                }`}
                        >
                            {copySuccess ? '✓ Copied!' : 'Copy'}
                        </button>
                        <button
                            onClick={handleRegenerateKey}
                            disabled={regenerating}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium"
                        >
                            {regenerating ? 'Regenerating...' : 'Regenerate'}
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <p className="text-cyan-200/60 text-sm">
                            Use this key in the <code className="bg-gray-900/50 px-2 py-1 rounded">X-API-Key</code> header for all API requests.
                        </p>
                        <a
                            href="/api-demo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center"
                        >
                            🌐 Try API Demo
                        </a>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="text-gray-400 text-sm mb-1">Requests Today</div>
                        <div className="text-3xl font-bold text-white">
                            {usage?.usage?.requestsToday || 0}
                            <span className="text-gray-500 text-lg font-normal">/{usage?.usage?.requestLimit || 100}</span>
                        </div>
                        <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                style={{ width: `${((usage?.usage?.requestsToday || 0) / (usage?.usage?.requestLimit || 100)) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="text-gray-400 text-sm mb-1">Remaining Today</div>
                        <div className="text-3xl font-bold text-green-400">
                            {usage?.usage?.remainingToday || 100}
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="text-gray-400 text-sm mb-1">Your Tier</div>
                        <div className="text-3xl font-bold text-cyan-400 capitalize">
                            {developer?.tier || 'free'}
                        </div>
                    </div>
                </div>

                {/* Example Request */}
                <div className="bg-gray-800 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">📝 Example API Request</h2>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-300">
                            {`curl -X GET http://localhost:3000/api/v1/events \\
  -H "X-API-Key: ${developer?.apiKey || 'YOUR_API_KEY'}"`}
                        </pre>
                    </div>
                </div>

                {/* Available Endpoints */}
                <div className="bg-gray-800 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">📡 Available Endpoints</h2>
                    <div className="space-y-2">
                        {[
                            { method: 'GET', endpoint: '/api/v1/events', desc: 'List all events' },
                            { method: 'GET', endpoint: '/api/v1/events/:id', desc: 'Get event details' },
                            { method: 'POST', endpoint: '/api/v1/tickets/mint', desc: 'Mint NFT ticket' },
                            { method: 'GET', endpoint: '/api/v1/tickets/:tokenId', desc: 'Get ticket by token' },
                            { method: 'GET', endpoint: '/api/v1/tickets/verify/:tokenId', desc: 'Verify ticket on blockchain' },
                            { method: 'POST', endpoint: '/api/v1/tickets/transfer', desc: 'Transfer ticket' },
                            { method: 'GET', endpoint: '/api/v1/blockchain/tx/:txHash', desc: 'Check transaction status' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center space-x-3 py-2 border-b border-gray-700 last:border-0">
                                <span className={`px-2 py-1 rounded text-xs font-mono ${item.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'
                                    } text-white`}>
                                    {item.method}
                                </span>
                                <code className="text-cyan-400 font-mono text-sm">{item.endpoint}</code>
                                <span className="text-gray-400 text-sm">- {item.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* API Tester */}
                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">🧪 API Tester</h2>
                    <p className="text-purple-200/70 text-sm mb-4">Test the Open API endpoints directly from this dashboard.</p>

                    {/* Endpoint Selector */}
                    <div className="mb-4">
                        <label className="block text-purple-200 text-sm font-medium mb-2">Select Endpoint</label>
                        <select
                            value={selectedEndpoint}
                            onChange={(e) => {
                                setSelectedEndpoint(e.target.value);
                                setApiResponse(null);
                                setApiError(null);
                            }}
                            className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-400"
                        >
                            {API_ENDPOINTS.map((ep, i) => (
                                <option key={i} value={ep.value}>{ep.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dynamic Parameter Inputs */}
                    {getRequiredParams().length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {getRequiredParams().includes('eventId') && (
                                <div>
                                    <label className="block text-purple-200 text-sm font-medium mb-2">Event ID</label>
                                    <input
                                        type="text"
                                        value={paramEventId}
                                        onChange={(e) => setParamEventId(e.target.value)}
                                        placeholder="e.g., 1"
                                        className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                            )}
                            {getRequiredParams().includes('tokenId') && (
                                <div>
                                    <label className="block text-purple-200 text-sm font-medium mb-2">Token ID</label>
                                    <input
                                        type="text"
                                        value={paramTokenId}
                                        onChange={(e) => setParamTokenId(e.target.value)}
                                        placeholder="e.g., 1"
                                        className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                            )}
                            {getRequiredParams().includes('walletAddress') && (
                                <div>
                                    <label className="block text-purple-200 text-sm font-medium mb-2">Wallet Address</label>
                                    <input
                                        type="text"
                                        value={paramWalletAddress}
                                        onChange={(e) => setParamWalletAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                            )}
                            {getRequiredParams().includes('toAddress') && (
                                <div>
                                    <label className="block text-purple-200 text-sm font-medium mb-2">To Address</label>
                                    <input
                                        type="text"
                                        value={paramToAddress}
                                        onChange={(e) => setParamToAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                            )}
                            {getRequiredParams().includes('txHash') && (
                                <div className="md:col-span-2">
                                    <label className="block text-purple-200 text-sm font-medium mb-2">Transaction Hash</label>
                                    <input
                                        type="text"
                                        value={paramTxHash}
                                        onChange={(e) => setParamTxHash(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Send Request Button */}
                    <button
                        onClick={sendApiRequest}
                        disabled={apiLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition mb-4"
                    >
                        {apiLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending Request...
                            </span>
                        ) : '🚀 Send Request'}
                    </button>

                    {/* Response Display */}
                    {(apiResponse || apiError) && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-purple-200 text-sm font-medium">Response</label>
                                <span className={`px-2 py-1 rounded text-xs ${apiError ? 'bg-red-600' : 'bg-green-600'} text-white`}>
                                    {apiError ? 'Error' : 'Success'}
                                </span>
                            </div>
                            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
                                <pre className={`text-sm ${apiError ? 'text-red-400' : 'text-green-400'} whitespace-pre-wrap`}>
                                    {JSON.stringify(apiError || apiResponse, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Requests */}
                {usage?.recentRequests?.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">📊 Recent API Calls</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-gray-300 text-sm">Endpoint</th>
                                        <th className="px-4 py-2 text-left text-gray-300 text-sm">Method</th>
                                        <th className="px-4 py-2 text-left text-gray-300 text-sm">Status</th>
                                        <th className="px-4 py-2 text-left text-gray-300 text-sm">Time</th>
                                        <th className="px-4 py-2 text-left text-gray-300 text-sm">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usage.recentRequests.map((req, i) => (
                                        <tr key={i} className="border-t border-gray-700">
                                            <td className="px-4 py-2 text-gray-300 font-mono text-sm">{req.endpoint}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-0.5 rounded text-xs ${req.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'
                                                    } text-white`}>
                                                    {req.method}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`text-sm ${req.statusCode < 400 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {req.statusCode}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-gray-400 text-sm">{req.responseTime}ms</td>
                                            <td className="px-4 py-2 text-gray-400 text-sm">
                                                {new Date(req.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DeveloperDashboard;
