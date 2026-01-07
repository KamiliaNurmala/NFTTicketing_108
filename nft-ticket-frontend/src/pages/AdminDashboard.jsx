import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

function AdminDashboard() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [events, setEvents] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [activeTab, setActiveTab] = useState('events');
    const [loading, setLoading] = useState(true);
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        date: '',
        venue: '',
        totalTickets: '',
        price: ''
    });

    useEffect(() => {
        const adminData = localStorage.getItem('admin');
        const adminToken = localStorage.getItem('adminToken');

        if (!adminToken || !adminData) {
            navigate('/admin');
            return;
        }

        setAdmin(JSON.parse(adminData));
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            // Set admin token for requests
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [eventsRes, developersRes] = await Promise.all([
                adminAPI.getEvents(),
                adminAPI.getDevelopers()
            ]);

            if (eventsRes.data.success) setEvents(eventsRes.data.data.events);
            if (developersRes.data.success) setDevelopers(developersRes.data.data.developers);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        navigate('/admin');
    };

    const openCreateModal = () => {
        setEditingEvent(null);
        setEventForm({ title: '', description: '', date: '', venue: '', totalTickets: '', price: '' });
        setShowEventModal(true);
    };

    const openEditModal = (event) => {
        setEditingEvent(event);
        setEventForm({
            title: event.title,
            description: event.description || '',
            date: event.date?.split('T')[0] || '',
            venue: event.venue,
            totalTickets: event.totalTickets.toString(),
            price: event.price.toString()
        });
        setShowEventModal(true);
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...eventForm,
                totalTickets: parseInt(eventForm.totalTickets),
                price: parseFloat(eventForm.price)
            };

            if (editingEvent) {
                await adminAPI.updateEvent(editingEvent.id, data);
            } else {
                await adminAPI.createEvent(data);
            }

            setShowEventModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving event:', error);
            alert(error.response?.data?.error?.message || 'Failed to save event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;

        try {
            await adminAPI.deleteEvent(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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
                            <span className="text-2xl mr-2">🔐</span>
                            <span className="text-white font-bold">Admin Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-300">{admin?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'events'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        📅 Events ({events.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('developers')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'developers'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        👨‍💻 Developers ({developers.length})
                    </button>
                </div>

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Manage Events</h2>
                            <button
                                onClick={openCreateModal}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                                <span className="mr-2">+</span> Create Event
                            </button>
                        </div>

                        <div className="bg-gray-800 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-gray-300">Title</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Date</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Venue</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Tickets</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Price</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((event) => (
                                        <tr key={event.id} className="border-t border-gray-700">
                                            <td className="px-4 py-3 text-white">{event.title}</td>
                                            <td className="px-4 py-3 text-gray-300">
                                                {new Date(event.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">{event.venue}</td>
                                            <td className="px-4 py-3 text-gray-300">
                                                {event.availableTickets}/{event.totalTickets}
                                            </td>
                                            <td className="px-4 py-3 text-green-400">{event.price} ETH</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => openEditModal(event)}
                                                    className="text-blue-400 hover:text-blue-300 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Developers Tab */}
                {activeTab === 'developers' && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Registered Developers</h2>
                        <div className="bg-gray-800 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-gray-300">Name</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Email</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Tier</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Requests</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Status</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {developers.map((dev) => (
                                        <tr key={dev.id} className="border-t border-gray-700">
                                            <td className="px-4 py-3 text-white">{dev.name}</td>
                                            <td className="px-4 py-3 text-gray-300">{dev.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs ${dev.tier === 'free' ? 'bg-gray-600 text-gray-300' :
                                                        dev.tier === 'pro' ? 'bg-blue-600 text-white' :
                                                            'bg-purple-600 text-white'
                                                    }`}>
                                                    {dev.tier}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">
                                                {dev.requestCount}/{dev.requestLimit}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs ${dev.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                                    }`}>
                                                    {dev.isActive ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">
                                                {new Date(dev.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {editingEvent ? 'Edit Event' : 'Create Event'}
                        </h3>
                        <form onSubmit={handleEventSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Event Title"
                                value={eventForm.title}
                                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                            />
                            <textarea
                                placeholder="Description"
                                value={eventForm.description}
                                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                                rows="3"
                            />
                            <input
                                type="datetime-local"
                                value={eventForm.date}
                                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                            />
                            <input
                                type="text"
                                placeholder="Venue"
                                value={eventForm.venue}
                                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Total Tickets"
                                    value={eventForm.totalTickets}
                                    onChange={(e) => setEventForm({ ...eventForm, totalTickets: e.target.value })}
                                    required
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                                />
                                <input
                                    type="number"
                                    step="0.0001"
                                    placeholder="Price (ETH)"
                                    value={eventForm.price}
                                    onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                                    required
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                                >
                                    {editingEvent ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEventModal(false)}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
