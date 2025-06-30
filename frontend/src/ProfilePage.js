import React, { useState, useEffect } from 'react';
import { Header } from './components';
import { useParams } from 'react-router-dom';
import { getExpertById } from './data/experts';

const ProfilePage = () => {
  const { id } = useParams();
  const [expert, setExpert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Fetch expert data from shared data source
    setTimeout(() => {
      const foundExpert = getExpertById(id);
      setExpert(foundExpert);
      setIsLoading(false);
    }, 1000);
  }, [id]);

  // File upload handler
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadMessage('');
    }
  };

  // File upload function
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a file first.');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadMessage('File size must be less than 10MB.');
      return;
    }

    setIsUploading(true);
    setUploadMessage('');

    try {
      // Simulate file upload - in real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadMessage(`✅ File "${selectedFile.name}" uploaded successfully! The expert will receive it shortly.`);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setUploadMessage('❌ Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // File download handler
  const handleFileDownload = (document) => {
    // In a real app, this would trigger an actual download
    alert(`Downloading: ${document.name}\nThis would normally start the download from: ${document.downloadUrl}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading expert profile...</p>
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
            <p className="text-gray-600 mb-6">The expert profile you're looking for doesn't exist.</p>
            <a href="/discover" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Browse All Experts
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg mb-6 overflow-hidden">
          <img 
            src={expert.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 to-green-500/70"></div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 -mt-20 relative z-10 mx-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="relative">
              <img 
                src={expert.profileImage} 
                alt={expert.displayName}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${
                expert.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{expert.displayName}</h1>
              <p className="text-xl text-green-600 font-semibold mb-2">{expert.specialty}</p>
              <p className="text-gray-600 mb-4">{expert.serviceArea}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">⭐</span>
                  <span className="font-semibold">{expert.rating}</span>
                  <span className="text-gray-500 ml-1">({expert.reviews?.length || 0} reviews)</span>
                </div>
                <div className="text-gray-600">
                  {expert.yearsOfExperience}+ years experience
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  expert.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {expert.isOnline ? 'Available Now' : 'Offline'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <a 
                  href={`/chat/${expert.id}`}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                >
                  💬 Start Chat
                </a>
                <a 
                  href={`/book/${expert.id}`}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all flex items-center gap-2"
                >
                  📅 Book Appointment
                </a>
                <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2">
                  📹 Video Call
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2">
                  📞 Voice Call
                </button>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-gray-50 rounded-lg p-4 min-w-[250px]">
              <h3 className="font-semibold text-gray-900 mb-3">Consultation Rates</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hourly Rate:</span>
                  <span className="font-semibold">${expert.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Rate:</span>
                  <span className="font-semibold">${expert.sessionRate}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">Response time: Within 2 hours</p>
                <p className="text-xs text-gray-500">Free cancellation up to 24h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'about', label: 'About' },
                { id: 'services', label: 'Services' },
                { id: 'documents', label: 'Documents' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'contact', label: 'Contact' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About {expert.firstName}</h3>
                  <p className="text-gray-700 leading-relaxed">{expert.bio}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Credentials</h3>
                  <div className="flex flex-wrap gap-2">
                    {expert.credentials?.map((credential, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {credential}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                  <p className="text-gray-700">{expert.education}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Office Hours</h3>
                  <p className="text-gray-700">{expert.officeHours}</p>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Services</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {expert.services?.map((service, index) => (
                      <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <span className="text-green-500 mr-3">✓</span>
                        <span className="text-gray-700">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Consultation Methods</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {expert.availableFor?.map((method, index) => (
                      <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                        <div className="text-2xl mb-2">
                          {method === 'chat' ? '💬' : method === 'video_call' ? '📹' : '🏢'}
                        </div>
                        <div className="font-medium text-gray-900">
                          {method === 'chat' ? 'Text Chat' : method === 'video_call' ? 'Video Call' : 'In-Person'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                {/* Expert's Documents for Download */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    📋 Available Documents from {expert.firstName}
                  </h3>
                  {expert.documents && expert.documents.length > 0 ? (
                    <div className="space-y-3">
                      {expert.documents.map(document => (
                        <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-red-600 font-semibold text-xs">
                                {document.type}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{document.name}</h4>
                              <p className="text-sm text-gray-600">{document.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span>{document.size}</span>
                                <span>•</span>
                                <span>Uploaded {document.uploadDate}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleFileDownload(document)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                          >
                            <span>📥</span>
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">No documents available from this expert yet.</p>
                    </div>
                  )}
                </div>

                {/* Upload Documents to Expert */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    📤 Send Documents to {expert.firstName}
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="mb-4">
                      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                        Select file to upload
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          id="file-upload"
                          type="file"
                          onChange={handleFileSelect}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <button
                          onClick={handleFileUpload}
                          disabled={!selectedFile || isUploading}
                          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                            selectedFile && !isUploading
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isUploading ? (
                            <span className="flex items-center gap-2">
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Uploading...
                            </span>
                          ) : (
                            'Upload'
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {selectedFile && (
                      <div className="mb-4 p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              const fileInput = document.getElementById('file-upload');
                              if (fileInput) fileInput.value = '';
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {uploadMessage && (
                      <div className={`p-3 rounded-lg text-sm ${
                        uploadMessage.includes('✅') 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {uploadMessage}
                      </div>
                    )}
                    
                    <div className="mt-4 text-xs text-gray-600">
                      <p className="mb-1">• Accepted formats: PDF, DOC, DOCX, JPG, PNG</p>
                      <p className="mb-1">• Maximum file size: 10MB</p>
                      <p>• The expert will be notified when you upload a document</p>
                    </div>
                  </div>
                </div>
              </div>

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl font-bold text-gray-900">{expert.rating}</div>
                  <div>
                    <div className="flex items-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < Math.floor(expert.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <div className="text-gray-600">{expert.reviews?.length || 0} reviews</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {expert.reviews?.map(review => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{review.author}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-gray-500 text-sm">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">📧</span>
                      <span className="text-gray-700">{expert.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">📞</span>
                      <span className="text-gray-700">{expert.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">📍</span>
                      <span className="text-gray-700">{expert.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Office Location</h3>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-gray-700 mb-2">{expert.officeAddress}</p>
                    <p className="text-sm text-gray-600">Available for in-person consultations</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <a 
                      href={`/chat/${expert.id}`}
                      className="flex items-center justify-center gap-2 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <span>💬</span>
                      <span className="font-medium text-blue-600">Start Chat</span>
                    </a>
                    <a 
                      href={`/book/${expert.id}`}
                      className="flex items-center justify-center gap-2 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <span>📅</span>
                      <span className="font-medium text-green-600">Book Appointment</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;