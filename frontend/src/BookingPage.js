import React, { useState } from 'react';
import { Header } from './components';
import { useParams } from 'react-router-dom';

const BookingPage = () => {
  const { expertId } = useParams();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('video_call');
  const [message, setMessage] = useState('');

  // Mock expert data - in real app, fetch by expertId
  const expert = {
    id: expertId,
    name: "Dr. Sarah Chen",
    specialty: "Family Medicine",
    hourlyRate: 150,
    officeAddress: "123 Medical Center Dr, Boston, MA 02115",
    availableFor: ["chat", "video_call", "in_person"]
  };

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
              <h2 className="text-xl font-semibold text-gray-900">{expert.name}</h2>
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