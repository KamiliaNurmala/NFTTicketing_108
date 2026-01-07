// Di WalletButton.jsx, GANTI seluruh komponen dengan ini:

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '../context/AuthContext';

function WalletButton() {
  const { user, connectWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletMismatch, setWalletMismatch] = useState(false);
  const [currentMetaMaskWallet, setCurrentMetaMaskWallet] = useState('');

  // Check if MetaMask wallet matches user's saved wallet
  useEffect(() => {
    const checkWalletMatch = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const currentWallet = accounts[0];
          setCurrentMetaMaskWallet(currentWallet);
          
          if (user?.walletAddress) {
            const savedWallet = user.walletAddress.toLowerCase();
            if (currentWallet.toLowerCase() !== savedWallet) {
              setWalletMismatch(true);
            } else {
              setWalletMismatch(false);
            }
          }
        } else {
          setCurrentMetaMaskWallet('');
        }
      } catch (err) {
        console.log('Could not check wallet:', err.message);
      }
    };
    checkWalletMatch();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkWalletMatch);
      return () => window.ethereum.removeListener('accountsChanged', checkWalletMatch);
    }
  }, [user?.walletAddress]);

  const handleConnect = async () => {
    setError('');
    setLoading(true);
  
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed! Please install MetaMask.');
      }
  
      console.log('🦊 Requesting wallet connection...');
  
      // Force account picker to show
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
  
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
  
      console.log('📍 Got accounts:', accounts);
  
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }
  
      const address = accounts[0];
      const checksumAddress = ethers.getAddress(address);
      console.log('✅ Checksum address:', checksumAddress);
  
      const result = await connectWallet(checksumAddress);
  
      if (!result.success) {
        throw new Error(result.message || 'Failed to connect wallet');
      }
  
      setWalletMismatch(false);
      console.log('✅ Wallet connected successfully!');
  
    } catch (err) {
      console.error('❌ Wallet connection error:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const shortenAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // If wallet already connected
  if (user?.walletAddress) {
    return (
      <div className="relative">
        <button
          onClick={handleConnect}
          disabled={loading}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition cursor-pointer ${
            walletMismatch 
              ? 'bg-red-900 hover:bg-red-800 border border-red-500' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
          title={walletMismatch ? "Wallet mismatch! Click to reconnect" : "Click to change wallet"}
        >
          <div className={`w-2 h-2 rounded-full ${
            loading ? 'bg-yellow-500 animate-pulse' 
            : walletMismatch ? 'bg-red-500 animate-pulse' 
            : 'bg-green-500'
          }`}></div>
          <span className="text-gray-300 text-sm font-mono">
            {loading ? 'Switching...' : shortenAddress(user.walletAddress)}
          </span>
          {walletMismatch && <span className="text-red-400 text-xs">⚠️</span>}
        </button>
        {walletMismatch && (
          <div className="absolute top-full right-0 mt-2 z-50 w-64">
            <div className="bg-red-900 border border-red-500 text-red-200 text-xs p-3 rounded-lg shadow-lg">
              <p className="font-bold mb-1">⚠️ Wrong Wallet Connected!</p>
              <p className="mb-2">MetaMask is connected to a different wallet:</p>
              <p className="font-mono text-[10px] bg-red-950 p-1 rounded break-all">
                {currentMetaMaskWallet}
              </p>
              <p className="mt-2 text-red-300">Click the button above to connect your correct wallet.</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute top-full left-0 mt-2 z-50">
            <p className="bg-red-900/90 text-red-200 text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
              ⚠️ {error}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Show connect button
  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={loading}
        className="btn-glow bg-orange-500 hover:bg-orange-600 disabled:bg-orange-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <span>🦊</span>
            <span>Connect Wallet</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

export default WalletButton;