# 🔑 API Key Rotation Setup

## Overview
Automatic API key rotation prevents service interruption when rate limits are hit. System tries all available keys before failing.

## Environment Variables

Add to `backend/.env`:

```env
# Groq Keys (Primary)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY_2=gsk_yyyyyyyyyyyyyyyyyyyyyyyyyy

# Gemini Keys (Fallback)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_API_KEY_2=AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
```

## Rotation Priority

```
GROQ_API_KEY → GROQ_API_KEY_2 → GEMINI_API_KEY → GEMINI_API_KEY_2
```

## How It Works

1. **Rate Limit Detection**: When API returns 429 error
2. **Auto-Switch**: Tries next available key
3. **Console Logs**: Shows which key failed
4. **Fallback Chain**: Groq → Groq_2 → Gemini → Gemini_2

## Functions with Key Rotation

### Groq (`groqAnalyzer.js`)
- ✅ `groqChat()` - Chat completions
- ✅ `groqVision()` - Image analysis
- ✅ `groqCompareScenarios()` - Impact simulator

### Gemini (`geminiAdvisor.js`)
- ✅ `geminiChat()` - All chat operations
- ✅ `geminiParseSoilReport()` - Soil OCR
- ✅ `geminiTreatmentAdvice()` - Disease analysis
- ✅ `geminiWeatherAdvisory()` - Weather insights
- ✅ `geminiSpreadAnalysis()` - Disease spread
- ✅ `geminiFallbackChat()` - General chat
- ✅ `geminiCropSuggestions()` - Crop search
- ✅ `geminiSoilEstimation()` - Soil profiling
- ✅ `geminiNutrientGuidance()` - NPK advice
- ✅ `geminiLiveInsights()` - Market data

## Example Console Output

```
[Groq] Key ...abc123 rate limited, trying next key
[Groq Vision] Key ...xyz789 rate limited, trying next key
[AI] Groq failed, trying Gemini: Rate limit exceeded
```

## Minimum Requirements

- At least **ONE** key is required
- Recommended: 2 Groq + 2 Gemini for maximum uptime
- Free tier limits:
  - Groq: 30 requests/min, 14,400/day
  - Gemini: 15 requests/min, 1,500/day

## Testing

```bash
# Test with invalid first key
GROQ_API_KEY=invalid_key_test
GROQ_API_KEY_2=your_real_key_here

# Server should auto-rotate to working key
npm run dev
```

## Notes

- Keys are tried sequentially, not randomly
- Only 429 errors trigger rotation
- Other errors (401, 500) fail immediately
- Cache reduces API calls by 70%+
