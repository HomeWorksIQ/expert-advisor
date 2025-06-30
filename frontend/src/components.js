import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminDashboard from './AdminDashboard';
import { useParams } from 'react-router-dom';
import { useUser } from './UserContext';
import TrialStatusComponent from './TrialStatusComponent';
import TrialWelcomeModal from './TrialWelcomeModal';
import { getAllExperts } from './data/experts';

// Utility functions for optimization
const debounce = (func, delay) => {
  let debounceTimer;
  return function(...args) {
    const context = this;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Categories for expert classification
const categories = [
  { id: "medical", name: "Medical & Health", icon: "🏥", count: 3 },
  { id: "insurance", name: "Insurance", icon: "🛡️", count: 2 },
  { id: "business", name: "Business Consulting", icon: "💼", count: 2 },
  { id: "education", name: "Education & Tutoring", icon: "📚", count: 3 },
  { id: "marketing", name: "Marketing & Advertising", icon: "📱", count: 2 },
  { id: "home_services", name: "Home Services", icon: "🔧", count: 1 },
  { id: "fitness", name: "Fitness & Wellness", icon: "💪", count: 1 },
  { id: "legal", name: "Legal Services", icon: "⚖️", count: 1 },
  { id: "technology", name: "Technology & IT", icon: "💻", count: 1 },
  { id: "real_estate", name: "Real Estate", icon: "🏠", count: 1 },
  { id: "automotive", name: "Automotive", icon: "🚗", count: 1 },
  { id: "pet_care", name: "Pet Care", icon: "🐕", count: 1 },
  { id: "financial", name: "Financial Planning", icon: "💰", count: 1 }
];

// Enhanced Mock Data for 20 Local Experts Paying for Exposure
const mockPerformers = [
  // Medical Professionals
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
    monthlyFee: 75.00, published: true, freeSignup: true
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
    monthlyFee: 125.00, published: true, freeSignup: true
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
    monthlyFee: 60.00, published: true, freeSignup: true
  },

  // Life Insurance Professionals
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
    monthlyFee: 40.00, published: true, freeSignup: true
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
    monthlyFee: 45.00, published: true, freeSignup: true
  },

  // Business Consultants
  {
    id: 6,
    firstName: "David",
    lastName: "Thompson",
    displayName: "David Thompson",
    username: "@david_business",
    email: "david.thompson@theexperts.com",
    phone: "+1-206-555-0106",
    address: "303 Business Tower, Seattle, WA 98101",
    bio: "MBA business consultant with 20+ years helping startups and SMBs optimize operations, develop strategies, and scale effectively. Former Fortune 500 executive.",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw2fHxidXNpbmVzcyUyMG1hbnxlbnwwfHx8Ymx1ZXwxNzUxMjQyNDc2fDA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Seattle", state: "WA", country: "USA", zipCode: "98101" },
    gender: "male", age: 52, isOnline: true, rating: 4.9,
    category: "Business", specialty: "Strategy Consulting",
    hourlyRate: 200.00, sessionRate: 250.00,
    serviceArea: "National & Virtual", yearsOfExperience: 22,
    services: ["Business Strategy", "Operations Optimization", "Startup Consulting", "Market Analysis"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "303 Business Tower, Seattle, WA 98101",
    payingForExposure: true, exposureLevel: "National",
    monthlyFee: 100.00, published: true, freeSignup: true
  },
  {
    id: 7,
    firstName: "Jennifer",
    lastName: "Lee",
    displayName: "Jennifer Lee",
    username: "@jennifer_finance",
    email: "jennifer.lee@theexperts.com",
    phone: "+1-415-555-0107",
    address: "404 Financial District, San Francisco, CA 94102",
    bio: "CPA and financial consultant specializing in small business accounting, tax planning, and financial analysis. Helping businesses manage finances and grow profitably.",
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw3fHxmaW5hbmNpYWwlMjB3b21hbnxlbnwwfHx8Ymx1ZXwxNzUxMjQyNDc2fDA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "San Francisco", state: "CA", country: "USA", zipCode: "94102" },
    gender: "female", age: 41, isOnline: true, rating: 4.8,
    category: "Business", specialty: "Financial Consulting",
    hourlyRate: 150.00, sessionRate: 180.00,
    serviceArea: "State-wide & Virtual", yearsOfExperience: 16,
    services: ["Financial Planning", "Tax Strategy", "Business Accounting", "Profit Analysis"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "404 Financial District, San Francisco, CA 94102",
    payingForExposure: true, exposureLevel: "State",
    monthlyFee: 70.00, published: true, freeSignup: true
  },

  // Teachers & Tutors
  {
    id: 8,
    firstName: "Professor",
    lastName: "Robert Adams",
    displayName: "Professor Robert Adams",
    username: "@prof_adams_math",
    email: "robert.adams@theexperts.com",
    phone: "+1-617-555-0108",
    address: "505 University Ave, Boston, MA 02116",
    bio: "Mathematics professor with 25+ years teaching experience. Offering tutoring in algebra, calculus, statistics, and test prep for SAT, ACT, and college entrance exams.",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw4fHx0ZWFjaGVyJTIwbWFufGVufDB8fHxibHVlfDE3NTEyNDI0NzZ8MA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Boston", state: "MA", country: "USA", zipCode: "02116" },
    gender: "male", age: 58, isOnline: true, rating: 4.9,
    category: "Education", specialty: "Mathematics",
    hourlyRate: 75.00, sessionRate: 90.00,
    serviceArea: "Local & Virtual", yearsOfExperience: 25,
    services: ["Math Tutoring", "Test Prep", "Calculus Help", "Statistics Coaching"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "505 University Ave, Boston, MA 02116",
    payingForExposure: true, exposureLevel: "Local",
    monthlyFee: 30.00, published: true, freeSignup: true
  },
  {
    id: 9,
    firstName: "Sarah",
    lastName: "Johnson",
    displayName: "Sarah Johnson",
    username: "@sarah_english_tutor",
    email: "sarah.johnson@theexperts.com",
    phone: "+1-503-555-0109",
    address: "606 Learning Center, Portland, OR 97201",
    bio: "English teacher and writing coach with 12+ years experience. Specializing in essay writing, reading comprehension, grammar, and English as a second language (ESL).",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616c640887f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw5fHx0ZWFjaGVyJTIwd29tYW58ZW58MHx8fGJsdWV8MTc1MTI0MjQ3Nnww&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Portland", state: "OR", country: "USA", zipCode: "97201" },
    gender: "female", age: 35, isOnline: true, rating: 4.8,
    category: "Education", specialty: "English & Writing",
    hourlyRate: 55.00, sessionRate: 65.00,
    serviceArea: "Local & Virtual", yearsOfExperience: 12,
    services: ["English Tutoring", "Essay Writing", "Reading Help", "ESL Instruction"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "606 Learning Center, Portland, OR 97201",
    payingForExposure: true, exposureLevel: "Local",
    monthlyFee: 50.00
  },
  {
    id: 10,
    firstName: "Dr. Kevin",
    lastName: "Chang",
    displayName: "Dr. Kevin Chang",
    username: "@dr_chang_science",
    email: "kevin.chang@theexperts.com",
    phone: "+1234567899",
    bio: "PhD in Chemistry, high school science teacher for 15+ years. Offering tutoring in chemistry, biology, physics, and science fair project guidance.",
    profileImage: "https://images.unsplash.com/photo-1629922949549-ae97b9843336?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMGNvbnN1bHRhbnRzfGVufDB8fHxibHVlfDE3NTEyNDI0NzF8MA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "San Diego", state: "CA", country: "USA", zipCode: "92101" },
    gender: "male", age: 42, isOnline: false, rating: 4.7,
    category: "Education", specialty: "Science",
    hourlyRate: 70.00, sessionRate: 85.00,
    serviceArea: "Local & Virtual", yearsOfExperience: 15,
    services: ["Science Tutoring", "Chemistry Help", "Biology Coaching", "Science Projects"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "707 Science Center, San Diego, CA 92101",
    payingForExposure: true, exposureLevel: "Local",
    monthlyFee: 50.00
  },

  // Marketing Agencies & Professionals
  {
    id: 11,
    firstName: "Amanda",
    lastName: "Rodriguez",
    displayName: "Amanda Rodriguez",
    username: "@amanda_digital",
    email: "amanda.rodriguez@theexperts.com",
    phone: "+1234567800",
    bio: "Digital marketing specialist with 10+ years growing businesses online. Expert in social media, SEO, paid advertising, and content marketing strategies.",
    profileImage: "https://images.pexels.com/photos/7616608/pexels-photo-7616608.jpeg",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Miami", state: "FL", country: "USA", zipCode: "33101" },
    gender: "female", age: 32, isOnline: true, rating: 4.8,
    category: "Marketing", specialty: "Digital Marketing",
    hourlyRate: 125.00, sessionRate: 150.00,
    serviceArea: "National & Virtual", yearsOfExperience: 10,
    services: ["Social Media Marketing", "SEO Optimization", "Paid Advertising", "Content Strategy"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "808 Marketing Hub, Miami, FL 33101",
    payingForExposure: true, exposureLevel: "National",
    monthlyFee: 50.00
  },
  {
    id: 12,
    firstName: "Marcus",
    lastName: "Williams",
    displayName: "Marcus Williams",
    username: "@marcus_brand",
    email: "marcus.williams@theexperts.com",
    phone: "+1234567801",
    bio: "Brand strategist and marketing consultant helping businesses build strong brand identity and positioning. 14+ years experience with Fortune 500 and startups.",
    profileImage: "https://images.unsplash.com/photo-1629922949549-ae97b9843336?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMGNvbnN1bHRhbnRzfGVufDB8fHxibHVlfDE3NTEyNDI0NzF8MA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Atlanta", state: "GA", country: "USA", zipCode: "30309" },
    gender: "male", age: 39, isOnline: true, rating: 4.9,
    category: "Marketing", specialty: "Brand Strategy",
    hourlyRate: 175.00, sessionRate: 200.00,
    serviceArea: "National & Virtual", yearsOfExperience: 14,
    services: ["Brand Development", "Marketing Strategy", "Brand Positioning", "Market Research"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "909 Brand Building, Atlanta, GA 30309",
    payingForExposure: true, exposureLevel: "National",
    monthlyFee: 50.00
  },

  // Home Services & Skilled Trades
  {
    id: 13,
    firstName: "Mike",
    lastName: "Thompson",
    displayName: "Mike Thompson",
    username: "@mike_handyman",
    email: "mike.thompson@theexperts.com",
    phone: "+1234567802",
    bio: "Licensed contractor and handyman with 12+ years experience. Specializing in home repairs, renovations, plumbing, electrical work, and maintenance services.",
    profileImage: "https://images.unsplash.com/photo-1629922949549-ae97b9843336?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMGNvbnN1bHRhbnRzfGVufDB8fHxibHVlfDE3NTEyNDI0NzF8MA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Denver", state: "CO", country: "USA", zipCode: "80202" },
    gender: "male", age: 35, isOnline: true, rating: 4.8,
    category: "Home Services", specialty: "General Contracting",
    hourlyRate: 75.00, sessionRate: 100.00,
    serviceArea: "Local - 25 mile radius", yearsOfExperience: 12,
    services: ["Home Repairs", "Renovations", "Plumbing", "Electrical Work"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "1010 Contractor St, Denver, CO 80202",
    payingForExposure: true, exposureLevel: "Local",
    monthlyFee: 50.00
  },

  // Fitness & Wellness
  {
    id: 14,
    firstName: "James",
    lastName: "Park",
    displayName: "James Park",
    username: "@james_fitness",
    email: "james.park@theexperts.com",
    phone: "+1234567803",
    bio: "Certified personal trainer and nutrition coach with 8+ years helping members achieve fitness goals. Specializing in weight loss, strength training, and healthy lifestyle coaching.",
    profileImage: "https://images.unsplash.com/photo-1629922949549-ae97b9843336?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMGNvbnN1bHRhbnRzfGVufDB8fHxibHVlfDE3NTEyNDI0NzF8MA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Los Angeles", state: "CA", country: "USA", zipCode: "90210" },
    gender: "male", age: 29, isOnline: true, rating: 4.7,
    category: "Fitness", specialty: "Personal Training",
    hourlyRate: 85.00, sessionRate: 100.00,
    serviceArea: "Local & Virtual", yearsOfExperience: 8,
    services: ["Personal Training", "Nutrition Coaching", "Workout Plans", "Lifestyle Coaching"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "1111 Fitness Center, Los Angeles, CA 90210",
    payingForExposure: true, exposureLevel: "Local",
    monthlyFee: 50.00
  },

  // Legal Services
  {
    id: 15,
    firstName: "Attorney",
    lastName: "Patricia Stone",
    displayName: "Attorney Patricia Stone",
    username: "@attorney_stone",
    email: "patricia.stone@theexperts.com",
    phone: "+1234567804",
    bio: "Family law attorney with 18+ years experience in divorce, custody, adoption, and family legal matters. Compassionate representation for difficult family situations.",
    profileImage: "https://images.pexels.com/photos/7616608/pexels-photo-7616608.jpeg",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Chicago", state: "IL", country: "USA", zipCode: "60601" },
    gender: "female", age: 46, isOnline: false, rating: 4.9,
    category: "Legal", specialty: "Family Law",
    hourlyRate: 300.00, sessionRate: 350.00,
    serviceArea: "State-wide", yearsOfExperience: 18,
    services: ["Divorce Proceedings", "Child Custody", "Adoption", "Family Mediation"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "1212 Legal Plaza, Chicago, IL 60601",
    payingForExposure: true, exposureLevel: "State",
    monthlyFee: 50.00
  },

  // Technology Services
  {
    id: 16,
    firstName: "Alex",
    lastName: "Chen",
    displayName: "Alex Chen",
    username: "@alex_tech_support",
    email: "alex.chen@theexperts.com",
    phone: "+1234567805",
    bio: "IT consultant and tech support specialist with 15+ years helping individuals and small businesses with computer problems, network setup, and cybersecurity.",
    profileImage: "https://images.unsplash.com/photo-1629922949549-ae97b9843336?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMGNvbnN1bHRhbnRzfGVufDB8fHxibHVlfDE3NTEyNDI0NzF8MA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Austin", state: "TX", country: "USA", zipCode: "78704" },
    gender: "male", age: 37, isOnline: true, rating: 4.8,
    category: "Technology", specialty: "IT Support",
    hourlyRate: 95.00, sessionRate: 120.00,
    serviceArea: "Local & Remote", yearsOfExperience: 15,
    services: ["Computer Repair", "Network Setup", "Cybersecurity", "Tech Consulting"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "1313 Tech Center, Austin, TX 78704",
    payingForExposure: true, exposureLevel: "Local",
    monthlyFee: 50.00
  },

  // Real Estate
  {
    id: 17,
    firstName: "Rebecca",
    lastName: "Martinez",
    displayName: "Rebecca Martinez",
    username: "@rebecca_realtor",
    email: "rebecca.martinez@theexperts.com",
    phone: "+1234567806",
    bio: "Licensed real estate agent with 12+ years helping families buy and sell homes. Specialist in first-time home buyers and investment property consulting.",
    profileImage: "https://images.pexels.com/photos/7616608/pexels-photo-7616608.jpeg",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Tampa", state: "FL", country: "USA", zipCode: "33602" },
    gender: "female", age: 41, isOnline: true, rating: 4.8,
    category: "Real Estate", specialty: "Residential Sales",
    hourlyRate: 0.00, sessionRate: 0.00,
    serviceArea: "Local Area", yearsOfExperience: 12,
    services: ["Home Buying", "Home Selling", "Investment Properties", "Market Analysis"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "1414 Realty Row, Tampa, FL 33602",
    payingForExposure: true, exposureLevel: "Local",
    monthlyFee: 50.00
  },

  // Automotive Services
  {
    id: 18,
    firstName: "Tony",
    lastName: "Russo",
    displayName: "Tony Russo",
    username: "@tony_auto_expert",
    email: "tony.russo@theexperts.com",
    phone: "+1234567807",
    bio: "ASE certified automotive technician with 20+ years experience. Offering car diagnostic services, maintenance advice, and pre-purchase vehicle inspections.",
    profileImage: "https://images.unsplash.com/photo-1629922949549-ae97b9843336?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMGNvbnN1bHRhbnRzfGVufDB8fHxibHVlfDE3NTEyNDI0NzF8MA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Detroit", state: "MI", country: "USA", zipCode: "48201" },
    gender: "male", age: 47, isOnline: false, rating: 4.9,
    category: "Automotive", specialty: "Auto Repair",
    hourlyRate: 85.00, sessionRate: 100.00,
    serviceArea: "Local Area", yearsOfExperience: 20,
    services: ["Car Diagnostics", "Maintenance Advice", "Pre-Purchase Inspections", "Repair Estimates"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "1515 Auto Center, Detroit, MI 48201",
    payingForExposure: true, exposureLevel: "Local",
    monthlyFee: 50.00
  },

  // Pet Services
  {
    id: 19,
    firstName: "Dr. Emily",
    lastName: "Foster",
    displayName: "Dr. Emily Foster",
    username: "@dr_emily_vet",
    email: "emily.foster@theexperts.com",
    phone: "+1234567808",
    bio: "Licensed veterinarian with 14+ years caring for pets. Offering virtual consultations for pet health questions, nutrition advice, and behavioral concerns.",
    profileImage: "https://images.pexels.com/photos/7616608/pexels-photo-7616608.jpeg",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Nashville", state: "TN", country: "USA", zipCode: "37201" },
    gender: "female", age: 39, isOnline: true, rating: 4.8,
    category: "Pet Care", specialty: "Veterinary Medicine",
    hourlyRate: 120.00, sessionRate: 150.00,
    serviceArea: "Local & Virtual", yearsOfExperience: 14,
    services: ["Pet Health Consultations", "Nutrition Advice", "Behavioral Help", "Emergency Guidance"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "1616 Pet Care Clinic, Nashville, TN 37201",
    payingForExposure: true, exposureLevel: "State",
    monthlyFee: 50.00
  },

  // Financial Services
  {
    id: 20,
    firstName: "Robert",
    lastName: "Kim",
    displayName: "Robert Kim",
    username: "@robert_financial",
    email: "robert.kim@theexperts.com",
    phone: "+1234567809",
    bio: "Certified Financial Planner with 16+ years helping individuals and families plan for retirement, manage investments, and achieve financial goals.",
    profileImage: "https://images.unsplash.com/photo-1629922949549-ae97b9843336?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMGNvbnN1bHRhbnRzfGVufDB8fHxibHVlfDE3NTEyNDI0NzF8MA&ixlib=rb-4.1.0&q=85",
    coverImage: "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg",
    location: { city: "Charlotte", state: "NC", country: "USA", zipCode: "28202" },
    gender: "male", age: 44, isOnline: true, rating: 4.9,
    category: "Financial", specialty: "Financial Planning",
    hourlyRate: 175.00, sessionRate: 200.00,
    serviceArea: "State-wide & Virtual", yearsOfExperience: 16,
    services: ["Retirement Planning", "Investment Advice", "Financial Goal Setting", "Estate Planning"],
    availableFor: ["chat", "video_call", "in_person"],
    officeAddress: "1717 Financial Center, Charlotte, NC 28202",
    payingForExposure: true, exposureLevel: "State",
    monthlyFee: 50.00
  }
];

const mockContent = [
  {
    id: 1,
    performerId: 1,
    title: "Health & Wellness Consultation",
    description: "Comprehensive health assessment and personalized wellness recommendations. Book your virtual consultation today for expert medical guidance. 🩺",
    type: "consultation",
    mediaUrl: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxkb2N0b3J8ZW58MHx8fGJsdWV8MTc1MTI0MjQ3Nnww&ixlib=rb-4.1.0&q=85",
    thumbnail: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxkb2N0b3J8ZW58MHx8fGJsdWV8MTc1MTI0MjQ3Nnww&ixlib=rb-4.1.0&q=85",
    duration: "45:00",
    uploadType: "consultation",
    postType: "professional",
    subscriptionRequired: true,
    price: 200.00,
    likes: 240,
    comments: 56,
    views: 1200,
    isLocked: true,
    createdAt: "2024-01-20T08:30:00Z",
    updatedAt: "2024-01-20T08:30:00Z",
    tags: ["medical", "health", "consultation"],
    location: "Virtual Consultation",
    privacy: "clients"
  },
  {
    id: 2,
    performerId: 3,
    title: "Business Legal Guidance",
    description: "Expert legal advice for business contracts, compliance, and corporate structure. Get professional legal insights from an experienced attorney. ⚖️",
    type: "consultation",
    mediaUrl: "https://images.pexels.com/photos/7616608/pexels-photo-7616608.jpeg",
    thumbnail: "https://images.pexels.com/photos/7616608/pexels-photo-7616608.jpeg",
    uploadType: "consultation",
    postType: "professional",
    subscriptionRequired: false,
    price: 0,
    likes: 186,
    comments: 42,
    views: 980,
    isLocked: false,
    createdAt: "2024-01-19T15:20:00Z",
    updatedAt: "2024-01-19T15:20:00Z",
    tags: ["legal", "business", "consultation"],
    location: "Virtual/In-Person",
    privacy: "public"
  }
];

const mockStories = [
  {
    id: 1,
    performerId: 1,
    type: "consultation",
    mediaUrl: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxkb2N0b3J8ZW58MHx8fGJsdWV8MTc1MTI0MjQ3Nnww&ixlib=rb-4.1.0&q=85",
    duration: 15,
    text: "Available for health consultations today! 🩺",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    expiresAt: new Date(Date.now() + 23 * 3600000).toISOString(), // 23 hours from now
    views: 150,
    viewers: []
  }
];

// Header Component with Enhanced Features
export const Header = ({ showSearch = true, className = "" }) => {
  const { user, logout, userType, notifications } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length > 2) {
        try {
          // Simulate API call
          const results = mockPerformers.filter(performer =>
            performer.displayName.toLowerCase().includes(query.toLowerCase()) ||
            performer.username.toLowerCase().includes(query.toLowerCase())
          );
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/discover?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div className="flex flex-col">
                <span className="text-blue-600 font-bold text-lg leading-none" style={{fontFamily: 'sans-serif'}}>The Experts</span>
                <span className="text-gray-500 text-xs" style={{fontFamily: 'sans-serif'}}>Local Professional Network</span>
              </div>
            </a>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-lg mx-8 relative" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search experts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <div className="absolute left-3 top-2.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </form>
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                  {searchResults.map(performer => (
                    <a
                      key={performer.id}
                      href={`/profile/${performer.id}`}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={performer.profileImage}
                        alt={performer.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-gray-900 font-medium">{performer.displayName}</p>
                        <p className="text-gray-500 text-sm">{performer.specialty}</p>
                      </div>
                      {performer.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <a href="/categories" className="text-gray-600 hover:text-blue-600 transition-colors">
              Find Experts
            </a>
            <a href="/categories" className="text-gray-600 hover:text-blue-600 transition-colors">
              Categories
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a1 1 0 01-.5-.85V9a6 6 0 10-12 0v3.65a1 1 0 01-.5.85L0 17h5m5 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                      <div className="p-4">
                        <h3 className="text-gray-900 font-semibold mb-3">Notifications</h3>
                        {notifications.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No new notifications</p>
                        ) : (
                          notifications.map(notification => (
                            <div key={notification.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-900 text-sm">{notification.message}</p>
                              <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <a href="/messages" className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </a>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    <img 
                      src={user.profileImage || "https://images.unsplash.com/photo-1701286618296-b40443dc63a9"} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="hidden md:block">{user.displayName || user.firstName}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <a href={`/${userType}-dashboard`} className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                        Dashboard
                      </a>
                      <a href="/profile-setup" className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                        Profile
                      </a>
                      <a href="/wallet" className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                        Wallet
                      </a>
                      <a href="/settings" className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                        Settings
                      </a>
                      <div className="border-t border-gray-200"></div>
                      <button 
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <a 
                  href="/login"
                  className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Login
                </a>
                <a 
                  href="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all"
                >
                  Join Free
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Enhanced Home Page
export const HomePage = () => {
  const { user } = useUser();
  // Get featured performers using shared data
  const [featuredPerformers, setFeaturedPerformers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load featured experts from shared data
    setTimeout(() => {
      const allExperts = getAllExperts();
      setFeaturedPerformers(allExperts);
      setIsLoading(false);
    }, 1000);
  }, []);
  const [userLocation, setUserLocation] = useState(null);

  // Search by location function
  const searchByLocation = async () => {
    const zipCityInput = document.getElementById('zipCitySearch').value;
    const radius = document.getElementById('radiusSelect').value;
    
    if (!zipCityInput.trim()) {
      alert('Please enter a zip code or city name');
      return;
    }
    
    try {
      // Check if input is a zip code (5 digits) or city name
      const isZipCode = /^\d{5}$/.test(zipCityInput.trim());
      
      if (isZipCode) {
        // Handle zip code search
        window.location.href = `/categories?location=radius&zip=${zipCityInput}&radius=${radius}`;
      } else {
        // Handle city name search
        window.location.href = `/categories?location=radius&city=${encodeURIComponent(zipCityInput)}&radius=${radius}`;
      }
    } catch (error) {
      console.error('Location search failed:', error);
      alert('Location search failed. Please try again.');
    }
  };

  // Geo IP detection function
  const detectLocation = async () => {
    try {
      // Try browser geolocation first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // Use browser location for high accuracy
            const { latitude, longitude } = position.coords;
            
            // For demo, simulate reverse geocoding from coordinates
            const mockLocation = {
              city: "Boston",
              state: "MA", 
              country: "USA",
              coordinates: { lat: latitude, lng: longitude },
              source: "browser"
            };
            
            setUserLocation(mockLocation);
            window.location.href = `/categories?location=local&city=${mockLocation.city}&state=${mockLocation.state}`;
          },
          async (error) => {
            console.log('Browser geolocation failed, trying IP detection...');
            await detectLocationByIP();
          },
          { timeout: 5000 }
        );
      } else {
        // Fallback to IP geolocation
        await detectLocationByIP();
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      // Fallback to national if location detection fails
      window.location.href = '/categories?location=national';
    }
  };

  const detectLocationByIP = async () => {
    try {
      // Get API base URL from environment
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${API_BASE_URL}/api/detect-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('IP geolocation failed');
      }
      
      const data = await response.json();
      
      if (data.success && data.location) {
        const location = data.location;
        setUserLocation(location);
        
        // Create URL with complete location information including zip code if available
        const params = new URLSearchParams({
          location: 'local',
          city: location.city || '',
          state: location.state || '',
          country: location.country || '',
        });
        
        // Add zip code if available
        if (location.zip_code || location.zipCode || location.postal_code) {
          params.append('zip', location.zip_code || location.zipCode || location.postal_code);
        }
        
        // Redirect to categories with complete location information
        window.location.href = `/categories?${params.toString()}`;
      } else {
        throw new Error('Invalid location response');
      }
    } catch (error) {
      console.error('IP location detection failed:', error);
      // Fallback to national if IP detection fails
      window.location.href = '/categories?location=national';
    }
  };

  useEffect(() => {
    // Simulate API call to fetch featured performers - show diverse selection
    setTimeout(() => {
      // Select diverse experts from different categories
      const diverseSelection = [
        mockPerformers.find(p => p.id === 1), // Dr. Sarah Chen - Medical
        mockPerformers.find(p => p.id === 4), // James Wilson - Insurance  
        mockPerformers.find(p => p.id === 6), // David Thompson - Business
        mockPerformers.find(p => p.id === 8), // Professor Adams - Education
        mockPerformers.find(p => p.id === 11), // Amanda Rodriguez - Marketing
        mockPerformers.find(p => p.id === 13), // Mike Thompson - Home Services
        mockPerformers.find(p => p.id === 15), // Attorney Stone - Legal
        mockPerformers.find(p => p.id === 19) // Dr. Emily Foster - Pet Care
      ].filter(Boolean);
      
      setFeaturedPerformers(diverseSelection);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header showSearch={false} />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg')`
          }}
        />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent drop-shadow-2xl">
            The Experts
          </h1>
          <p className="text-xl md:text-2xl mb-6 text-gray-100 drop-shadow-lg">
            Find Local Experts. Get Professional Help.
          </p>
          <p className="text-lg mb-8 text-gray-200 max-w-2xl mx-auto drop-shadow-md">
            Step 1: Choose your location → Step 2: Browse categories → Step 3: Connect with experts. Always free for members.
          </p>
          
          {/* Search Bar */}
          <div className="mb-8 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for expertise... (e.g., family doctor, insurance agent, business consultant)"
                className="w-full px-6 py-4 text-lg rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    window.location.href = `/discover?search=${encodeURIComponent(e.target.value.trim())}`;
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  if (input.value.trim()) {
                    window.location.href = `/discover?search=${encodeURIComponent(input.value.trim())}`;
                  }
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                🔍 Search
              </button>
            </div>
            <p className="text-center text-gray-300 text-sm mt-2">
              Or browse by category below
            </p>
          </div>
          
          {/* Location and Category Selection */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-3xl mx-auto">
            <h3 className="text-white text-lg font-semibold mb-4">Find experts near you:</h3>
            
            {/* Step 1: Location Selection */}
            <div className="mb-6">
              <p className="text-white text-sm mb-3">Step 1: Choose your area or go national</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => detectLocation()}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg text-center transition-all flex items-center justify-center space-x-2"
                >
                  <span>📍</span>
                  <span>Use My Location</span>
                </button>
                <a 
                  href="/categories?location=national" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-lg text-center transition-all flex items-center justify-center space-x-2"
                >
                  <span>🌎</span>
                  <span>Browse National Experts</span>
                </a>
              </div>
              <p className="text-white/80 text-xs mt-3 text-center">
                Select your location to see experts in your area, or browse all national experts
              </p>
            </div>

            {/* Zip Code / City Search */}
            <div className="mb-6">
              <p className="text-white text-sm mb-3">Or search by location:</p>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-6">
                  <input 
                    type="text" 
                    id="zipCitySearch"
                    placeholder="Enter zip code or city name..." 
                    className="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 text-sm"
                  />
                </div>
                <div className="md:col-span-3">
                  <select 
                    id="radiusSelect"
                    className="w-full px-4 py-2 rounded-lg text-gray-900 text-sm"
                  >
                    <option value="5">Within 5 miles</option>
                    <option value="10">Within 10 miles</option>
                    <option value="25" selected>Within 25 miles</option>
                    <option value="50">Within 50 miles</option>
                    <option value="100">Within 100 miles</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <button 
                    onClick={() => searchByLocation()}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all text-sm"
                  >
                    Find Experts
                  </button>
                </div>
              </div>
            </div>

            {/* Or Search Directly */}
            <div>
              <p className="text-white text-sm mb-3">Or search directly:</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Search by name, specialty, or keyword..." 
                  className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 text-sm"
                />
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-all text-sm">
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href="/signup" 
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Join Free (Members)
            </a>
            <a 
              href="/signup?type=expert" 
              className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              List Your Services (Experts)
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Steps Stack */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xl text-white">📍</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Choose Location</h3>
                  <p className="text-gray-600 text-sm">
                    Start by selecting your area - national, state, city, or local experts who pay to be visible in your region.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xl text-white">🔍</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Find Experts</h3>
                  <p className="text-gray-600 text-sm">
                    Browse professionals by category or search by keyword. All experts invest in their visibility.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xl text-white">💬</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Get Help</h3>
                  <p className="text-gray-600 text-sm">
                    Connect directly with experts. Pay only for their time and services - joining is always free.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Search Now Button */}
            <div className="lg:w-64 w-full flex flex-col items-center lg:items-start">
              <div className="text-center lg:text-left mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start?</h3>
                <p className="text-gray-600">Find the right expert for your needs</p>
              </div>
              <a
                href="/categories"
                className="w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 transition-all text-center text-lg shadow-lg"
              >
                Search Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Experts Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            Featured Local <span className="text-green-600">Experts</span>
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Professionals in your area paying for visibility
          </p>
          
          {isLoading ? (
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-6">
              {featuredPerformers.slice(0, 8).map(performer => (
                <div key={performer.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                  <div className="relative">
                    <img 
                      src={performer.profileImage} 
                      alt={performer.displayName}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        FEATURED
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        performer.isOnline 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {performer.isOnline ? 'Available' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{performer.displayName}</h3>
                    <p className="text-green-600 text-sm mb-1 font-medium">{performer.specialty}</p>
                    <p className="text-gray-500 text-xs mb-2">{performer.location.city}, {performer.location.state}</p>
                    <p className="text-gray-700 mb-3 text-sm line-clamp-2">{performer.bio}</p>
                    
                    {/* Service Options */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Services:</span>
                        <span className="text-xs text-gray-900 font-medium">
                          ${performer.hourlyRate || performer.sessionRate}/hr
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {performer.availableFor.includes('chat') && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">💬 Chat</span>
                        )}
                        {performer.availableFor.includes('video_call') && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">📹 Video</span>
                        )}
                        {performer.availableFor.includes('in_person') && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">🏢 Office</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <a 
                        href={`/profile/${performer.id}`}
                        className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded text-xs text-center hover:bg-gray-200 transition-all block"
                      >
                        View Profile
                      </a>
                      <div className="flex gap-2">
                        <a 
                          href={`/chat/${performer.id}`}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-xs text-center hover:bg-blue-600 transition-all"
                        >
                          Chat Now
                        </a>
                        <a 
                          href={`/book/${performer.id}`}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded text-xs text-center hover:from-blue-600 hover:to-green-600 transition-all"
                        >
                          Book Appt
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* View All Button */}
          <div className="text-center mt-8">
            <a 
              href="/discover"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all"
            >
              View All Experts
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-green-500">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white mb-8 opacity-90">
            Join free as a member, or list your services as an expert (pay only when you publish)
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href="/signup"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Join Free (Members)
            </a>
            <a 
              href="/signup?type=expert"
              className="px-8 py-3 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all"
            >
              Become an Expert
            </a>
          </div>
          <p className="text-white text-sm mt-4 opacity-75">
            Members: Always free • Experts: Pay when you publish your profile
          </p>
        </div>
      </section>
    </div>
  );
};

// Enhanced Login Page
export const LoginPage = () => {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'member'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, formData.userType);
    
    if (result.success) {
      window.location.href = `/${formData.userType}-dashboard`;
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header showSearch={false} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400">Sign in to your The Experts account</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.userType === 'member' 
                    ? 'border-pink-500 bg-pink-500 bg-opacity-10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="userType"
                    value="member"
                    checked={formData.userType === 'member'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">👤</div>
                    <div className="text-sm font-medium">Member</div>
                  </div>
                </label>
                
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.userType === 'performer' 
                    ? 'border-pink-500 bg-pink-500 bg-opacity-10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="userType"
                    value="performer"
                    checked={formData.userType === 'performer'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="text-sm font-medium">Expert</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="text-pink-500 focus:ring-pink-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-400">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-pink-400 hover:text-pink-300">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              
              <button className="w-full px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <a href="/signup" className="text-pink-400 hover:text-pink-300 font-medium">
                Sign up now
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Sign Up Page
export const SignUpPage = () => {
  const { signup } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'member',
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToAge: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms || !formData.agreeToPrivacy || !formData.agreeToAge) {
      setError('Please agree to all terms and conditions');
      setIsLoading(false);
      return;
    }

    const result = await signup(formData);
    
    if (result.success) {
      setSuccess(result.message);
      // Redirect to login after a delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header showSearch={false} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="w-full max-w-lg">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent mb-2">
              Join The Experts
            </h1>
            <p className="text-gray-400">Create your account and start your journey</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.userType === 'member' 
                    ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="userType"
                    value="member"
                    checked={formData.userType === 'member'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">👤</div>
                    <div className="text-sm font-medium">Member</div>
                    <div className="text-xs text-gray-400 mt-1">Seek expertise</div>
                  </div>
                </label>
                
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.userType === 'expert' 
                    ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="userType"
                    value="expert"
                    checked={formData.userType === 'expert'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">🎓</div>
                    <div className="text-sm font-medium">Expert</div>
                    <div className="text-xs text-gray-400 mt-1">Provide expertise</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="First name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 pr-12"
                  placeholder="Create a password"
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeToAge}
                  onChange={(e) => setFormData({...formData, agreeToAge: e.target.checked})}
                  className="text-pink-500 focus:ring-pink-500 rounded mt-1"
                />
                <span className="ml-2 text-sm text-gray-400">
                  I confirm that I am 18 years or older
                </span>
              </label>
              
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                  className="text-pink-500 focus:ring-pink-500 rounded mt-1"
                />
                <span className="ml-2 text-sm text-gray-400">
                  I agree to the{' '}
                  <a href="/terms" className="text-pink-400 hover:text-pink-300">
                    Terms and Conditions
                  </a>
                </span>
              </label>
              
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeToPrivacy}
                  onChange={(e) => setFormData({...formData, agreeToPrivacy: e.target.checked})}
                  className="text-pink-500 focus:ring-pink-500 rounded mt-1"
                />
                <span className="ml-2 text-sm text-gray-400">
                  I agree to the{' '}
                  <a href="/privacy" className="text-pink-400 hover:text-pink-300">
                    Privacy Policy
                  </a>
                  {' '}and{' '}
                  <a href="/cookies" className="text-pink-400 hover:text-pink-300">
                    Cookie Policy
                  </a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-pink-400 hover:text-pink-300 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other pages - will be implemented in next iterations
export const ForgotPasswordPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/login" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Login
      </a>
    </div>
  </div>
);

export const VerifyOTPPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Verify OTP</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/login" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Login
      </a>
    </div>
  </div>
);

export const ProfileSetupPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Profile Setup</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

export const BankVerificationPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Bank Verification</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

// Import enhanced components
export { MemberDashboard } from './enhanced-components';

// Enhanced Performer Dashboard with Geo-Location Settings
export const PerformerDashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [monthlyFee, setMonthlyFee] = useState(0);
  const [hasSetExpertise, setHasSetExpertise] = useState(false);

  // Expertise categories with monthly fees
  const expertiseCategories = [
    { id: 'medical', name: 'Medical & Healthcare', fee: 125, demand: 'high' },
    { id: 'legal', name: 'Legal Services', fee: 150, demand: 'high' },
    { id: 'financial', name: 'Financial Planning', fee: 100, demand: 'high' },
    { id: 'business', name: 'Business Consulting', fee: 100, demand: 'high' },
    { id: 'insurance', name: 'Insurance Services', fee: 75, demand: 'medium' },
    { id: 'education', name: 'Education & Tutoring', fee: 60, demand: 'medium' },
    { id: 'technology', name: 'Technology & IT', fee: 110, demand: 'high' },
    { id: 'marketing', name: 'Marketing & Advertising', fee: 85, demand: 'medium' },
    { id: 'real_estate', name: 'Real Estate', fee: 90, demand: 'medium' },
    { id: 'accounting', name: 'Accounting & Tax', fee: 95, demand: 'medium' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'expertise', label: 'Expertise & Billing', icon: '🎯' },
    { id: 'content', label: 'Content', icon: '🎥' },
    { id: 'geolocation', label: 'Location Settings', icon: '🌍' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Expert Dashboard</h1>
          <p className="text-gray-400">Manage your consultations, earnings, and profile settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {/* Trial Status */}
          <TrialStatusComponent />
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
                <div className="text-3xl font-bold text-green-400 mb-2">$2,456</div>
                <p className="text-gray-400">This month</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Subscribers</h3>
                <div className="text-3xl font-bold text-blue-400 mb-2">1,234</div>
                <p className="text-gray-400">Active subscribers</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Content Views</h3>
                <div className="text-3xl font-bold text-purple-400 mb-2">45.6K</div>
                <p className="text-gray-400">Total views</p>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Content Management</h3>
              <p className="text-gray-400">Upload and manage your photos, videos, and live streams.</p>
              <div className="mt-6">
                <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all">
                  Upload Content
                </button>
              </div>
            </div>
          )}

          {activeTab === 'geolocation' && user && (
            <div>
              {/* Import the GeolocationSettings component */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">🌍 Location & Access Settings</h3>
                <p className="text-gray-400 mb-6">
                  Control who can access your profile based on their location and set subscription requirements.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-white font-medium mb-2">🗺️ Geographic Controls</h4>
                    <p className="text-gray-400 text-sm">Set which countries, states, or cities can access your profile</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-white font-medium mb-2">💳 Subscription Types</h4>
                    <p className="text-gray-400 text-sm">Configure free, monthly, pay-per-visit, or teaser access</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-white font-medium mb-2">⏱️ Teaser Settings</h4>
                    <p className="text-gray-400 text-sm">Set preview duration (15-300 seconds) before payment required</p>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-white font-medium mb-2">🚫 User Blocking</h4>
                    <p className="text-gray-400 text-sm">Block users for harassment, inappropriate behavior, etc.</p>
                  </div>
                </div>
                <div className="text-center">
                  <a 
                    href={`/performer/${user.id}/geolocation-settings`}
                    className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
                  >
                    Configure Location Settings
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Analytics & Insights</h3>
              <p className="text-gray-400">View detailed analytics about your content performance and audience.</p>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Earnings & Payouts</h3>
              <p className="text-gray-400">Track your earnings, manage payouts, and view transaction history.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Account Settings</h3>
              <p className="text-gray-400">Manage your account preferences, privacy settings, and profile information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// More placeholder components
export const ProfilePage = () => {
  // This component is now replaced by the standalone ProfilePage.js file
  // This export is kept for compatibility
  return null;
};

export const StorePage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Store Page</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const StreamingPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Streaming Page</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const MessagingPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const SettingsPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const AdminLogin = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const PostDetailPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Post Details</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const SubscriptionPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Subscription</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const PaymentPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Payment</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const WalletPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Wallet</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const NotificationsPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <p className="text-gray-400">This page will be implemented in the next iteration.</p>
    </div>
  </div>
);

export const PaymentSuccessPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4 text-green-400">Payment Successful!</h1>
      <p className="text-gray-400 mb-6">Your payment has been processed successfully.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300">
        Return to Home
      </a>
    </div>
  </div>
);

export const PaymentCancelledPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-2xl font-bold mb-4 text-red-400">Payment Cancelled</h1>
      <p className="text-gray-400 mb-6">Your payment has been cancelled.</p>
      <a href="/" className="text-pink-400 hover:text-pink-300">
        Return to Home
      </a>
    </div>
  </div>
);