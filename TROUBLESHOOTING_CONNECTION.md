# Troubleshooting: ERR_CONNECTION_REFUSED

## Problem
```
POST http://localhost:3001/api/farmer/assistant/explain-result 
net::ERR_CONNECTION_REFUSED
```

This means the backend server is not running or not accessible on port 3001.

---

## ✅ Solution Steps

### Step 1: Start the Backend Server

Open a **NEW terminal window** (keep it separate from frontend):

```bash
cd backend
npm run dev
```

**Expected Output**:
```
info: Server running on port 3001
```

**If you see an error**, continue to Step 2.

---

### Step 2: Check if Dependencies are Installed

```bash
cd backend
npm install
```

Wait for installation to complete, then retry:
```bash
npm run dev
```

---

### Step 3: Verify Environment Variables

Check if `.env` file exists in `backend/` folder:

```bash
# Windows
dir backend\.env

# Mac/Linux  
ls -la backend/.env
```

**If file doesn't exist**, create it:

```bash
cd backend
copy .env.example .env    # Windows
# OR
cp .env.example .env      # Mac/Linux
```

Then edit `backend/.env` and add:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_key_here
```

---

### Step 4: Check if Port 3001 is Already in Use

**Windows**:
```bash
netstat -ano | findstr :3001
```

**Mac/Linux**:
```bash
lsof -i :3001
```

**If port is in use**:
- Kill the process using that port
- OR change port in `backend/.env`:
  ```bash
  PORT=3002
  ```
  And update frontend to use the new port (see Step 6)

---

### Step 5: Check for Syntax Errors

If server crashes immediately, check logs:

```bash
cd backend
node server.js
```

Look for error messages like:
- "Cannot find module..." → Run `npm install`
- "SyntaxError..." → Check recent code changes
- "Error: GEMINI_API_KEY not set" → Add key to `.env`

---

### Step 6: Verify Frontend API URL

Check `frontend/.env`:

```bash
VITE_API_URL=http://localhost:3001
```

**If different**, update it and restart frontend:
```bash
cd frontend
npm run dev
```

---

## 🧪 Test the Connection

Once backend is running, test in browser:

### Test 1: Check Root Endpoint
```
http://localhost:3001
```

**Expected Response**:
```json
{
  "status": "AgriAid.AI API running",
  "version": "3.0.0"
}
```

### Test 2: Test Explain Result Endpoint

Open a new terminal and run:

```bash
curl -X POST http://localhost:3001/api/farmer/assistant/explain-result ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"What is confidence score?\",\"language\":\"EN\",\"context\":{\"confidence\":92.5}}"
```

**Mac/Linux** (use `\` instead of `^`):
```bash
curl -X POST http://localhost:3001/api/farmer/assistant/explain-result \
  -H "Content-Type: application/json" \
  -d '{"question":"What is confidence score?","language":"EN","context":{"confidence":92.5}}'
```

**Expected Response**:
```json
{
  "success": true,
  "reply": "Confidence score is the AI's certainty level..."
}
```

---

## 📋 Complete Startup Checklist

Follow these steps in order:

### Terminal 1: Backend
```bash
cd C:\AgriAid.AI\backend
npm install                    # Only needed once
npm run dev                    # Keep this running
```

**Wait for**: `info: Server running on port 3001`

### Terminal 2: Frontend  
```bash
cd C:\AgriAid.AI\frontend
npm install                    # Only needed once
npm run dev                    # Keep this running
```

**Wait for**: `Local: http://localhost:5173`

### Browser
```
http://localhost:5173
```

---

## 🐛 Common Errors & Fixes

### Error: "Cannot find module 'express'"
**Fix**:
```bash
cd backend
npm install
```

### Error: "GEMINI_API_KEY not set"
**Fix**: Add to `backend/.env`:
```bash
GEMINI_API_KEY=your_key_here
```

### Error: "Port 3001 is already in use"
**Fix**: Kill the process or change port:
```bash
# backend/.env
PORT=3002
```

### Error: "CORS blocked"
**Fix**: Check `backend/server.js` allows `http://localhost:5173`

### Error: Frontend shows blank page
**Fix**: 
1. Check browser console for errors
2. Verify both backend AND frontend are running
3. Check `frontend/.env` has correct `VITE_API_URL`

---

## 🔍 Debug Mode

Enable detailed logging:

### Backend Debug
Add to `backend/.env`:
```bash
NODE_ENV=development
LOG_LEVEL=debug
```

### Check Logs
```bash
# View combined logs
type backend\logs\combined.log      # Windows
tail -f backend/logs/combined.log   # Mac/Linux

# View error logs only
type backend\logs\error.log         # Windows
tail -f backend/logs/error.log      # Mac/Linux
```

---

## ✅ Verification Script

Save this as `backend/test-connection.js`:

```javascript
const axios = require('axios');

async function testConnection() {
    const tests = [
        {
            name: 'Root Endpoint',
            url: 'http://localhost:3001',
            method: 'get'
        },
        {
            name: 'Explain Result Endpoint',
            url: 'http://localhost:3001/api/farmer/assistant/explain-result',
            method: 'post',
            data: {
                question: 'Test question',
                language: 'EN',
                context: { confidence: 90 }
            }
        }
    ];

    console.log('🧪 Testing Backend Connection...\n');

    for (const test of tests) {
        try {
            const response = test.method === 'get'
                ? await axios.get(test.url)
                : await axios.post(test.url, test.data);
            
            console.log(`✅ ${test.name}: SUCCESS`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Data:`, JSON.stringify(response.data).substring(0, 100) + '...\n');
        } catch (error) {
            console.log(`❌ ${test.name}: FAILED`);
            if (error.code === 'ECONNREFUSED') {
                console.log(`   Error: Backend not running on port 3001`);
                console.log(`   Fix: Run 'npm run dev' in backend folder\n`);
            } else {
                console.log(`   Error: ${error.message}\n`);
            }
        }
    }
}

testConnection();
```

Run it:
```bash
cd backend
node test-connection.js
```

---

## 📞 Still Having Issues?

### Check These:

1. **Firewall**: Windows Firewall blocking port 3001?
2. **Antivirus**: Temporarily disable and test
3. **Node Version**: Run `node --version` (should be 18+)
4. **NPM Version**: Run `npm --version` (should be 9+)
5. **Path Issues**: Make sure you're in the correct directory

### Get Help:

1. Copy error message from terminal
2. Check `backend/logs/error.log`
3. Run diagnostics:
   ```bash
   node backend/test-connection.js
   ```
4. Share output with support team

---

## 🎯 Quick Fix Summary

Most common solution (90% of cases):

```bash
# 1. Open Terminal 1
cd C:\AgriAid.AI\backend
npm run dev

# 2. Open Terminal 2  
cd C:\AgriAid.AI\frontend
npm run dev

# 3. Open Browser
http://localhost:5173
```

**Keep both terminals running!** Don't close them while using the app.

---

**Last Updated**: January 2025
