import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, ticketAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch event details on page load
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await eventAPI.getById(id);
        
        if (response.data.success) {
          setEvent(response.data.event);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getById(id);
      
      if (response.data.success) {
        setEvent(response.data.event);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setError('');
    setSuccess('');

    // Check if logged in
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if wallet connected
    if (!user?.walletAddress) {
      setError('Please connect your wallet first (click the orange button in navbar)');
      return;
    }

    // Check tickets available
    if (event.availableTickets <= 0) {
      setError('No tickets available');
      return;
    }

    setPurchasing(true);

    try {
      const response = await ticketAPI.purchase(event.id);

      if (response.data.success) {
        setSuccess(`🎉 Ticket purchased! Token ID: #${response.data.ticket.nftTokenId}`);
        // Update available tickets locally
        setEvent(prev => ({
          ...prev,
          availableTickets: prev.availableTickets - 1
        }));
      } else {
        setError(response.data.message || 'Purchase failed');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.response?.data?.message || 'Failed to purchase ticket');
    } finally {
      setPurchasing(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Error state (event not found)
  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😞</span>
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white mb-6 flex items-center transition"
        >
          ← Back to Events
        </button>

        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          {/* Event Banner */}
          <div className="h-64 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <span className="text-8xl">🎤</span>
          </div>

          {/* Event Content */}
          <div className="p-8">
            {/* Title & Status */}
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold text-white">{event.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                event.availableTickets > 0 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-red-500/20 text-red-400 border border-red-500/50'
              }`}>
                {event.availableTickets > 0 ? 'Available' : 'Sold Out'}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg mb-8">
              {event.description}
            </p>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center text-gray-400 mb-1">
                  <span className="mr-2">📅</span>
                  <span className="text-sm">Date & Time</span>
                </div>
                <p className="text-white font-medium">{formatDate(event.date)}</p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center text-gray-400 mb-1">
                  <span className="mr-2">📍</span>
                  <span className="text-sm">Venue</span>
                </div>
                <p className="text-white font-medium">{event.venue}</p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center text-gray-400 mb-1">
                  <span className="mr-2">🎫</span>
                  <span className="text-sm">Tickets Available</span>
                </div>
                <p className="text-white font-medium">
                  {event.availableTickets} / {event.totalTickets}
                </p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center text-gray-400 mb-1">
                  <span className="mr-2">💰</span>
                  <span className="text-sm">Price</span>
                </div>
                <p className="text-purple-400 font-bold text-xl">{event.price} ETH</p>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-4">
                {success}
                <button
                  onClick={() => navigate('/my-tickets')}
                  className="ml-4 underline hover:no-underline"
                >
                  View My Tickets →
                </button>
              </div>
            )}

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={purchasing || event.availableTickets <= 0}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg text-lg transition flex items-center justify-center"
            >
              {purchasing ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Minting NFT Ticket...
                </>
              ) : event.availableTickets <= 0 ? (
                'Sold Out'
              ) : (
                `Buy Ticket for ${event.price} ETH`
              )}
            </button>

            {/* Info Note */}
            <p className="text-gray-500 text-sm text-center mt-4">
              🔗 Your ticket will be minted as an NFT on Sepolia blockchain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;