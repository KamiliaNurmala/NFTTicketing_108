import { useState } from 'react';
import { ticketAPI } from '../services/api';

function TicketCard({ ticket, onTransferSuccess }) {
  const [showTransfer, setShowTransfer] = useState(false);
  const [toAddress, setToAddress] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState('');

  const handleTransfer = async () => {
    if (!toAddress) {
      setError('Please enter wallet address');
      return;
    }

    setError('');
    setTransferring(true);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const { ethers } = await import('ethers');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Normalize addresses
      const normalizedTo = ethers.getAddress(toAddress.toLowerCase());

      // ⚠️ ADD THIS CHECK - Prevent transfer to self
      if (normalizedTo.toLowerCase() === userAddress.toLowerCase()) {
        throw new Error('Cannot transfer ticket to yourself!');
      }

      // Contract ABI (only need transferFrom function)
      const contractABI = [
        "function transferFrom(address from, address to, uint256 tokenId) external"
      ];

      // Contract address (same as backend)
      const contractAddress = "0xeeB338d1E9B0c8A74c1b5286870b13b70b259DA4";

      // Create contract instance with USER's signer (not backend!)
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      console.log(`🔄 Transferring Token #${ticket.nftTokenId} to ${normalizedTo}...`);

      // User signs and sends the transaction via MetaMask popup!
      const tx = await contract.transferFrom(
        userAddress,           // from (current owner)
        normalizedTo,          // to (destination)
        ticket.nftTokenId      // tokenId
      );

      console.log(`⏳ TX sent: ${tx.hash}`);

      // Wait for confirmation
      await tx.wait();

      console.log('✅ Transfer confirmed!');

      // Update backend database (optional - to sync DB)
      try {
        await ticketAPI.syncTransfer(ticket.id, normalizedTo);
      } catch (e) {
        console.log('DB sync failed, but blockchain transfer succeeded');
      }

      alert(`✅ Ticket transferred successfully!\nTX: ${tx.hash}`);
      setShowTransfer(false);
      if (onTransferSuccess) onTransferSuccess();
      window.location.reload();

    } catch (err) {
      console.error('Transfer error:', err);
      if (err.code === 'ACTION_REJECTED') {
        setError('Transaction cancelled by user');
      } else {
        setError(err.message || 'Transfer failed');
      }
    } finally {
      setTransferring(false);
    }
  };

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Shorten tx hash for display
  const shortenHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'minted':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'used':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="card-hover bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 ticket-shine">
      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 animate-gradient p-4 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">
              {ticket.Event?.title || 'Unknown Event'}
            </h3>
            <p className="text-purple-200 text-sm mt-1">
              NFT Ticket #{ticket.nftTokenId}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
            {ticket.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="p-5">
        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-300">
            <span className="mr-3 text-lg">📅</span>
            <span>{formatDate(ticket.Event?.date)}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <span className="mr-3 text-lg">📍</span>
            <span>{ticket.Event?.venue || 'TBA'}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-600 my-4"></div>

        {/* Blockchain Info */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Token ID:</span>
            <span className="text-gray-300 font-mono">{ticket.nftTokenId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">TX Hash:</span>
            <a
              href={`https://sepolia.etherscan.io/tx/${ticket.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 font-mono"
            >
              {shortenHash(ticket.txHash)}
            </a>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Purchased:</span>
            <span className="text-gray-300">{formatDate(ticket.createdAt)}</span>
          </div>
        </div>

        {/* Add Transfer Button - before the "View on Etherscan" button */}
        {ticket.status === 'minted' && (
          <div className="mt-3">
            {!showTransfer ? (
              <button
                onClick={() => setShowTransfer(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition mb-2"
              >
                🔄 Transfer Ticket
              </button>
            ) : (
              <div className="bg-gray-700 p-3 rounded-lg mb-2">
                <input
                  type="text"
                  placeholder="0x... destination wallet"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm mb-2"
                />
                {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
                <div className="flex space-x-2">
                  <button
                    onClick={handleTransfer}
                    disabled={transferring}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded text-sm"
                  >
                    {transferring ? 'Transferring...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => { setShowTransfer(false); setError(''); }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View on Etherscan */}
        <a
          href={`https://sepolia.etherscan.io/tx/${ticket.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium transition"
        >
          View on Etherscan ↗
        </a>
      </div>
    </div>
  );
}

export default TicketCard;