# THE EXPERTS PLATFORM - MEMBER BACKEND API DOCUMENTATION

## 🚀 Base URL
```
http://localhost:8001/api
```

## 🔐 Authentication Endpoints

### 1. Register Member
```http
POST /members/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "agreesToTerms": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "user_id": "uuid-here",
  "email_sent": true,
  "verification_required": true
}
```

### 2. Login Member
```http
POST /members/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "userType": "member",
    "isVerified": false,
    "profileImage": null,
    "accountStatus": "pending_verification"
  },
  "access_token": "jwt-token-here",
  "token_type": "bearer",
  "expires_in": 1800,
  "session_id": "session-uuid"
}
```

### 3. Logout Member
```http
POST /members/logout
Content-Type: application/json

{
  "session_token": "jwt-token-here"
}
```

### 4. Forgot Password
```http
POST /members/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## 💰 Affiliate System Integration

### 1. Create Affiliate Account
```http
POST /affiliate/create?member_id={member_id}
```

### 2. Get Affiliate Stats
```http
GET /affiliate/{member_id}/stats
```

## 💳 Credits System Integration

### 1. Create Credit Account
```http
POST /credits/create-account?user_id={user_id}
```

### 2. Get Credit Balance
```http
GET /credits/{user_id}/balance
```

## 🔍 Expert Discovery Integration

### 1. Search Experts
```http
GET /experts/discover?category=medical&status=online&experienceLevel=expert
```

## 📱 Testing Instructions

### Using curl:
```bash
# Test Registration
curl -X POST "http://localhost:8001/api/members/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User","agreesToTerms":true}'

# Test Login
curl -X POST "http://localhost:8001/api/members/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Using Browser:
1. Open `/app/backend/api_tester.html` in your browser
2. Use the interactive interface to test all endpoints

### Using Postman:
1. Import the API endpoints into Postman
2. Set base URL to `http://localhost:8001/api`
3. Test each endpoint with sample data

## 🛠️ Development Notes

- All passwords must be at least 8 characters
- Members must agree to terms of service
- Email verification is required for full account activation
- JWT tokens expire in 30 minutes
- Automatic affiliate and credit account creation on registration
- Comprehensive input validation on all endpoints
- Secure password hashing with bcrypt
- Session management with database tracking

## 🔧 Backend Architecture

- **FastAPI** - Modern Python web framework
- **MongoDB** - Document database for user data
- **JWT** - Token-based authentication
- **Bcrypt** - Secure password hashing
- **Service Layer** - Clean separation of concerns
- **Pydantic** - Data validation and serialization