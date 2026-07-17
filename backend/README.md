# BharatSathi AI - Backend

Production-grade FastAPI backend for BharatSathi AI platform.

## Features Implemented

### ✅ Phase 1: Authentication System
- User Registration with email validation
- Secure password hashing (bcrypt)
- JWT-based authentication
- Login endpoint with token generation
- Protected routes with bearer token authentication
- Get current user endpoint
- Comprehensive error handling
- Database indexing for performance
- Logging system

## Tech Stack

- **Framework**: FastAPI
- **Database**: MongoDB (Motor - Async)
- **Authentication**: JWT (python-jose), Passlib
- **Validation**: Pydantic v2
- **Logging**: Loguru
- **Python**: 3.13+

## Setup Instructions

### 1. Prerequisites

- Python 3.13+
- MongoDB (running on localhost:27017)

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

**Important**: Update `SECRET_KEY` in production!

### 4. Start MongoDB

Make sure MongoDB is running on `mongodb://localhost:27017`

### 5. Run the Server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The server will start at: `http://127.0.0.1:8000`

## Testing

### Automated Test Script

Run the authentication test suite:

```bash
python tests/test_auth.py
```

This will test:
- ✅ User registration
- ✅ Duplicate registration handling
- ✅ User login with JWT token
- ✅ Protected route access
- ✅ Invalid token handling
- ✅ Wrong credentials handling

### Manual Testing with Swagger UI

Visit: `http://127.0.0.1:8000/docs`

### Test Flow:

1. **Register a new user**
   - Endpoint: `POST /auth/register`
   - Body:
     ```json
     {
       "name": "John Doe",
       "email": "john@example.com",
       "password": "SecurePass123"
     }
     ```

2. **Login**
   - Endpoint: `POST /auth/login`
   - Body:
     ```json
     {
       "email": "john@example.com",
       "password": "SecurePass123"
     }
     ```
   - Response includes `access_token`

3. **Get Current User (Protected)**
   - Endpoint: `GET /auth/me`
   - Headers: `Authorization: Bearer <your_token>`

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check with DB status |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |

### Protected Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/me` | Get current user info | ✅ Bearer Token |

## Project Structure

```
backend/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── health/       # Health check
│   ├── core/             # Core configuration
│   │   ├── config.py     # Settings
│   │   └── logger.py     # Logging setup
│   ├── db/               # Database connection
│   ├── dependencies/     # FastAPI dependencies
│   │   └── auth.py       # Auth dependencies
│   ├── models/           # Data models
│   ├── repositories/     # Database operations
│   ├── schemas/          # Pydantic schemas
│   ├── utils/            # Utilities
│   │   └── jwt.py        # JWT helpers
│   └── main.py           # Application entry
├── tests/                # Test scripts
├── logs/                 # Application logs
├── requirements.txt      # Dependencies
└── .env                  # Environment variables
```

## Architecture

Following **Clean Architecture** principles:

```
Schema (Validation) → Repository (Data Access) → Service (Business Logic) → Router (API)
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Token expiration (7 days default)
- ✅ Protected routes with dependency injection
- ✅ CORS configuration
- ✅ Input validation with Pydantic
- ✅ Environment-based secrets

## Logging

All operations are logged to:
- Console (colored output)
- `logs/app.log` (file)

## Next Steps

- [ ] AI Chat Module
- [ ] Government Schemes Module
- [ ] Healthcare Module
- [ ] Agriculture Module
- [ ] Career Module
- [ ] RAG System

## Development Notes

- All endpoints follow REST conventions
- Async/await used throughout for performance
- Type hints for better code quality
- Comprehensive error handling
- Production-ready logging

---

**Status**: Authentication System ✅ Complete and Tested
