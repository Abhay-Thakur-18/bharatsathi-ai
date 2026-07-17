# BharatSathi AI - Testing Guide

## Phase 1: Authentication System Testing

### Prerequisites

1. **MongoDB Running**
   ```bash
   # Verify MongoDB is running
   mongosh
   # Or check if service is active
   ```

2. **Python Environment Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Verify Setup**
   ```bash
   python verify_setup.py
   ```

---

## Testing Methods

### Method 1: Automated Test Script (Recommended)

**Step 1**: Start the backend server
```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Step 2**: In a new terminal, run the test script
```bash
cd backend
python tests/test_auth.py
```

**Expected Output:**
```
🚀 Starting Authentication System Tests

Test 1: Health Check
============================================================
  Health Check
============================================================
Status Code: 200
Response:
{
  "status": "healthy",
  "database": "connected"
}
============================================================

Test 2: Register New User
[... successful registration ...]

Test 3: Register Duplicate User (Expected to Fail)
[... 400 error with "Email already registered" ...]

Test 4: Login with Valid Credentials
[... returns access_token ...]

Test 5: Get Current User Info (Protected Route)
[... returns user data ...]

Test 6: Access Protected Route Without Token (Expected to Fail)
[... 403 error ...]

Test 7: Access Protected Route With Invalid Token (Expected to Fail)
[... 401 error ...]

Test 8: Login with Wrong Password (Expected to Fail)
[... 401 error ...]

Test 9: Login with Non-existent Email (Expected to Fail)
[... 401 error ...]

✅ All Authentication Tests Completed!
```

---

### Method 2: Interactive API Docs (Swagger UI)

**Step 1**: Start the server
```bash
cd backend
uvicorn app.main:app --reload
```

**Step 2**: Open browser to
```
http://127.0.0.1:8000/docs
```

**Test Flow:**

1. **Register User**
   - Click on `POST /auth/register`
   - Click "Try it out"
   - Enter test data:
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "Test@12345"
     }
     ```
   - Click "Execute"
   - ✅ Should return status 201 with user_id

2. **Login**
   - Click on `POST /auth/login`
   - Click "Try it out"
   - Enter credentials:
     ```json
     {
       "email": "test@example.com",
       "password": "Test@12345"
     }
     ```
   - Click "Execute"
   - ✅ Should return access_token
   - **COPY THE TOKEN**

3. **Get Current User**
   - Click on `GET /auth/me`
   - Click on the 🔒 lock icon (or "Authorize" button at top)
   - Enter: `Bearer <your_access_token>`
   - Click "Authorize"
   - Go back to `GET /auth/me`
   - Click "Try it out"
   - Click "Execute"
   - ✅ Should return your user data

---

### Method 3: Manual cURL Testing

**Test 1: Health Check**
```bash
curl http://127.0.0.1:8000/health
```

**Test 2: Register**
```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@12345"
  }'
```

**Test 3: Login**
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@12345"
  }'
```

Save the `access_token` from the response.

**Test 4: Get Current User (Protected)**
```bash
curl http://127.0.0.1:8000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

### Method 4: Python Requests (Manual)

```python
import requests

BASE_URL = "http://127.0.0.1:8000"

# Register
response = requests.post(f"{BASE_URL}/auth/register", json={
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@12345"
})
print(response.json())

# Login
response = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "test@example.com",
    "password": "Test@12345"
})
token = response.json()["access_token"]
print(f"Token: {token}")

# Get current user
response = requests.get(
    f"{BASE_URL}/auth/me",
    headers={"Authorization": f"Bearer {token}"}
)
print(response.json())
```

---

## Verification Checklist

### ✅ Registration Tests
- [ ] Can register with valid email and password (min 8 chars)
- [ ] Cannot register with duplicate email (returns 400)
- [ ] Cannot register with invalid email format (validation error)
- [ ] Cannot register with short password (validation error)

### ✅ Login Tests
- [ ] Can login with correct credentials (returns token)
- [ ] Cannot login with wrong password (returns 401)
- [ ] Cannot login with non-existent email (returns 401)
- [ ] Token includes user information

### ✅ Protected Route Tests
- [ ] Can access `/auth/me` with valid token
- [ ] Cannot access `/auth/me` without token (returns 403)
- [ ] Cannot access `/auth/me` with invalid token (returns 401)
- [ ] Cannot access `/auth/me` with expired token (returns 401)

### ✅ Database Tests
- [ ] Users are stored in MongoDB
- [ ] Passwords are hashed (not plain text)
- [ ] Email index is created (unique constraint)
- [ ] Timestamps are recorded

---

## Troubleshooting

### Error: Connection Refused
**Problem**: Cannot connect to server
**Solution**: Make sure server is running on port 8000

### Error: Database Connection Failed
**Problem**: MongoDB is not running
**Solution**: Start MongoDB service
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Error: ModuleNotFoundError
**Problem**: Dependencies not installed
**Solution**:
```bash
pip install -r requirements.txt
```

### Error: Duplicate Key Error
**Problem**: Email already exists in database
**Solution**: Use a different email or clean the database
```bash
mongosh
use bharatsathi_ai
db.users.deleteMany({})
```

---

## MongoDB Verification

**Check if users are being created:**
```bash
mongosh
use bharatsathi_ai
db.users.find().pretty()
```

**Check if passwords are hashed:**
```javascript
db.users.findOne({}, {password: 1})
// Should see hashed password starting with $2b$
```

**Check indexes:**
```javascript
db.users.getIndexes()
// Should see index on email field
```

---

## Success Criteria

✅ **All tests pass** in automated test script  
✅ **No syntax errors** in code  
✅ **Passwords are hashed** in database  
✅ **JWT tokens work** for authentication  
✅ **Protected routes** require valid token  
✅ **Error handling** works correctly  
✅ **Logging** shows operations clearly  

---

## Next Steps After Successful Testing

Once all authentication tests pass:
1. ✅ Mark Phase 1 as complete
2. 🚀 Move to Phase 2: Frontend Foundation
3. 📝 Document any issues found

---

**Status**: Ready for Testing ✅
