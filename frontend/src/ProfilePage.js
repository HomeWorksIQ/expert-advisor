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
  const [isFavorited, setIsFavorited] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  useEffect(() => {
    // Fetch expert data from shared data source
    setTimeout(() => {
      const foundExpert = getExpertById(id);
      setExpert(foundExpert);
      setIsLoading(false);
      
      // Check if expert is favorited
      const favorites = JSON.parse(localStorage.getItem('memberFavorites') || '[]');
      setIsFavorited(favorites.includes(parseInt(id)));
      
      // Load uploaded documents for this expert
      const uploadedDocs = JSON.parse(localStorage.getItem(`uploadedDocs_${id}`) || '[]');
      setUploadedDocuments(uploadedDocs);
    }, 1000);
  }, [id]);

  // Favorite toggle handler
  const handleFavoriteToggle = () => {
    const favorites = JSON.parse(localStorage.getItem('memberFavorites') || '[]');
    const expertIdNum = parseInt(id);
    
    if (isFavorited) {
      // Remove from favorites
      const updatedFavorites = favorites.filter(fav => fav !== expertIdNum);
      localStorage.setItem('memberFavorites', JSON.stringify(updatedFavorites));
      setIsFavorited(false);
    } else {
      // Add to favorites
      const updatedFavorites = [...favorites, expertIdNum];
      localStorage.setItem('memberFavorites', JSON.stringify(updatedFavorites));
      setIsFavorited(true);
    }
  };

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
      
      // Create new uploaded document
      const newDocument = {
        id: Date.now(),
        name: selectedFile.name,
        type: selectedFile.type.includes('pdf') ? 'PDF' : selectedFile.type.includes('doc') ? 'DOC' : 'IMG',
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'member',
        description: `Document uploaded by member for ${expert.firstName}`
      };
      
      // Save to localStorage and update state
      const existingDocs = JSON.parse(localStorage.getItem(`uploadedDocs_${id}`) || '[]');
      const updatedDocs = [...existingDocs, newDocument];
      localStorage.setItem(`uploadedDocs_${id}`, JSON.stringify(updatedDocs));
      setUploadedDocuments(updatedDocs);
      
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

  // File delete handler
  const handleFileDelete = (documentId) => {
    const updatedDocs = uploadedDocuments.filter(doc => doc.id !== documentId);
    localStorage.setItem(`uploadedDocs_${id}`, JSON.stringify(updatedDocs));
    setUploadedDocuments(updatedDocs);
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
            <p className="text-gray-600 mb-6">The expert you're looking for doesn't exist.</p>
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
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600" 
               style={{backgroundImage: `url(${expert.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
          </div>
          
          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Image */}
              <div className="relative">
                <img 
                  src={expert.profileImage} 
                  alt={expert.displayName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${expert.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{expert.displayName}</h1>
                <p className="text-xl text-blue-600 font-semibold mb-2">{expert.specialty}</p>
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="font-semibold">{expert.rating}</span>
                  </span>
                  <span>•</span>
                  <span>{expert.yearsOfExperience} years experience</span>
                  <span>•</span>
                  <span className={expert.isOnline ? 'text-green-600' : 'text-gray-500'}>
                    {expert.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-gray-700 text-lg">${expert.hourlyRate}/hour</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                <button
                  onClick={handleFavoriteToggle}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
                    isFavorited 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <span>{isFavorited ? '❤️' : '🤍'}</span>
                  <span className="font-semibold">{isFavorited ? 'Favorited' : 'Add to Favorites'}</span>
                </button>
                <a 
                  href={`/chat/${expert.id}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  <span>💬</span>
                  <span className="font-semibold">Start Chat</span>
                </a>
                <a 
                  href={`/book/${expert.id}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                >
                  <span>📅</span>
                  <span className="font-semibold">Book Appointment</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
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
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700 leading-relaxed">{expert.bio}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Credentials</h3>
                  <div className="flex flex-wrap gap-2">
                    {expert.credentials.map((credential, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {credential}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                  <p className="text-gray-700">{expert.education}</p>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {expert.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Service Areas</h4>
                  <p className="text-blue-800">{expert.serviceArea}</p>
                  
                  <h4 className="font-semibold text-blue-900 mb-2 mt-4">Office Hours</h4>
                  <p className="text-blue-800">{expert.officeHours}</p>
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
            )}

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
                    <p className="text-gray-600">{expert.reviews.length} reviews</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {expert.reviews.map(review => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">{review.author}</div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{review.text}</p>
                      <p className="text-sm text-gray-500">{review.date}</p>
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
                      <span className="text-gray-400">✉️</span>
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