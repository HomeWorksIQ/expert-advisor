import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';

const AppointmentSystem = () => {
  const { user, API } = useUser();
  const [activeTab, setActiveTab] = useState('calendar');
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    appointment_type: 'video_call',
    scheduled_start: '',
    scheduled_end: '',
    price: 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [newAvailability, setNewAvailability] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    available_types: ['video_call'],
    pricing: { video_call: 50, phone_call: 30, chat_session: 20 },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const appointmentTypes = [
    { value: 'video_call', label: 'Video Call', icon: '📹', description: 'Face-to-face video consultation' },
    { value: 'phone_call', label: 'Phone Call', icon: '📞', description: 'Voice-only consultation' },
    { value: 'chat_session', label: 'Chat Session', icon: '💬', description: 'Text-based consultation' },
    { value: 'custom_service', label: 'Custom Service', icon: '⭐', description: 'Custom service offering' },
    { value: 'in_person', label: 'In Person', icon: '🤝', description: 'Face-to-face meeting' }
  ];

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    if (user) {
      fetchAppointments();
      if (user.userType === 'performer') {
        fetchAvailability();
      }
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const endpoint = user.userType === 'performer' 
        ? `/performer/${user.id}/appointments`
        : `/member/${user.id}/appointments`;
      
      const response = await axios.get(`${API}${endpoint}`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`${API}/performer/${user.id}/availability`);
      setAvailability(response.data);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  const createAppointment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const appointmentData = {
        ...newAppointment,
        performer_id: user.userType === 'performer' ? user.id : newAppointment.performer_id,
        member_id: user.userType === 'member' ? user.id : newAppointment.member_id
      };

      await axios.post(`${API}/appointments`, appointmentData);
      
      setNewAppointment({
        title: '',
        description: '',
        appointment_type: 'video_call',
        scheduled_start: '',
        scheduled_end: '',
        price: 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      setShowCreateForm(false);
      await fetchAppointments();
      alert('Appointment created successfully!');
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('Failed to create appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createAvailability = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${API}/performer/${user.id}/availability`, newAvailability);
      
      setNewAvailability({
        day_of_week: 0,
        start_time: '09:00',
        end_time: '17:00',
        available_types: ['video_call'],
        pricing: { video_call: 50, phone_call: 30, chat_session: 20 },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      await fetchAvailability();
      alert('Availability added successfully!');
    } catch (error) {
      console.error('Failed to create availability:', error);
      alert('Failed to add availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(`${API}/appointments/${appointmentId}/status`, { status });
      await fetchAppointments();
      alert('Appointment status updated!');
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      alert('Failed to update appointment status.');
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-900 text-blue-300',
      confirmed: 'bg-green-900 text-green-300',
      in_progress: 'bg-yellow-900 text-yellow-300',
      completed: 'bg-gray-900 text-gray-300',
      cancelled: 'bg-red-900 text-red-300',
      no_show: 'bg-orange-900 text-orange-300'
    };
    return colors[status] || 'bg-gray-900 text-gray-300';
  };

  const renderCalendarView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Appointments Calendar</h3>
        {user.userType === 'performer' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 rounded-lg text-white hover:from-pink-600 hover:to-purple-700"
          >
            Create Appointment
          </button>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No appointments scheduled. {user.userType === 'performer' ? 'Create your first appointment!' : 'Book an appointment with a performer!'}
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(appointment => (
              <div key={appointment.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">
                        {appointmentTypes.find(t => t.value === appointment.appointment_type)?.icon || '📅'}
                      </span>
                      <h4 className="text-lg font-semibold text-white">{appointment.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-2">{appointment.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                      <div>
                        <strong>Start:</strong> {formatDateTime(appointment.scheduled_start)}
                      </div>
                      <div>
                        <strong>End:</strong> {formatDateTime(appointment.scheduled_end)}
                      </div>
                      <div>
                        <strong>Type:</strong> {appointmentTypes.find(t => t.value === appointment.appointment_type)?.label}
                      </div>
                      <div>
                        <strong>Price:</strong> ${appointment.price}
                      </div>
                    </div>
                  </div>
                  
                  {user.userType === 'performer' && appointment.status === 'scheduled' && (
                    <div className="ml-4 space-x-2">
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        className="bg-green-600 px-3 py-1 rounded text-white text-sm hover:bg-green-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        className="bg-red-600 px-3 py-1 rounded text-white text-sm hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAvailabilityView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Availability Schedule</h3>
      </div>

      {/* Add New Availability */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Add Availability Slot</h4>
        <form onSubmit={createAvailability} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Day of Week</label>
            <select
              value={newAvailability.day_of_week}
              onChange={(e) => setNewAvailability({...newAvailability, day_of_week: parseInt(e.target.value)})}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
              required
            >
              {daysOfWeek.map((day, index) => (
                <option key={index} value={index}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Available Types</label>
            <select
              multiple
              value={newAvailability.available_types}
              onChange={(e) => setNewAvailability({
                ...newAvailability, 
                available_types: Array.from(e.target.selectedOptions, option => option.value)
              })}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
            >
              {appointmentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
            <input
              type="time"
              value={newAvailability.start_time}
              onChange={(e) => setNewAvailability({...newAvailability, start_time: e.target.value})}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
            <input
              type="time"
              value={newAvailability.end_time}
              onChange={(e) => setNewAvailability({...newAvailability, end_time: e.target.value})}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 rounded-lg text-white hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Availability'}
            </button>
          </div>
        </form>
      </div>

      {/* Current Availability */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Current Availability</h4>
        {availability.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No availability set. Add your first availability slot!
          </div>
        ) : (
          <div className="space-y-3">
            {availability.map(slot => (
              <div key={slot.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-semibold text-white">{daysOfWeek[slot.day_of_week]}</h5>
                    <p className="text-gray-300">{slot.start_time} - {slot.end_time}</p>
                    <p className="text-sm text-gray-400">
                      Types: {slot.available_types.map(type => 
                        appointmentTypes.find(t => t.value === type)?.label
                      ).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Pricing:</p>
                    {Object.entries(slot.pricing).map(([type, price]) => (
                      <p key={type} className="text-white text-sm">
                        {appointmentTypes.find(t => t.value === type)?.label}: ${price}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Appointment System
          </h1>
          <p className="text-gray-400 mt-2">
            {user?.userType === 'performer' ? 'Manage your appointments and availability' : 'Book appointments with performers'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              📅 Calendar
            </button>
            {user?.userType === 'performer' && (
              <button
                onClick={() => setActiveTab('availability')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'availability'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                🕒 Availability
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'calendar' && renderCalendarView()}
        {activeTab === 'availability' && renderAvailabilityView()}

        {/* Create Appointment Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-96 max-w-full mx-4 max-h-screen overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">Create New Appointment</h3>
              
              <form onSubmit={createAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={newAppointment.appointment_type}
                    onChange={(e) => setNewAppointment({...newAppointment, appointment_type: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                  >
                    {appointmentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newAppointment.scheduled_start}
                    onChange={(e) => setNewAppointment({...newAppointment, scheduled_start: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newAppointment.scheduled_end}
                    onChange={(e) => setNewAppointment({...newAppointment, scheduled_end: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={newAppointment.price}
                    onChange={(e) => setNewAppointment({...newAppointment, price: parseFloat(e.target.value)})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newAppointment.description}
                    onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500"
                    rows="3"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 p-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentSystem;