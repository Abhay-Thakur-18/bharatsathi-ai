# BharatSathi AI - API Documentation

Complete API reference for all endpoints.

**Base URL**: `http://127.0.0.1:8000`

**Authentication**: Bearer token in `Authorization` header for protected endpoints

---

## Table of Contents

1. [Authentication](#authentication)
2. [AI Chat](#ai-chat)
3. [Government Schemes](#government-schemes)
4. [Healthcare](#healthcare)
5. [Agriculture](#agriculture)
6. [Career Guidance](#career-guidance)
7. [Health Check](#health-check)

---

## Authentication

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user_id": "507f1f77bcf86cd799439011"
}
```

---

### Login
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Get Current User
**GET** `/auth/me` 🔒

Get authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

## AI Chat

### Send Message
**POST** `/chat/` 🔒

Send a message and get AI response.

**Request Body:**
```json
{
  "message": "Tell me about PM-KISAN scheme",
  "conversation_id": "optional_existing_conversation_id",
  "category": "schemes"
}
```

**Response (201 Created):**
```json
{
  "conversation_id": "507f1f77bcf86cd799439012",
  "user_message": {
    "id": "507f1f77bcf86cd799439013",
    "role": "user",
    "content": "Tell me about PM-KISAN scheme",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "assistant_message": {
    "id": "507f1f77bcf86cd799439014",
    "role": "assistant",
    "content": "PM-KISAN is an income support scheme...",
    "created_at": "2024-01-15T10:30:02Z"
  }
}
```

---

### Get Conversations
**GET** `/chat/conversations?skip=0&limit=50` 🔒

Get all user conversations.

**Response (200 OK):**
```json
{
  "conversations": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "PM-KISAN Scheme Discussion",
      "category": "schemes",
      "message_count": 6,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:35:00Z"
    }
  ],
  "total": 1
}
```

---

### Get Conversation History
**GET** `/chat/conversations/{conversation_id}` 🔒

Get specific conversation with all messages.

**Response (200 OK):**
```json
{
  "conversation": {
    "id": "507f1f77bcf86cd799439012",
    "title": "PM-KISAN Scheme Discussion",
    "category": "schemes",
    "message_count": 6,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:35:00Z"
  },
  "messages": [
    {
      "id": "507f1f77bcf86cd799439013",
      "role": "user",
      "content": "Tell me about PM-KISAN",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "role": "assistant",
      "content": "PM-KISAN is...",
      "created_at": "2024-01-15T10:30:02Z"
    }
  ]
}
```

---

### Update Conversation Title
**PATCH** `/chat/conversations/{conversation_id}/title` 🔒

**Request Body:**
```json
{
  "title": "New Title"
}
```

**Response (200 OK):**
```json
{
  "message": "Title updated successfully"
}
```

---

### Delete Conversation
**DELETE** `/chat/conversations/{conversation_id}` 🔒

**Response (204 No Content)**

---

## Government Schemes

### Search Schemes
**GET** `/schemes/?query=farmer&category=agriculture&page=1&per_page=20` 🔒

Search and filter government schemes.

**Query Parameters:**
- `query` (optional): Search text
- `category` (optional): Filter by category
- `state` (optional): Filter by state
- `is_central` (optional): true/false for central/state schemes
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "schemes": [
    {
      "id": "507f1f77bcf86cd799439015",
      "name": "PM-KISAN",
      "description": "Income support scheme...",
      "category": "agriculture",
      "eligibility": ["Small farmers", "Landowners"],
      "benefits": ["₹6,000 per year", "Direct transfer"],
      "how_to_apply": "Register on PM-KISAN portal",
      "official_website": "https://pmkisan.gov.in",
      "documents_required": ["Aadhaar", "Land documents"],
      "target_audience": ["Farmers"],
      "ministry": "Ministry of Agriculture",
      "is_central": true,
      "views_count": 150
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20
}
```

---

### Get Categories
**GET** `/schemes/categories` 🔒

**Response (200 OK):**
```json
{
  "categories": [
    "financial_inclusion",
    "healthcare",
    "agriculture",
    "employment",
    "women_welfare",
    "housing",
    "skill_development",
    "pension"
  ]
}
```

---

### Get Scheme Details
**GET** `/schemes/{scheme_id}` 🔒

Get detailed information about a specific scheme.

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439015",
  "name": "PM-KISAN",
  "description": "Income support scheme...",
  "category": "agriculture",
  "eligibility": ["Small farmers"],
  "benefits": ["₹6,000 per year"],
  "how_to_apply": "Register on PM-KISAN portal",
  "official_website": "https://pmkisan.gov.in",
  "contact_info": {},
  "documents_required": ["Aadhaar"],
  "target_audience": ["Farmers"],
  "ministry": "Ministry of Agriculture",
  "state": null,
  "is_central": true,
  "views_count": 151
}
```

---

### AI Scheme Recommendations
**POST** `/schemes/recommend` 🔒

Get AI-powered scheme recommendations.

**Request Body:**
```json
{
  "user_query": "I am a farmer with 1 hectare land, need financial help",
  "user_context": {
    "occupation": "farmer",
    "land_size": "1 hectare",
    "state": "Punjab"
  }
}
```

**Response (200 OK):**
```json
{
  "query": "I am a farmer with 1 hectare land...",
  "recommendations": [
    {
      "id": "...",
      "name": "PM-KISAN",
      "description": "...",
      ...
    }
  ],
  "ai_explanation": "Based on your profile as a small farmer... I recommend PM-KISAN because..."
}
```

---

### AI Scheme Explanation
**POST** `/schemes/explain/{scheme_id}` 🔒

Get simplified explanation of a scheme.

**Response (200 OK):**
```json
{
  "scheme_id": "507f1f77bcf86cd799439015",
  "scheme_name": "PM-KISAN",
  "ai_explanation": "PM-KISAN is a simple scheme that gives money directly to farmers... [detailed explanation]"
}
```

---

## Healthcare

### Symptom Check
**POST** `/healthcare/symptom-check` 🔒

AI-powered symptom analysis.

**Request Body:**
```json
{
  "symptoms": "Fever, headache, and body pain for 2 days",
  "age": 35,
  "gender": "male",
  "medical_history": "No chronic conditions"
}
```

**Response (200 OK):**
```json
{
  "analysis": "Based on your symptoms...",
  "possible_conditions": [
    "Viral fever",
    "Flu",
    "Common cold"
  ],
  "recommendations": [
    "Rest and hydration",
    "Over-the-counter pain relievers",
    "Monitor temperature"
  ],
  "when_to_see_doctor": "If fever persists beyond 3 days or temperature exceeds 103°F",
  "disclaimer": "⚠️ DISCLAIMER: This is AI-generated information..."
}
```

---

### Ask Health Question
**POST** `/healthcare/ask` 🔒

General health query answering.

**Request Body:**
```json
{
  "query": "What are the benefits of drinking water?",
  "context": "General wellness"
}
```

**Response (200 OK):**
```json
{
  "query": "What are the benefits of drinking water?",
  "answer": "Drinking adequate water has numerous benefits... [detailed answer]",
  "sources": [
    "WHO (World Health Organization)",
    "National Health Portal"
  ],
  "disclaimer": "⚠️ DISCLAIMER: This is informational..."
}
```

---

### Government Health Schemes
**GET** `/healthcare/government-health-schemes` 🔒

**Response (200 OK):**
```json
{
  "schemes": [
    {
      "name": "Ayushman Bharat (PM-JAY)",
      "description": "₹5 lakh health insurance per family per year",
      "website": "https://pmjay.gov.in"
    }
  ]
}
```

---

### Emergency Numbers
**GET** `/healthcare/emergency-numbers` 🔒

**Response (200 OK):**
```json
{
  "emergency_numbers": [
    {"service": "Emergency (All)", "number": "112"},
    {"service": "Ambulance", "number": "102/108"},
    {"service": "Police", "number": "100"}
  ]
}
```

---

## Agriculture

### Crop Advice
**POST** `/agriculture/crop-advice` 🔒

Get cultivation advice for specific crops.

**Request Body:**
```json
{
  "crop_name": "wheat",
  "soil_type": "loamy",
  "state": "Punjab",
  "season": "rabi",
  "query": "When to sow?"
}
```

**Response (200 OK):**
```json
{
  "crop_name": "wheat",
  "advice": "Wheat cultivation in Punjab during rabi season... [detailed advice]",
  "best_practices": [
    "Sow in October-November",
    "Maintain 20-25cm row spacing",
    "Regular irrigation"
  ],
  "common_issues": [
    "Rust disease",
    "Aphid attacks",
    "Water logging"
  ],
  "resources": [
    "Kisan Call Centre: 1800-180-1551",
    "Punjab Agricultural University"
  ]
}
```

---

### Pest/Disease Identification
**POST** `/agriculture/pest-disease` 🔒

Identify pests or diseases and get solutions.

**Request Body:**
```json
{
  "description": "Yellowish spots on leaves with white powder",
  "crop": "wheat",
  "symptoms": "Leaves turning yellow, white powder visible"
}
```

**Response (200 OK):**
```json
{
  "possible_issues": [
    "Powdery mildew",
    "Leaf rust",
    "Nutrient deficiency"
  ],
  "solutions": [
    "Apply sulfur-based fungicide",
    "Improve air circulation",
    "Remove affected leaves"
  ],
  "preventive_measures": [
    "Use resistant varieties",
    "Proper spacing",
    "Regular monitoring"
  ]
}
```

---

### Fertilizer Recommendation
**POST** `/agriculture/fertilizer` 🔒

Get fertilizer recommendations.

**Request Body:**
```json
{
  "crop": "rice",
  "soil_type": "clay",
  "state": "West Bengal",
  "farm_size": "2 acres"
}
```

**Response (200 OK):**
```json
{
  "crop": "rice",
  "recommendations": [
    {"recommendation": "NPK 20:20:0 @ 200kg/hectare at sowing"},
    {"recommendation": "Urea 100kg/hectare at tillering stage"}
  ],
  "application_tips": [
    "Apply in split doses",
    "Mix with soil properly",
    "Irrigate after application"
  ],
  "organic_alternatives": [
    "Compost",
    "Vermicompost",
    "Green manure"
  ]
}
```

---

### Agriculture Schemes
**GET** `/agriculture/government-schemes` 🔒

**Response (200 OK):**
```json
{
  "schemes": [
    {
      "name": "PM-KISAN",
      "description": "₹6,000 per year direct income support",
      "website": "https://pmkisan.gov.in"
    }
  ]
}
```

---

### Agriculture Helplines
**GET** `/agriculture/helplines` 🔒

**Response (200 OK):**
```json
{
  "helplines": [
    {"service": "Kisan Call Centre", "number": "1800-180-1551"}
  ]
}
```

---

## Career Guidance

### Career Advice
**POST** `/career/advice` 🔒

Get personalized career guidance.

**Request Body:**
```json
{
  "current_status": "Student",
  "education": "B.Tech Computer Science, Final Year",
  "interests": ["AI", "Web Development", "Startups"],
  "skills": ["Python", "React", "SQL"],
  "location": "Bangalore",
  "query": "Should I do MS or join a startup?"
}
```

**Response (200 OK):**
```json
{
  "career_paths": [
    {
      "title": "AI/ML Engineer",
      "description": "Build AI models and systems..."
    },
    {
      "title": "Full Stack Developer",
      "description": "Develop complete web applications..."
    }
  ],
  "skill_recommendations": [
    "Machine Learning (TensorFlow, PyTorch)",
    "Cloud platforms (AWS, Azure)",
    "Docker & Kubernetes"
  ],
  "courses_certifications": [
    "AWS Certified Solutions Architect",
    "Google Cloud Professional ML Engineer",
    "Full Stack Web Development (Udemy)"
  ],
  "job_market_insights": "Tech sector in India is booming... [detailed analysis]",
  "action_plan": [
    "Build 2-3 portfolio projects",
    "Contribute to open source",
    "Network on LinkedIn",
    "Apply to startups and product companies"
  ]
}
```

---

### Resume Review
**POST** `/career/resume-review` 🔒

AI-powered resume analysis and scoring.

**Request Body:**
```json
{
  "resume_text": "John Doe\nSoftware Engineer\n... [full resume text]",
  "target_role": "Senior Software Engineer",
  "experience_years": 3
}
```

**Response (200 OK):**
```json
{
  "overall_score": 75,
  "strengths": [
    "Clear technical skills section",
    "Quantified achievements",
    "Relevant experience"
  ],
  "weaknesses": [
    "Missing action verbs",
    "Formatting inconsistencies",
    "No leadership examples"
  ],
  "suggestions": [
    "Start bullet points with strong action verbs",
    "Add metrics to achievements",
    "Include leadership experiences",
    "Optimize for ATS"
  ],
  "keyword_recommendations": [
    "Agile",
    "Microservices",
    "CI/CD",
    "Team collaboration"
  ]
}
```

---

### Skill Assessment
**POST** `/career/skill-assessment` 🔒

Identify skill gaps and learning path.

**Request Body:**
```json
{
  "target_role": "DevOps Engineer",
  "current_skills": ["Python", "Git", "Linux"],
  "experience_years": 1
}
```

**Response (200 OK):**
```json
{
  "target_role": "DevOps Engineer",
  "required_skills": [
    "Docker",
    "Kubernetes",
    "CI/CD (Jenkins, GitLab CI)",
    "AWS/Azure/GCP",
    "Terraform",
    "Monitoring (Prometheus, Grafana)"
  ],
  "skill_gaps": [
    "Docker",
    "Kubernetes",
    "Cloud platforms",
    "Infrastructure as Code"
  ],
  "learning_path": [
    {
      "step": "Docker Fundamentals",
      "resource": "Docker Official Docs, Udemy Docker Course"
    },
    {
      "step": "Kubernetes Basics",
      "resource": "Kubernetes.io tutorials, CKA certification"
    }
  ],
  "estimated_time": "4-6 months with consistent practice"
}
```

---

### Interview Preparation
**POST** `/career/interview-prep` 🔒

Get interview prep guidance.

**Request Body:**
```json
{
  "job_role": "Software Engineer",
  "company_type": "Product Company",
  "interview_type": "Technical"
}
```

**Response (200 OK):**
```json
{
  "common_questions": [
    "Tell me about yourself",
    "Explain your recent project",
    "What's your biggest achievement?",
    "How do you handle tight deadlines?",
    "Explain [technical concept]"
  ],
  "preparation_tips": [
    "Research the company thoroughly",
    "Practice coding on LeetCode",
    "Prepare STAR stories",
    "Mock interviews with friends"
  ],
  "resources": [
    "Glassdoor interview experiences",
    "LeetCode for coding practice",
    "Pramp for mock interviews"
  ]
}
```

---

### Career Programs
**GET** `/career/government-programs` 🔒

**Response (200 OK):**
```json
{
  "programs": [
    {
      "name": "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
      "description": "Skill development and certification program",
      "website": "https://www.pmkvyofficial.org"
    }
  ]
}
```

---

## Health Check

### Root Endpoint
**GET** `/`

Basic API information.

**Response (200 OK):**
```json
{
  "message": "Welcome to BharatSathi AI 🚀",
  "app_name": "BharatSathi AI",
  "version": "1.0.0",
  "environment": "development",
  "modules": [
    "Authentication",
    "AI Chat",
    "Government Schemes",
    "Healthcare",
    "Agriculture",
    "Career Guidance"
  ]
}
```

---

### Health Check
**GET** `/health`

System health and module status.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "modules": {
    "auth": "active",
    "chat": "active",
    "schemes": "active",
    "healthcare": "active",
    "agriculture": "active",
    "career": "active"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error message"
}
```

---

## Authentication Flow

1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login` → Get `access_token`
3. **Use Token**: Add header `Authorization: Bearer <access_token>` to all protected requests
4. **Verify**: `GET /auth/me` → Confirms token is valid

---

## Rate Limiting

Currently no rate limiting implemented. Recommended for production:
- 100 requests per minute per user
- 10 requests per minute for AI endpoints

---

## Notes

- 🔒 = Requires authentication (Bearer token)
- All timestamps are in ISO 8601 format (UTC)
- Default pagination: page=1, per_page=20
- Maximum per_page: 100
- Token expiration: 7 days (configurable)

---

**API Version**: 1.0.0
**Last Updated**: January 2024
**Base URL**: http://127.0.0.1:8000
