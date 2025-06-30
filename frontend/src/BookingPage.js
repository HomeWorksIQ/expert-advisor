import React, { useState, useEffect } from 'react';
import { Header } from './components';
import { useParams } from 'react-router-dom';
import { getExpertById } from './data/experts';

const BookingPage = () => {
  const { expertId } = useParams();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('video_call');
  const [message, setMessage] = useState('');
  const [expert, setExpert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock expert data - get from shared mockPerformers
  const mockPerformers = [
    {
      id: 1, firstName: "Dr. Sarah", lastName: "Chen", displayName: "Dr. Sarah Chen",
      specialty: "Family Medicine", hourlyRate: 150,
      officeAddress: "123 Medical Center Dr, Boston, MA 02115",
      availableFor: ["chat", "video_call", "in_person"]
    },
    {
      id: 2, firstName: "Dr. Michael", lastName: "Rodriguez", displayName: "Dr. Michael Rodriguez",
      specialty: "Cardiology", hourlyRate: 250,
      officeAddress: "456 Heart Center Blvd, Houston, TX 77002",
      availableFor: ["chat", "video_call", "in_person"]
    },
    {
      id: 3, firstName: "Dr. Lisa", lastName: "Park", displayName: "Dr. Lisa Park",
      specialty: "Mental Health", hourlyRate: 120,
      officeAddress: "789 Wellness St, Austin, TX 78701",
      availableFor: ["chat", "video_call", "in_person"]
    },
    {
      id: 4, firstName: "James", lastName: "Wilson", displayName: "James Wilson",
      specialty: "Life Insurance", hourlyRate: 100,
      officeAddress: "101 Insurance Plaza, Denver, CO 80202",
      availableFor: ["chat", "video_call", "in_person"]
    },
    {
      id: 5, firstName: "Maria", lastName: "Garcia", displayName: "Maria Garcia",
      specialty: "Family Protection", hourlyRate: 85,
      officeAddress: "202 Protection Ave, Phoenix, AZ 85001",
      availableFor: ["chat", "video_call", "in_person"]
    }
  ];

  useEffect(() => {
    // Find expert by ID
    setTimeout(() => {
      const foundExpert = mockPerformers.find(p => p.id === parseInt(expertId));
      setExpert(foundExpert || mockPerformers[0]); // Default to first expert if not found
      setIsLoading(false);
    }, 500);
  }, [expertId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading expert information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Expert Not Found</h2>
            <p className="text-gray-600 mb-6">The expert you're looking for doesn't exist.</p>
            <a href="/discover" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Browse All Experts
            </a>
          </div>
        </div>
      </div>
    );
  }

  const appointmentTypes = [
    { value: 'video_call', label: 'Video Call', icon: '📹', description: 'Online video consultation' },
    { value: 'in_person', label: 'In-Person', icon: '🏢', description: 'Visit expert\'s office' },
    { value: 'chat', label: 'Chat Session', icon: '💬', description: 'Text-based consultation' }
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const handleBooking = (e) => {
    e.preventDefault();
    // Handle booking logic here
    alert('Appointment booking request sent! The expert will confirm your appointment.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Appointment
          </h1>
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{expert.displayName}</h2>
              <p className="text-green-600">{expert.specialty}</p>
              <p className="text-gray-600">${expert.hourlyRate}/hour</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Schedule Your Appointment
            </h3>

            <form onSubmit={handleBooking} className="space-y-6">
              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Appointment Type
                </label>
                <div className="grid gap-3">
                  {appointmentTypes.filter(type => expert.availableFor.includes(type.value)).map(type => (
                    <label key={type.value} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      appointmentType === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="appointmentType"
                        value={type.value}
                        checked={appointmentType === type.value}
                        onChange={(e) => setAppointmentType(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-3">{type.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select a time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Appointment (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Briefly describe what you'd like to discuss..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 transition-all"
              >
                Request Appointment
              </button>
            </form>
          </div>

          {/* Expert Info & Office Details */}
          <div className="space-y-6">
            {/* Office Information */}
            {appointmentType === 'in_person' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Office Location
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-400">📍</span>
                    <p className="text-gray-700">{expert.officeAddress}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-medium">${expert.hourlyRate}/hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium">Within 2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancellation:</span>
                  <span className="font-medium">Free up to 24h</span>
                </div>
              </div>
            </div>

            {/* Quick Chat Option */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                Need immediate help?
              </h3>
              <p className="text-sm mb-4 opacity-90">
                Start a chat session right now if the expert is available.
              </p>
              <a
                href={`/chat/${expertId}`}
                className="inline-block px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                Start Chat Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;