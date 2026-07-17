# BharatSathi AI - Deployment Guide 🚀

Complete guide to deploying BharatSathi AI backend to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- ✅ All code is committed to Git
- ✅ `.env` is in `.gitignore`
- ✅ Gemini API key is ready
- ✅ Production MongoDB is ready
- ✅ Domain name (optional)
- ✅ SSL certificate plan

---

## 🎯 Deployment Options

### Option 1: Railway (Recommended - Easiest)
### Option 2: Render
### Option 3: AWS/Google Cloud
### Option 4: Heroku
### Option 5: DigitalOcean

---

## 🚂 Option 1: Deploy to Railway (RECOMMENDED)

**Why Railway?**
- Free tier available
- Automatic deployments from Git
- Built-in environment variables
- Free MongoDB included
- Easy SSL certificates
- Great for Python apps

### Step-by-Step

#### 1. Prepare Your Code

Add `Procfile` to backend folder:
```bash
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Add `runtime.txt` (optional):
```
python-3.11
```

#### 2. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 3. Deploy on Railway

1. Visit: https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will auto-detect Python app

#### 4. Configure Environment Variables

In Railway dashboard:
- Go to Variables tab
- Add all variables from `.env`:

```
APP_NAME=BharatSathi AI
APP_VERSION=1.0.0
HOST=0.0.0.0
PORT=8000
DEBUG=False
MONGODB_URI=<railway-mongodb-uri>
DATABASE_NAME=bharatsathi_ai
SECRET_KEY=<generate-strong-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GEMINI_API_KEY=<your-key>
CORS_ORIGINS=https://your-frontend-url.com
ENVIRONMENT=production
```

#### 5. Add MongoDB

1. In Railway, click "+ New"
2. Select "Database" → "MongoDB"
3. Copy connection string
4. Update MONGODB_URI variable

#### 6. Deploy!

Railway will automatically:
- Install dependencies
- Run migrations
- Start the server
- Provide a public URL

#### 7. Test Deployment

```bash
curl https://your-app.railway.app/health
```

**Cost**: Free tier available, then ~$5-20/month

---

## 🎨 Option 2: Deploy to Render

**Why Render?**
- Free tier
- Auto-deploy from Git
- Environment variables
- Easy to use

### Step-by-Step

#### 1. Create `render.yaml`

```yaml
services:
  - type: web
    name: bharatsathi-ai-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: APP_NAME
        value: BharatSathi AI
      - key: DEBUG
        value: false
```

#### 2. Sign Up on Render

1. Visit: https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository

#### 3. Configure

- **Environment**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### 4. Add Environment Variables

Add all from `.env` in Environment tab

#### 5. Add MongoDB

Option A: Use MongoDB Atlas (recommended)
Option B: Use Render's PostgreSQL and adapt

#### 6. Deploy

Click "Create Web Service" and Render will deploy!

**Cost**: Free tier available

---

## ☁️ Option 3: AWS Deployment

**For production-scale applications**

### Architecture
```
CloudFront → ALB → ECS/Fargate → MongoDB Atlas
```

### Components Needed
- ECS/Fargate for container
- ALB for load balancing
- Route 53 for DNS
- Certificate Manager for SSL
- MongoDB Atlas for database

### Quick Deploy with Elastic Beanstalk

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize EB**
```bash
cd backend
eb init -p python-3.11 bharatsathi-ai
```

3. **Create Environment**
```bash
eb create bharatsathi-production
```

4. **Set Environment Variables**
```bash
eb setenv GEMINI_API_KEY=xxx MONGODB_URI=xxx ...
```

5. **Deploy**
```bash
eb deploy
```

6. **Open App**
```bash
eb open
```

**Cost**: ~$10-50/month depending on usage

---

## 🌊 Option 4: DigitalOcean App Platform

### Step-by-Step

1. **Create App**
   - Visit: https://cloud.digitalocean.com
   - Apps → Create App
   - Connect GitHub

2. **Configure**
   - Type: Web Service
   - Environment: Python
   - HTTP Port: 8000

3. **Add Environment Variables**
   - Add all from `.env`

4. **Add MongoDB**
   - Add MongoDB Managed Database
   - Or use MongoDB Atlas

5. **Deploy**
   - Click Deploy
   - Get URL

**Cost**: $5-25/month

---

## 🗄️ Database Deployment

### MongoDB Atlas (Recommended)

1. **Sign Up**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Create free account

2. **Create Cluster**
   - Choose Free Tier (M0)
   - Select region close to your app
   - Create cluster

3. **Configure Access**
   - Database Access → Add User
   - Network Access → Add IP (0.0.0.0/0 for development)

4. **Get Connection String**
   - Connect → Connect your application
   - Copy connection string
   - Replace <password> with your password

5. **Update Environment Variable**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

**Cost**: Free tier available (512MB storage)

---

## 🔐 Security Considerations

### Before Production

1. **Generate Strong SECRET_KEY**
```python
import secrets
print(secrets.token_urlsafe(32))
```

2. **Update SECRET_KEY in environment variables**

3. **Set DEBUG=False**

4. **Configure CORS properly**
```
CORS_ORIGINS=https://your-actual-frontend.com
```

5. **Use HTTPS only**

6. **Enable MongoDB authentication**

7. **Use environment variables for all secrets**

8. **Set up monitoring & alerts**

---

## 🔍 Post-Deployment Testing

### 1. Health Check
```bash
curl https://your-app.com/health
```

Expected:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. Test Authentication
```bash
# Register
curl -X POST https://your-app.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test@12345"}'

