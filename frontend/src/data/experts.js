// Shared expert data for consistent linking across the application
export const mockExperts = [
  {
    id: 1,
    firstName: "Dr. Sarah",
    lastName: "Chen",
    displayName: "Dr. Sarah Chen",
    username: "@dr_sarah_chen",
    email: "sarah.chen@theexperts.com",
    phone: "+1-617-555-0101",
    address: "123 Medical Center Dr, Boston, MA 02115",
    bio: "Board-certified family physician with 15+ years experience. Specializing in preventive care, wellness consultations, and telemedicine. Available for virtual consultations and health screenings.",
    profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjB3b21hbnxlbnwwfHx8Ymx1ZXwxNzUxMjQyNDc2fDA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Boston", state: "MA", country: "USA", zipCode: "02115" },
    gender: "female", age: 42, isOnline: true, rating: 4.9,
    category: "Medical", specialty: "Family Medicine",
    hourlyRate: 150.00, sessionRate: 200.00,
    serviceArea: "Local & Virtual", yearsOfExperience: 15,
    services: ["Health Consultations", "Preventive Care", "Telemedicine", "Health Screenings"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "123 Medical Center Dr, Boston, MA 02115",
    payingForExposure: true, exposureLevel: "State",
    monthlyFee: 75.00, published: true, freeSignup: true,
    reviews: [
      { id: 1, author: "John D.", rating: 5, text: "Dr. Chen was extremely helpful and professional. Great consultation!", date: "2024-01-15" },
      { id: 2, author: "Sarah M.", rating: 5, text: "Excellent doctor, very knowledgeable and caring.", date: "2024-01-10" },
      { id: 3, author: "Mike R.", rating: 4, text: "Good consultation, answered all my questions.", date: "2024-01-05" }
    ],
    credentials: ["MD", "Board Certified Family Medicine", "Telemedicine Certified"],
    education: "Harvard Medical School",
    officeHours: "Monday-Friday: 9AM-5PM, Saturday: 10AM-3PM",
    documents: [
      {
        id: 1,
        name: "Health Assessment Form",
        type: "PDF",
        size: "2.3 MB",
        uploadDate: "2024-01-15",
        downloadUrl: "/documents/health-assessment-form.pdf",
        description: "Pre-consultation health assessment form to complete before your appointment"
      },
      {
        id: 2,
        name: "Telemedicine Guidelines",
        type: "PDF",
        size: "1.8 MB",
        uploadDate: "2024-01-10",
        downloadUrl: "/documents/telemedicine-guidelines.pdf",
        description: "Guidelines for telemedicine consultations and what to expect"
      },
      {
        id: 3,
        name: "Wellness Tips Handbook",
        type: "PDF",
        size: "4.2 MB",
        uploadDate: "2024-01-05",
        downloadUrl: "/documents/wellness-tips-handbook.pdf",
        description: "Comprehensive guide to maintaining good health and wellness"
      }
    ]
  },
  {
    id: 2,
    firstName: "Dr. Michael",
    lastName: "Rodriguez",
    displayName: "Dr. Michael Rodriguez",
    username: "@dr_michael_cardio",
    email: "michael.rodriguez@theexperts.com",
    phone: "+1-713-555-0102",
    address: "456 Heart Center Blvd, Houston, TX 77002",
    bio: "Cardiologist with 20+ years experience treating heart conditions. Offering consultations for heart health, prevention strategies, and second opinions on cardiac treatments.",
    profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxkb2N0b3IlMjBtYW58ZW58MHx8fGJsdWV8MTc1MTI0MjQ3Nnww&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Houston", state: "TX", country: "USA", zipCode: "77002" },
    gender: "male", age: 48, isOnline: false, rating: 4.8,
    category: "Medical", specialty: "Cardiology",
    hourlyRate: 250.00, sessionRate: 300.00,
    serviceArea: "Local & Virtual", yearsOfExperience: 20,
    services: ["Heart Health Consultations", "Cardiac Prevention", "Second Opinions", "EKG Review"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "456 Heart Center Blvd, Houston, TX 77002",
    payingForExposure: true, exposureLevel: "National",
    monthlyFee: 125.00, published: true, freeSignup: true,
    reviews: [
      { id: 1, author: "Robert K.", rating: 5, text: "Dr. Rodriguez provided excellent cardiac consultation. Very thorough!", date: "2024-01-20" },
      { id: 2, author: "Linda S.", rating: 4, text: "Professional and knowledgeable cardiologist.", date: "2024-01-18" }
    ],
    credentials: ["MD", "Board Certified Cardiology", "Fellow of ACC"],
    education: "Baylor College of Medicine",
    officeHours: "Monday-Friday: 8AM-6PM"
  },
  {
    id: 3,
    firstName: "Dr. Lisa",
    lastName: "Park",
    displayName: "Dr. Lisa Park",
    username: "@dr_lisa_wellness",
    email: "lisa.park@theexperts.com",
    phone: "+1-512-555-0103",
    address: "789 Wellness St, Austin, TX 78701",
    bio: "Licensed therapist and wellness coach. Specializing in anxiety, depression, relationship counseling, and stress management. Virtual and in-person sessions available.",
    profileImage: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHx0aGVyYXBpc3QlMjB3b21hbnxlbnwwfHx8Ymx1ZXwxNzUxMjQyNDc2fDA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Austin", state: "TX", country: "USA", zipCode: "78701" },
    gender: "female", age: 38, isOnline: true, rating: 4.9,
    category: "Medical", specialty: "Mental Health",
    hourlyRate: 120.00, sessionRate: 150.00,
    serviceArea: "State-wide & Virtual", yearsOfExperience: 12,
    services: ["Therapy", "Counseling", "Stress Management", "Relationship Help"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "789 Wellness St, Austin, TX 78701",
    payingForExposure: true, exposureLevel: "State",
    monthlyFee: 60.00, published: true, freeSignup: true,
    reviews: [
      { id: 1, author: "Emma T.", rating: 5, text: "Dr. Park helped me tremendously with anxiety management. Highly recommend!", date: "2024-01-22" },
      { id: 2, author: "David L.", rating: 5, text: "Excellent therapist, very compassionate and professional.", date: "2024-01-19" }
    ],
    credentials: ["Ph.D. Psychology", "Licensed Professional Counselor", "Certified Wellness Coach"],
    education: "University of Texas at Austin",
    officeHours: "Monday-Friday: 10AM-7PM, Saturday: 9AM-2PM",
    documents: [
      {
        id: 4,
        name: "Anxiety Management Workbook",
        type: "PDF",
        size: "3.1 MB",
        uploadDate: "2024-01-20",
        downloadUrl: "/documents/anxiety-management-workbook.pdf",
        description: "Self-help workbook for managing anxiety and stress"
      },
      {
        id: 5,
        name: "Mindfulness Meditation Guide",
        type: "PDF",
        size: "2.7 MB",
        uploadDate: "2024-01-18",
        downloadUrl: "/documents/mindfulness-meditation-guide.pdf",
        description: "Step-by-step guide to mindfulness meditation practices"
      }
    ]
  },
  {
    id: 4,
    firstName: "James",
    lastName: "Wilson",
    displayName: "James Wilson",
    username: "@james_insurance",
    email: "james.wilson@theexperts.com",
    phone: "+1-303-555-0104",
    address: "101 Insurance Plaza, Denver, CO 80202",
    bio: "Licensed life insurance agent with 15+ years helping families secure their financial future. Specializing in term life, whole life, and estate planning insurance solutions.",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw0fHxpbnN1cmFuY2UlMjBtYW58ZW58MHx8fGJsdWV8MTc1MTI0MjQ3Nnww&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Denver", state: "CO", country: "USA", zipCode: "80202" },
    gender: "male", age: 43, isOnline: true, rating: 4.7,
    category: "Insurance", specialty: "Life Insurance",
    hourlyRate: 100.00, sessionRate: 0.00,
    serviceArea: "Local & Virtual", yearsOfExperience: 15,
    services: ["Life Insurance Quotes", "Policy Review", "Estate Planning", "Financial Protection"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "101 Insurance Plaza, Denver, CO 80202",
    payingForExposure: true, exposureLevel: "Local",
    monthlyFee: 40.00, published: true, freeSignup: true,
    reviews: [
      { id: 1, author: "Carol P.", rating: 5, text: "James helped us choose the perfect life insurance policy. Very professional!", date: "2024-01-21" },
      { id: 2, author: "Steve M.", rating: 4, text: "Good consultation, explained everything clearly.", date: "2024-01-16" }
    ],
    credentials: ["Licensed Insurance Agent", "Certified Financial Planner", "Estate Planning Specialist"],
    education: "University of Colorado Boulder - Business",
    officeHours: "Monday-Friday: 9AM-6PM, Saturday: 10AM-2PM"
  },
  {
    id: 5,
    firstName: "Maria",
    lastName: "Garcia",
    displayName: "Maria Garcia",
    username: "@maria_protection",
    email: "maria.garcia@theexperts.com",
    phone: "+1-602-555-0105",
    address: "202 Protection Ave, Phoenix, AZ 85001",
    bio: "Senior insurance advisor specializing in family protection plans and business insurance. 18+ years helping members navigate complex insurance needs and claims.",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw1fHxpbnN1cmFuY2UlMjB3b21hbnxlbnwwfHx8Ymx1ZXwxNzUxMjQyNDc2fDA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Phoenix", state: "AZ", country: "USA", zipCode: "85001" },
    gender: "female", age: 45, isOnline: false, rating: 4.8,
    category: "Insurance", specialty: "Family Protection",
    hourlyRate: 85.00, sessionRate: 0.00,
    serviceArea: "State-wide", yearsOfExperience: 18,
    services: ["Family Insurance Plans", "Business Insurance", "Claims Assistance", "Policy Optimization"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "202 Protection Ave, Phoenix, AZ 85001",
    payingForExposure: true, exposureLevel: "State",
    monthlyFee: 45.00, published: true, freeSignup: true,
    reviews: [
      { id: 1, author: "Jose R.", rating: 5, text: "Maria helped us with comprehensive family insurance. Excellent service!", date: "2024-01-17" },
      { id: 2, author: "Lisa C.", rating: 4, text: "Very knowledgeable about insurance options.", date: "2024-01-14" }
    ],
    credentials: ["Licensed Insurance Broker", "Certified Insurance Counselor", "Business Insurance Specialist"],
    education: "Arizona State University - Finance",
    officeHours: "Monday-Friday: 8AM-5PM"
  }
];

// Function to get expert by ID
export const getExpertById = (id) => {
  return mockExperts.find(expert => expert.id === parseInt(id));
};

// Function to get all experts
export const getAllExperts = () => {
  return mockExperts;
};