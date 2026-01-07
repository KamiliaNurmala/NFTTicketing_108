import { Link } from 'react-router-dom';

function EventCard({ event }) {
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

  return (
    <div className="card-hover bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 ticket-shine">
      {/* Event Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 animate-gradient flex items-center justify-center relative overflow-hidden">
        <span className="text-6xl animate-float">🎤</span>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800/50 to-transparent"></div>
      </div>

      {/* Event Info */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 truncate hover:text-purple-400 transition-colors">
          {event.title}
        </h3>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-300 text-sm">
            <span className="mr-2">📅</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-gray-300 text-sm">
            <span className="mr-2">📍</span>
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center text-gray-300 text-sm">
            <span className="mr-2">🎫</span>
            <span>{event.availableTickets} / {event.totalTickets} tickets left</span>
          </div>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="gradient-text text-lg font-bold">
              {event.price} ETH
            </span>
          </div>
          <Link
            to={`/event/${event.id}`}
            className="btn-glow bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventCard;