from datetime import datetime, timedelta
from api_key_models import ExpertProfile, ExpertiseCategory, ExpertiseLevel, Ethnicity
import random

# Sample expert profiles data for "The Experts" platform
SAMPLE_EXPERTS = [
    # Legal Experts
    {
        "user_id": "legal_expert_001",
        "professional_name": "Dr. Sarah Chen",
        "title": "Senior Corporate Attorney",
        "bio": "Experienced corporate lawyer specializing in mergers & acquisitions, contract law, and business compliance. Harvard Law graduate with 15+ years helping businesses navigate complex legal challenges.",
        "age": 42,
        "expertise_category": ExpertiseCategory.LEGAL,
        "expertise_level": ExpertiseLevel.EXPERT,
        "ethnicity": Ethnicity.ASIAN,
        "country": "United States",
        "state": "New York",
        "city": "New York City",
        "show_exact_location": True,
        "specializations": ["Corporate Law", "Mergers & Acquisitions", "Contract Negotiation", "Business Compliance"],
        "credentials": ["J.D. Harvard Law School", "NY State Bar", "American Bar Association"],
        "licenses": ["New York State Bar License", "Federal Bar Admission"],
        "education": [
            {"degree": "J.D.", "institution": "Harvard Law School", "year": "2008"},
            {"degree": "B.A. Economics", "institution": "Stanford University", "year": "2005"}
        ],
        "years_of_experience": 15,
        "languages": ["english", "mandarin"],
        "consultation_types": ["Legal Consultation", "Document Review", "Contract Analysis"],
        "online_status": "online",
        "timezone": "America/New_York",
        "consultation_rates": {"hourly_consultation": 350.0, "document_review": 200.0, "contract_analysis": 400.0},
        "minimum_consultation_fee": 150.0,
        "is_verified": True,
        "total_consultations": 1247,
        "total_clients": 389,
        "total_reviews": 234,
        "average_rating": 4.9,
        "rating_count": 234,
        "success_rate": 96.5
    },
    {
        "user_id": "legal_expert_002",
        "professional_name": "Marcus Williams",
        "title": "Family Law Attorney",
        "bio": "Compassionate family law attorney with expertise in divorce, child custody, and family mediation. Dedicated to helping families navigate difficult times with dignity and care.",
        "age": 38,
        "expertise_category": ExpertiseCategory.LEGAL,
        "expertise_level": ExpertiseLevel.EXPERIENCED,
        "ethnicity": Ethnicity.BLACK,
        "country": "United States",
        "state": "California",
        "city": "Los Angeles",
        "show_exact_location": True,
        "specializations": ["Family Law", "Divorce Proceedings", "Child Custody", "Mediation"],
        "credentials": ["J.D. UCLA School of Law", "CA State Bar", "Certified Family Mediator"],
        "licenses": ["California State Bar License", "Family Mediation Certification"],
        "education": [
            {"degree": "J.D.", "institution": "UCLA School of Law", "year": "2009"},
            {"degree": "B.A. Political Science", "institution": "Howard University", "year": "2006"}
        ],
        "years_of_experience": 14,
        "languages": ["english", "spanish"],
        "consultation_types": ["Family Consultation", "Mediation Services", "Legal Document Prep"],
        "online_status": "online",
        "timezone": "America/Los_Angeles",
        "consultation_rates": {"hourly_consultation": 275.0, "mediation": 300.0, "document_prep": 150.0},
        "minimum_consultation_fee": 100.0,
        "is_verified": True,
        "total_consultations": 892,
        "total_clients": 267,
        "total_reviews": 189,
        "average_rating": 4.8,
        "rating_count": 189,
        "success_rate": 94.2
    },

    # Medical Experts
    {
        "user_id": "medical_expert_001",
        "professional_name": "Dr. Priya Patel",
        "title": "Board-Certified Internal Medicine Physician",
        "bio": "Internal medicine physician with expertise in preventive care, chronic disease management, and wellness consultation. Committed to providing personalized healthcare guidance.",
        "age": 35,
        "expertise_category": ExpertiseCategory.MEDICAL,
        "expertise_level": ExpertiseLevel.EXPERT,
        "ethnicity": Ethnicity.ASIAN,
        "country": "United States",
        "state": "Texas",
        "city": "Houston",
        "show_exact_location": True,
        "specializations": ["Internal Medicine", "Preventive Care", "Chronic Disease Management", "Wellness Consultation"],
        "credentials": ["M.D. Johns Hopkins", "Board Certified Internal Medicine", "American College of Physicians"],
        "licenses": ["Texas Medical License", "DEA License"],
        "education": [
            {"degree": "M.D.", "institution": "Johns Hopkins School of Medicine", "year": "2012"},
            {"degree": "B.S. Biology", "institution": "University of Texas", "year": "2008"}
        ],
        "years_of_experience": 11,
        "languages": ["english", "hindi", "gujarati"],
        "consultation_types": ["Medical Consultation", "Health Assessment", "Wellness Planning"],
        "online_status": "online",
        "timezone": "America/Chicago",
        "consultation_rates": {"medical_consultation": 200.0, "health_assessment": 150.0, "wellness_planning": 175.0},
        "minimum_consultation_fee": 75.0,
        "is_verified": True,
        "total_consultations": 1456,
        "total_clients": 623,
        "total_reviews": 445,
        "average_rating": 4.9,
        "rating_count": 445,
        "success_rate": 97.8
    },

    # Financial Experts
    {
        "user_id": "financial_expert_001",
        "professional_name": "Jennifer Thompson",
        "title": "Certified Financial Planner",
        "bio": "CFP with 12+ years helping individuals and families achieve their financial goals through comprehensive planning, investment strategies, and retirement planning.",
        "age": 40,
        "expertise_category": ExpertiseCategory.FINANCIAL,
        "expertise_level": ExpertiseLevel.EXPERT,
        "ethnicity": Ethnicity.WHITE,
        "country": "United States",
        "state": "Florida",
        "city": "Miami",
        "show_exact_location": True,
        "specializations": ["Financial Planning", "Investment Strategy", "Retirement Planning", "Tax Planning"],
        "credentials": ["CFP Certification", "Series 7 License", "Series 66 License"],
        "licenses": ["CFP Board Certification", "FINRA Series 7", "FINRA Series 66"],
        "education": [
            {"degree": "M.B.A. Finance", "institution": "University of Miami", "year": "2011"},
            {"degree": "B.S. Business Administration", "institution": "Florida State University", "year": "2007"}
        ],
        "years_of_experience": 12,
        "languages": ["english", "spanish"],
        "consultation_types": ["Financial Planning", "Investment Review", "Retirement Consultation"],
        "online_status": "online",
        "timezone": "America/New_York",
        "consultation_rates": {"financial_planning": 250.0, "investment_review": 200.0, "retirement_planning": 300.0},
        "minimum_consultation_fee": 100.0,
        "is_verified": True,
        "total_consultations": 734,
        "total_clients": 298,
        "total_reviews": 187,
        "average_rating": 4.8,
        "rating_count": 187,
        "success_rate": 95.3
    },

    # Accounting Experts
    {
        "user_id": "accounting_expert_001",
        "professional_name": "David Kim",
        "title": "CPA & Tax Specialist",
        "bio": "Certified Public Accountant specializing in individual and business tax preparation, financial analysis, and small business accounting. Expert in tax law and financial compliance.",
        "age": 44,
        "expertise_category": ExpertiseCategory.ACCOUNTING,
        "expertise_level": ExpertiseLevel.EXPERT,
        "ethnicity": Ethnicity.ASIAN,
        "country": "United States",
        "state": "Washington",
        "city": "Seattle",
        "show_exact_location": True,
        "specializations": ["Tax Preparation", "Business Accounting", "Financial Analysis", "IRS Representation"],
        "credentials": ["CPA License", "Enrolled Agent (EA)", "QuickBooks ProAdvisor"],
        "licenses": ["Washington State CPA License", "IRS Enrolled Agent"],
        "education": [
            {"degree": "M.S. Accounting", "institution": "University of Washington", "year": "2003"},
            {"degree": "B.S. Business", "institution": "Western Washington University", "year": "2001"}
        ],
        "years_of_experience": 20,
        "languages": ["english", "korean"],
        "consultation_types": ["Tax Consultation", "Accounting Review", "Financial Analysis"],
        "online_status": "online",
        "timezone": "America/Los_Angeles",
        "consultation_rates": {"tax_consultation": 175.0, "accounting_review": 150.0, "financial_analysis": 200.0},
        "minimum_consultation_fee": 75.0,
        "is_verified": True,
        "total_consultations": 1123,
        "total_clients": 456,
        "total_reviews": 334,
        "average_rating": 4.9,
        "rating_count": 334,
        "success_rate": 98.1
    },

    # Business Experts
    {
        "user_id": "business_expert_001",
        "professional_name": "Amara Johnson",
        "title": "Business Strategy Consultant",
        "bio": "Former Fortune 500 executive turned business consultant. Specializing in strategic planning, operational efficiency, and startup advisory. MBA from Wharton.",
        "age": 39,
        "expertise_category": ExpertiseCategory.BUSINESS,
        "expertise_level": ExpertiseLevel.EXPERT,
        "ethnicity": Ethnicity.BLACK,
        "country": "United States",
        "state": "Illinois",
        "city": "Chicago",
        "show_exact_location": True,
        "specializations": ["Strategic Planning", "Operations Management", "Startup Advisory", "Business Development"],
        "credentials": ["MBA Wharton", "PMP Certification", "Six Sigma Black Belt"],
        "licenses": ["Project Management Professional", "Six Sigma Certification"],
        "education": [
            {"degree": "M.B.A.", "institution": "Wharton School, University of Pennsylvania", "year": "2008"},
            {"degree": "B.S. Industrial Engineering", "institution": "Northwestern University", "year": "2006"}
        ],
        "years_of_experience": 15,
        "languages": ["english", "french"],
        "consultation_types": ["Business Strategy", "Operations Review", "Startup Consultation"],
        "online_status": "online",
        "timezone": "America/Chicago",
        "consultation_rates": {"strategy_consultation": 300.0, "operations_review": 250.0, "startup_advisory": 275.0},
        "minimum_consultation_fee": 125.0,
        "is_verified": True,
        "total_consultations": 567,
        "total_clients": 189,
        "total_reviews": 145,
        "average_rating": 4.9,
        "rating_count": 145,
        "success_rate": 96.8
    },

    # Technology Experts
    {
        "user_id": "technology_expert_001",
        "professional_name": "Alex Rodriguez",
        "title": "Senior Software Architect",
        "bio": "Senior software architect with 18+ years in technology. Expert in cloud architecture, system design, and digital transformation. Former tech lead at major Silicon Valley companies.",
        "age": 41,
        "expertise_category": ExpertiseCategory.TECHNOLOGY,
        "expertise_level": ExpertiseLevel.EXPERT,
        "ethnicity": Ethnicity.HISPANIC,
        "country": "United States",
        "state": "California",
        "city": "San Francisco",
        "show_exact_location": True,
        "specializations": ["Cloud Architecture", "System Design", "Digital Transformation", "Technical Leadership"],
        "credentials": ["AWS Solutions Architect", "Azure Certified", "Google Cloud Professional"],
        "licenses": ["AWS Solutions Architect Professional", "Microsoft Azure Solutions Architect"],
        "education": [
            {"degree": "M.S. Computer Science", "institution": "Stanford University", "year": "2005"},
            {"degree": "B.S. Computer Engineering", "institution": "UC Berkeley", "year": "2003"}
        ],
        "years_of_experience": 18,
        "languages": ["english", "spanish"],
        "consultation_types": ["Technical Architecture", "Code Review", "Technology Strategy"],
        "online_status": "online",
        "timezone": "America/Los_Angeles",
        "consultation_rates": {"architecture_consultation": 400.0, "code_review": 300.0, "tech_strategy": 450.0},
        "minimum_consultation_fee": 200.0,
        "is_verified": True,
        "total_consultations": 423,
        "total_clients": 156,
        "total_reviews": 98,
        "average_rating": 4.8,
        "rating_count": 98,
        "success_rate": 97.2
    },

    # Education Experts
    {
        "user_id": "education_expert_001",
        "professional_name": "Dr. Fatima Al-Rashid",
        "title": "Educational Psychology Specialist",
        "bio": "Educational psychologist and learning specialist with expertise in curriculum development, learning disabilities, and academic coaching. Ph.D. in Educational Psychology.",
        "age": 37,
        "expertise_category": ExpertiseCategory.EDUCATION,
        "expertise_level": ExpertiseLevel.EXPERT,
        "ethnicity": Ethnicity.MIDDLE_EASTERN,
        "country": "United States",
        "state": "Massachusetts",
        "city": "Boston",
        "show_exact_location": True,
        "specializations": ["Educational Psychology", "Learning Disabilities", "Curriculum Development", "Academic Coaching"],
        "credentials": ["Ph.D. Educational Psychology", "Licensed School Psychologist", "Certified Learning Specialist"],
        "licenses": ["Massachusetts School Psychology License", "Learning Disabilities Specialist Certification"],
        "education": [
            {"degree": "Ph.D. Educational Psychology", "institution": "Harvard Graduate School of Education", "year": "2010"},
            {"degree": "M.Ed. Special Education", "institution": "Boston University", "year": "2007"},
            {"degree": "B.A. Psychology", "institution": "Wellesley College", "year": "2005"}
        ],
        "years_of_experience": 13,
        "languages": ["english", "arabic"],
        "consultation_types": ["Educational Assessment", "Learning Support", "Academic Planning"],
        "online_status": "online",
        "timezone": "America/New_York",
        "consultation_rates": {"educational_assessment": 200.0, "learning_support": 150.0, "academic_planning": 175.0},
        "minimum_consultation_fee": 75.0,
        "is_verified": True,
        "total_consultations": 845,
        "total_clients": 312,
        "total_reviews": 267,
        "average_rating": 4.9,
        "rating_count": 267,
        "success_rate": 95.7
    },

    # Marketing Experts
    {
        "user_id": "marketing_expert_001",
        "professional_name": "Lisa Chang",
        "title": "Digital Marketing Strategist",
        "bio": "Digital marketing expert specializing in social media strategy, content marketing, and brand development. Former marketing director at top-tier agencies with proven ROI results.",
        "age": 33,
        "expertise_category": ExpertiseCategory.MARKETING,
        "expertise_level": ExpertiseLevel.EXPERIENCED,
        "ethnicity": Ethnicity.ASIAN,
        "country": "United States",
        "state": "New York",
        "city": "New York City",
        "show_exact_location": True,
        "specializations": ["Digital Marketing", "Social Media Strategy", "Content Marketing", "Brand Development"],
        "credentials": ["Google Ads Certified", "Facebook Blueprint Certified", "HubSpot Certified"],
        "licenses": ["Google Ads Professional", "Facebook Marketing Professional"],
        "education": [
            {"degree": "M.B.A. Marketing", "institution": "Columbia Business School", "year": "2014"},
            {"degree": "B.A. Communications", "institution": "NYU", "year": "2012"}
        ],
        "years_of_experience": 9,
        "languages": ["english", "mandarin"],
        "consultation_types": ["Marketing Strategy", "Campaign Review", "Brand Consultation"],
        "online_status": "online",
        "timezone": "America/New_York",
        "consultation_rates": {"marketing_strategy": 225.0, "campaign_review": 175.0, "brand_consultation": 250.0},
        "minimum_consultation_fee": 100.0,
        "is_verified": True,
        "total_consultations": 389,
        "total_clients": 145,
        "total_reviews": 112,
        "average_rating": 4.7,
        "rating_count": 112,
        "success_rate": 93.8
    },

    # Real Estate Experts
    {
        "user_id": "real_estate_expert_001",
        "professional_name": "Robert Jackson",
        "title": "Licensed Real Estate Broker",
        "bio": "Licensed real estate broker with 16+ years in residential and commercial real estate. Expert in property investment, market analysis, and real estate law.",
        "age": 48,
        "expertise_category": ExpertiseCategory.REAL_ESTATE,
        "expertise_level": ExpertiseLevel.EXPERT,
        "ethnicity": Ethnicity.BLACK,
        "country": "United States",
        "state": "Georgia",
        "city": "Atlanta",
        "show_exact_location": True,
        "specializations": ["Property Investment", "Market Analysis", "Real Estate Law", "Commercial Real Estate"],
        "credentials": ["Real Estate Broker License", "CCIM Designation", "Property Management License"],
        "licenses": ["Georgia Real Estate Broker License", "Property Management License"],
        "education": [
            {"degree": "M.B.A. Real Estate", "institution": "Georgia State University", "year": "2007"},
            {"degree": "B.S. Finance", "institution": "Morehouse College", "year": "2005"}
        ],
        "years_of_experience": 16,
        "languages": ["english"],
        "consultation_types": ["Real Estate Investment", "Property Analysis", "Market Consultation"],
        "online_status": "online",
        "timezone": "America/New_York",
        "consultation_rates": {"investment_consultation": 275.0, "property_analysis": 200.0, "market_consultation": 225.0},
        "minimum_consultation_fee": 100.0,
        "is_verified": True,
        "total_consultations": 634,
        "total_clients": 234,
        "total_reviews": 178,
        "average_rating": 4.8,
        "rating_count": 178,
        "success_rate": 94.5
    }
]

async def create_sample_experts(db):
    """Create sample expert profiles in the database"""
    created_count = 0
    
    for expert_data in SAMPLE_EXPERTS:
        # Check if expert already exists
        existing = await db.expert_profiles.find_one({"user_id": expert_data["user_id"]})
        
        if not existing:
            # Add timestamps and additional fields
            expert_data.update({
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "last_active": datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
                "show_in_search": True,
                "allow_location_search": True,
                "account_status": "active",
                "verification_level": "verified" if expert_data["is_verified"] else "basic",
                "accepts_pro_bono": random.choice([True, False]),
                "location_radius_km": 50
            })
            
            try:
                await db.expert_profiles.insert_one(expert_data)
                created_count += 1
                print(f"Created expert: {expert_data['professional_name']}")
            except Exception as e:
                print(f"Error creating expert {expert_data['professional_name']}: {str(e)}")
    
    return created_count

# Function to get a random expert for "Expert of the Month"
def get_featured_expert_candidates():
    """Get high-rated experts suitable for featuring"""
    return [e for e in SAMPLE_EXPERTS if e["average_rating"] >= 4.8 and e["is_verified"]]