# Login
curl -X POST https://your-app.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@12345"}'
```

### 3. Test AI Chat
```bash
curl -X POST https://your-app.com/chat/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

### 4. Monitor Logs

Check platform logs for errors

---

## 📊 Monitoring

### Essential Monitoring

1. **Application Logs**
   - Check platform logs daily
   - Set up log aggregation

2. **Error Tracking**
   - Consider Sentry for error tracking
   - Set up alerts

3. **Performance**
   - Monitor response times
   - Check database queries
   - Monitor API usage

4. **Uptime**
   - Use UptimeRobot or similar
   - Set up alerts

---

## 💰 Cost Estimates

### Free Tier (Good for MVP)
```
Railway Free:     $0/month
MongoDB Atlas:    $0/month (512MB)
Gemini API:       $0/month (free tier)
Domain (optional): $10-15/year

Total: ~$0-2/month
```

### Production (Small Scale)
```
Railway/Render:   $10-20/month
MongoDB Atlas:    $57/month (M10)
Gemini API:       ~$5-20/month
Domain:           $10-15/year
SSL:              Free (Let's Encrypt)

Total: ~$70-100/month
```

### Production (Medium Scale)
```
AWS/GCP:          $50-200/month
MongoDB Atlas:    $300/month (M30)
Gemini API:       $50-200/month
CloudFront:       $20-50/month

Total: ~$400-750/month
```

---

## 🚀 CI/CD Pipeline (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.11
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd backend
        python tests/test_auth.py
    
    - name: Deploy to Railway
      run: railway up
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🔄 Update & Maintenance

### Regular Updates

1. **Update Dependencies**
```bash
pip list --outdated
pip install --upgrade <package>
```

2. **Database Backups**
   - Enable automatic backups in MongoDB Atlas
   - Test restore process

3. **Monitor Logs**
   - Check for errors daily
   - Monitor API usage

4. **Security Patches**
   - Update dependencies regularly
   - Monitor security advisories

---

## 📱 Frontend Deployment

### When Frontend is Ready

Deploy to:
- **Vercel** (Recommended for React)
- **Netlify**
- **AWS S3 + CloudFront**

Update CORS_ORIGINS:
```
CORS_ORIGINS=https://bharatsathi-ai.vercel.app
```

---

## 🆘 Troubleshooting

### Common Issues

**1. Database Connection Failed**
- Check MongoDB URI
- Verify IP whitelist
- Check username/password

**2. AI Responses Not Working**
- Verify GEMINI_API_KEY
- Check API quota
- Review logs

**3. CORS Errors**
- Update CORS_ORIGINS
- Include protocol (https://)
- No trailing slash

**4. 500 Internal Server Error**
- Check logs
- Verify all environment variables
- Check database connection

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code committed to Git
- [ ] `.env` in `.gitignore`
- [ ] Gemini API key ready
- [ ] MongoDB planned
- [ ] Domain purchased (optional)

### Deployment
- [ ] Platform selected
- [ ] Repository connected
- [ ] Environment variables set
- [ ] MongoDB configured
- [ ] First deployment successful

### Post-Deployment
- [ ] Health check passing
- [ ] Authentication working
- [ ] AI features working
- [ ] All endpoints tested
- [ ] Monitoring set up
- [ ] Backups enabled

### Production Ready
- [ ] DEBUG=False
- [ ] Strong SECRET_KEY
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Logs monitored
- [ ] Errors tracked
- [ ] Performance acceptable

---

## 🎉 Launch Checklist

When ready to launch:

1. [ ] All tests passing
2. [ ] Documentation complete
3. [ ] Frontend integrated
4. [ ] Security reviewed
5. [ ] Performance tested
6. [ ] Monitoring active
7. [ ] Backup strategy in place
8. [ ] Team trained
9. [ ] Support plan ready
10. [ ] Marketing materials ready

---

## 📞 Support Resources

### Platform Support
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- AWS: https://aws.amazon.com/documentation
- MongoDB Atlas: https://docs.atlas.mongodb.com

### Community
- FastAPI: https://fastapi.tiangolo.com
- MongoDB: https://www.mongodb.com/community
- Python: https://www.python.org/community

---

## 🎯 Quick Deploy Summary

**Fastest Path to Production:**

1. Push code to GitHub (5 minutes)
2. Sign up on Railway (2 minutes)
3. Connect repository (1 minute)
4. Add MongoDB (2 minutes)
5. Configure environment variables (5 minutes)
6. Deploy (automatic)

**Total Time: ~15 minutes** ⚡

---

**Ready to deploy? Choose your platform and follow the guide!** 🚀

**Remember**: Start with free tier, scale as needed.
