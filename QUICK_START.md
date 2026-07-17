# BharatSathi AI - Quick Start Guide 🚀

Get up and running in 5 minutes!

## Prerequisites

- ✅ Python 3.9+ installed
- ✅ MongoDB running on localhost:27017
- ✅ Git (for cloning)

---

## Step 1: Verify Setup

```bash
cd backend
python verify_setup.py
```

Expected output: `✅ All checks passed!`

---

## Step 2: Install Dependencies (if needed)

```bash
pip install -r requirements.txt
```

---

## Step 3: Start the Server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

You should see:
```
INFO:     BharatSathi AI Backend Started
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

## Step 4: Test Authentication

**Option A - Automated Tests** (Recommended)

Open a new terminal:
```bash
cd backend
python tests/test_auth.py
```

**Option B - Swagger UI**

Open browser: http://127.0.0.1:8000/docs

Try the endpoints manually!

---

## That's It! 🎉

### You now have:
- ✅ FastAPI server running
- ✅ MongoDB connected
- ✅ JWT authentication working
- ✅ Protected routes functional

### Next Steps:
1. Read `TESTING_GUIDE.md` for detailed testing
2. Review `backend/README.md` for API docs
3. Check `PHASE_1_COMPLETE.md` for what was built

---

## Troubleshooting

**Server won't start?**
- Check if MongoDB is running
- Check if port 8000 is available
- Verify .env file exists

**Tests failing?**
- Make sure server is running first
- Check MongoDB connection
- Review logs in `backend/logs/app.log`

**Need help?**
- Check `TESTING_GUIDE.md` troubleshooting section
- Review server logs
- Verify all dependencies installed

---

## Project Structure

```
bharatsathi-ai/
├── backend/              # FastAPI Backend
│   ├── app/              # Application code
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Config, logging
│   │   ├── db/           # Database
│   │   ├── models/       # Data models
│   │   ├── schemas/      # Validation
│   │   ├── repositories/ # DB operations
│   │   ├── utils/        # Helpers (JWT)
│   │   └── dependencies/ # Auth deps
│   ├── tests/            # Test scripts
│   └── logs/             # Application logs
├── frontend/             # React (Coming in Phase 2)
├── QUICK_START.md        # This file
├── TESTING_GUIDE.md      # Detailed testing
└── PHASE_1_COMPLETE.md   # What was built
```

---

**Ready to build the frontend? Let me know!** 🚀
