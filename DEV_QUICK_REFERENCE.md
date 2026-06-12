# Explain Result AI Assistant - Developer Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. Get API Key
```bash
# Visit https://aistudio.google.com
# Create project → Enable Gemini API → Copy key
```

### 2. Configure Environment
```bash
cd backend
echo "GEMINI_API_KEY=your_key_here" >> .env
```

### 3. Test
```bash
node test-explain-result.js
```

### 4. Run
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

---

## 📡 API Reference

### Endpoint
```
POST /api/farmer/assistant/explain-result
```

### Request
```json
{
  "question": "What is confidence score?",
  "language": "EN",
  "context": {
    "diseaseName": "Rice Blast",
    "confidence": 92.5,
    "cureMethods": "Apply Tricyclazole...",
    "organicSolutions": "Neem oil spray...",
    "fertilizerSuggestions": "NPK 20:10:10...",
    "irrigationAdvice": "Drip irrigation...",
    "yieldProtectionAdvice": "Remove infected leaves..."
  }
}
```

### Response (Success)
```json
{
  "success": true,
  "reply": "Confidence score is the AI's certainty..."
}
```

### Response (Error)
```json
{
  "success": false,
  "message": "Could not get explanation..."
}
```

---

## 🔧 Backend Code

### File: `backend/controllers/aiFarmingAssistantController.js`

```javascript
// Gemini 2.5 Flash API Call
async function callGemini25Flash(systemPrompt, userMessage, options) {
    const key = process.env.GEMINI_API_KEY;
    const body = {
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { 
            temperature: options.temperature || 0.5, 
            maxOutputTokens: options.maxTokens || 512 
        }
    };
    const res = await axios.post(
        `${GEMINI_BASE}/${GEMINI_25_FLASH}:generateContent?key=${key}`,
        body,
        { timeout: 30000 }
    );
    return res.data.candidates[0].content.parts[0].text.trim();
}

// Main Handler
async function explainResult(req, res) {
    const { question, language = 'EN', context = {} } = req.body;
    const langName = language === 'TA' ? 'Tamil' 
                   : language === 'HI' ? 'Hindi' 
                   : 'English';
    
    const systemPrompt = `You are an agricultural explanation assistant...`;
    const contextText = [/* build context string */].join('\n');
    const userMessage = `Crop Analysis Context:\n${contextText}\n\nFarmer's Question: ${question}`;
    
    const reply = await callGemini25Flash(systemPrompt, userMessage, { 
        temperature: 0.3, 
        maxTokens: 400 
    });
    
    return res.json({ success: true, reply: reply.trim() });
}
```

---

## ⚛️ Frontend Code

### File: `frontend/src/FarmerModule/ImageUploadForm.jsx`

```jsx
// Component
const ExplainResultAssistant = ({ result, language }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    const ask = async (question) => {
        const context = {
            diseaseName: result.diseaseName,
            confidence: result.confidence,
            cureMethods: result.cureMethods,
            // ... more fields
        };
        
        const res = await apiClient.post('/api/farmer/assistant/explain-result', {
            question,
            language: language === 'TA' ? 'TA' : language === 'HI' ? 'HI' : 'EN',
            context,
        });
        
        setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
    };
    
    return (/* UI JSX */);
};
```

---

## 🌍 Language Support

### Language Codes
```javascript
'EN' // English
'TA' // Tamil  
'HI' // Hindi
```

### Quick Questions (Examples)

```javascript
const quickQuestions = {
    EN: [
        `What is "${result?.diseaseName}"?`,
        'What does confidence score mean?',
        'How do I use organic solutions?',
        `What dosage is safe for ${result?.fertilizer}?`,
    ],
    TA: [
        `"${result?.diseaseName}" என்றால் என்ன?`,
        'நம்பிக்கை மதிப்பெண் என்றால் என்ன?',
        'கரிம தீர்வு எப்படி பயன்படுத்துவது?',
        'உரம் எந்த அளவு போட வேண்டும்?',
    ],
    HI: [
        `"${result?.diseaseName}" का मतलब क्या है?`,
        'कॉन्फिडेंस स्कोर क्या होता है?',
        'जैविक उपाय कैसे उपयोग करें?',
        'उर्वरक की मात्रा कितनी डालें?',
    ]
};
```

---

## 🎯 System Prompt Template

```javascript
const systemPrompt = `You are an agricultural explanation assistant. 
Explain crop analysis results in simple language. Answer only what 
the user asks. Use the current crop analysis as context. Avoid 
unnecessary technical jargon and long reports.

STRICT RULES:
- Answer ONLY the farmer's specific question
- Keep responses concise: 150-200 words maximum
- Use bullet points for clarity when listing steps or items
- For definitions: 2-3 sentences + why it's relevant to THIS crop
- For "how-to" questions: 2-4 action steps only
- For "why" questions: 1-2 sentence explanation tied to the analysis
- Always respond in ${langName}
- Base all answers on the provided crop analysis context below
- Keep language simple and farmer-friendly`;
```

---

## 🧪 Testing Commands

### Run Test Suite
```bash
cd backend
node test-explain-result.js
```

### cURL Test (English)
```bash
curl -X POST http://localhost:3001/api/farmer/assistant/explain-result \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is confidence score?",
    "language": "EN",
    "context": {"confidence": 92.5}
  }'
