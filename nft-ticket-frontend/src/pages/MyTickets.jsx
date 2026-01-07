import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TicketCard from '../components/TicketCard';

function MyTickets() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user's tickets
  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getMyTickets();

      if (response.data.success) {
        setTickets(response.data.tickets);
      } else {
        setError('Failed to load tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center mb-2">
            <span className="text-4xl mr-3 animate-float">🎫</span>
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">My Tickets</span>
            </h1>
          </div>
          <p className="text-gray-400 mt-2">
            Your NFT tickets stored on the blockchain
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg">{error}</p>
            <button
              onClick={fetchTickets}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tickets.length === 0 && (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🎭</span>
            <p className="text-gray-400 text-lg">You don't have any tickets yet.</p>
            <p className="text-gray-500 text-sm mt-2 mb-6">
              Purchase tickets from events to see them here!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Browse Events
            </button>
          </div>
        )}

        {/* Tickets Grid */}
        {!loading && !error && tickets.length > 0 && (
          <>
            <div className="mb-4 text-gray-400">
              Total: {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyTickets;
