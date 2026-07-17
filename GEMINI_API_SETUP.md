# Getting Your Gemini API Key 🔑

The BharatSathi AI backend uses Google's Gemini AI for all AI-powered features. You need a Gemini API key to enable these features.

---

## Why Do You Need This?

The Gemini API key enables:
- ✅ AI Chat conversations
- ✅ Scheme recommendations
- ✅ Symptom checking
- ✅ Health Q&A
- ✅ Crop advice
- ✅ Career guidance
- ✅ Resume review
- ✅ And all other AI features

---

## How to Get Your API Key (FREE)

### Step 1: Visit Google AI Studio

Go to: **https://makersuite.google.com/app/apikey**

Or visit: **https://aistudio.google.com/app/apikey**

### Step 2: Sign In

- Sign in with your Google account
- Any Gmail account works!

### Step 3: Create API Key

1. Click **"Create API Key"** button
2. Select **"Create API key in new project"** (or use existing project)
3. Your API key will be generated instantly!

### Step 4: Copy API Key

- Copy the generated API key
- It looks like: `AIzaSyB1234567890abcdefghijklmnopqrstuvw`

### Step 5: Add to .env File

Open `backend/.env` file and update:

```env
GEMINI_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstuvw
```

Replace with your actual API key!

---

## Free Tier Limits

Gemini API Free Tier includes:
- ✅ **60 requests per minute**
- ✅ **1,500 requests per day**
- ✅ **1 million tokens per minute**
- ✅ **No credit card required**
- ✅ **Forever free** (for this tier)

**This is MORE than enough for development and testing!**

---

## Pricing (If You Need More)

For production with higher traffic:

| Tier | RPM | RPD | Price |
|------|-----|-----|-------|
| Free | 60 | 1,500 | $0 |
| Pay-as-you-go | Unlimited | Unlimited | ~$0.00025/1K tokens |

Most likely you'll stay in free tier for development!

---

## Verification

### Test Your API Key

1. Start your backend server:
```bash
uvicorn app.main:app --reload
```

2. Try the chat endpoint:
```bash
curl -X POST http://127.0.0.1:8000/chat/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

3. If you get a response, your API key is working! ✅

### Common Issues

**Error: "GEMINI_API_KEY not configured"**
- Make sure you added the key to `.env` file
- Restart the server after updating `.env`

**Error: "API key not valid"**
- Check if you copied the full key
- Make sure no extra spaces in `.env`
- Try generating a new key

**Error: "Quota exceeded"**
- You've hit the free tier limit (60 req/min or 1500 req/day)
- Wait for the quota to reset
- Consider upgrading if needed

---

## Security Best Practices

### ✅ DO:
- Keep API key in `.env` file only
- Add `.env` to `.gitignore`
- Use environment variables in production
- Regenerate key if accidentally exposed

### ❌ DON'T:
- Commit API key to GitHub
- Share API key publicly
- Hardcode API key in source code
- Use same key for multiple projects

---

## Alternative: Use Environment Variable

Instead of `.env` file, you can set environment variable:

### Windows (PowerShell):
```powershell
$env:GEMINI_API_KEY="your-api-key-here"
```

### Windows (CMD):
```cmd
set GEMINI_API_KEY=your-api-key-here
```

### Linux/Mac:
```bash
export GEMINI_API_KEY=your-api-key-here
```

---

## Testing Without API Key

If you don't have an API key yet, the backend will still work but AI features will return error:

```json
{
  "detail": "Failed to generate AI response. Please check if GEMINI_API_KEY is configured."
}
```

All non-AI features (auth, database operations) will work fine!

---

## API Key Management

### Regenerate Key
1. Go to Google AI Studio
2. Click on your existing key
3. Click "Regenerate"
4. Update `.env` file with new key

### Delete Key
1. Go to Google AI Studio
2. Click delete icon next to key
3. Key will be immediately revoked

### Multiple Keys
- You can create multiple API keys
- Use different keys for dev/staging/production
- Each key has same limits

---

## Production Deployment

When deploying to production:

1. **Use Environment Variables**
   - Don't commit `.env` to repository
   - Use platform's environment variable settings
   - Example: Heroku Config Vars, AWS Secrets Manager

2. **Monitor Usage**
   - Check Google Cloud Console
   - Set up usage alerts
   - Monitor quotas

3. **Consider Paid Tier**
   - If traffic exceeds free limits
   - Pay-as-you-go is very affordable
   - Only ~$0.00025 per 1K tokens

---

## Quick Reference

| What | Link |
|------|------|
| Get API Key | https://aistudio.google.com/app/apikey |
| Documentation | https://ai.google.dev/docs |
| Pricing | https://ai.google.dev/pricing |
| Google AI Studio | https://aistudio.google.com |

---

## Need Help?

### API Key Issues
- Visit: https://ai.google.dev/docs
- Check: Google AI Studio help center
- Verify: Your Google account is active

### Backend Issues
- Check logs: `backend/logs/app.log`
- Verify: `.env` file has correct key
- Restart: Server after updating key

---

## Summary

1. ✅ Visit: https://aistudio.google.com/app/apikey
2. ✅ Sign in with Google
3. ✅ Create API Key
4. ✅ Copy the key
5. ✅ Add to `backend/.env` file
6. ✅ Restart server
7. ✅ Test AI features!

**That's it! You're ready to use all AI features.** 🚀

---

**Note**: The API key is FREE and takes only 2 minutes to get!