```

### cURL Test (Tamil)
```bash
curl -X POST http://localhost:3001/api/farmer/assistant/explain-result \
  -H "Content-Type: application/json" \
  -d '{
    "question": "நம்பிக்கை மதிப்பெண் என்றால் என்ன?",
    "language": "TA",
    "context": {"confidence": 92.5}
  }'
```

---

## 📊 Response Structure

### Good Response Format
```
[2-3 sentence definition]

• Bullet point 1
• Bullet point 2
• Bullet point 3

[1 sentence relevance to current analysis]
```

### Example (English)
```
Confidence score is the AI's certainty level (0-100%) about 
identifying the disease correctly. Your scan shows 92% confidence, 
which means:

• The AI is highly certain about the Rice Blast identification
• You can trust the treatment recommendations provided
• Higher scores mean more accurate detection

This high confidence comes from clear disease symptoms visible in 
your leaf image.
```

---

## ⚙️ Configuration

### Environment Variables
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (defaults shown)
PORT=3001
```

### API Parameters
```javascript
{
    model: 'gemini-1.5-flash-latest',
    temperature: 0.3,        // Lower = more consistent
    maxOutputTokens: 400,    // Keeps responses concise
    timeout: 30000           // 30 second timeout
}
```

---

## 🐛 Debugging

### Enable Debug Logging
```javascript
// In aiFarmingAssistantController.js
console.log('[explainResult] Request:', { question, language, context });
console.log('[explainResult] System Prompt:', systemPrompt);
console.log('[explainResult] User Message:', userMessage);
console.log('[explainResult] Response:', reply);
```

### Check Logs
```bash
tail -f backend/logs/error.log
tail -f backend/logs/combined.log
```

### Common Errors

**"GEMINI_API_KEY not set"**
```bash
# Solution: Add key to .env
echo "GEMINI_API_KEY=your_key" >> backend/.env
```

**Timeout Error**
```javascript
// Solution: Increase timeout
{ timeout: 60000 } // 60 seconds
```

**Response too long**
```javascript
// Solution: Reduce maxTokens
{ maxOutputTokens: 300 }
```

---

## 📈 Performance Tips

### Optimize Response Time
1. Set lower temperature (0.2-0.3)
2. Reduce maxTokens (300-400)
3. Simplify context (only essential fields)
4. Use connection pooling
5. Add response caching

### Reduce Costs
1. Limit maxTokens to minimum needed
2. Cache common questions/answers
3. Implement rate limiting
4. Monitor usage with analytics

---

## 🔒 Security Best Practices

### ✅ DO:
- Store API key in environment variables
- Validate user input before API call
- Rate limit requests per user
- Log errors (not sensitive data)
- Use HTTPS in production

### ❌ DON'T:
- Expose API key in frontend
- Send PII in context
- Allow unlimited requests
- Log user questions with identifiers
- Use HTTP in production

---

## 📦 Dependencies

### Backend
```json
{
  "axios": "^1.6.0",
  "dotenv": "^16.3.0"
}
```

### Frontend
```json
{
  "react": "^19.0.0",
  "framer-motion": "^10.0.0"
}
```

---

## 🔗 Useful Links

- **API Docs**: https://ai.google.dev/gemini-api/docs
- **Model Card**: https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash
- **Get API Key**: https://aistudio.google.com
- **Pricing**: https://ai.google.dev/pricing

---

## 📞 Support

**Technical Issues**:
- GitHub Issues
- Email: dev@agriaid.ai

**API Issues**:
- Google AI Support: https://support.google.com/ai-platform

---

## 🎓 Learning Resources

### Gemini API Tutorials
- [Getting Started](https://ai.google.dev/gemini-api/docs/get-started)
- [System Instructions](https://ai.google.dev/gemini-api/docs/system-instructions)
- [Best Practices](https://ai.google.dev/gemini-api/docs/prompting-strategies)

### Code Examples
- See: `backend/test-explain-result.js`
- See: `EXPLAIN_RESULT_AI_IMPLEMENTATION.md`

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintained by**: AgriAid.AI Dev Team
