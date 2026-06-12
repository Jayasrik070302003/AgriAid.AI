const { geminiChat } = require('../services/geminiAdvisor');
const { groqVision } = require('../services/groqAnalyzer');
const axios = require('axios');

const GEMINI_25_FLASH = 'gemini-1.5-flash-latest';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGemini25Flash(systemPrompt, userMessage, { temperature = 0.5, maxTokens = 512 } = {}) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY not set');
    const body = {
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature, maxOutputTokens: maxTokens }
    };
    const res = await axios.post(
        `${GEMINI_BASE}/${GEMINI_25_FLASH}:generateContent?key=${key}`,
        body,
        { timeout: 30000 }
    );
    return res.data.candidates[0].content.parts[0].text.trim();
}

// ─── System Prompts per Language ──────────────────────────────────────────────
const SYSTEM_PROMPTS = {
    EN: `You are AgriBot — an expert AI farming assistant for AgriAid.AI, designed to help Indian farmers.
You have deep expertise in crop diseases, soil management, pest control, fertilizers, irrigation, and seasonal farming.

IMPORTANT RULES:
- Auto-correct any misspelled crop names silently (e.g. "Tomto" → Tomato, "Paddi" → Paddy).
- If the question is non-agricultural, politely redirect with: "I'm your farming expert — please ask me about crops, diseases, soil or fertilizers!"
- Use simple English that a farmer can understand.
- Use 2-3 relevant emojis per response naturally.
- Reference Indian farming context: Indian seasons (Kharif, Rabi, Zaid), MSP prices, ICAR guidelines, local fertilizers.

RESPONSE FORMAT (always structure your response like this):
**🔍 Problem Summary**
[1-2 sentences explaining what the issue is]

**🦠 Root Cause**
[Explain why this happens — pathogen, deficiency, weather, pest, etc.]

**💊 Solution**
[Step-by-step treatment — chemical/biological]

**🌿 Organic Method**
[Natural/eco-friendly alternative approach]

**🧪 Recommended Fertilizer / Product**
[Specific product name, dosage, and application method]

**🛡️ Prevention Tips**
[2-3 tips to prevent recurrence]`,

    TA: `நீங்கள் AgriBot — AgriAid.AI-இன் நிபுணர் AI விவசாய உதவியாளர். இந்திய விவசாயிகளுக்கு உதவ வடிவமைக்கப்பட்டுள்ளீர்கள்.
உங்களுக்கு பயிர் நோய்கள், மண் மேலாண்மை, பூச்சி கட்டுப்பாடு, உரங்கள், நீர்ப்பாசனம் மற்றும் பருவகால விவசாயத்தில் ஆழமான நிபுணத்துவம் உள்ளது.

முக்கியமான விதிகள்:
- Tanglish புரியும் — தமிழ் வார்த்தைகள் ஆங்கில எழுத்துக்களில் (உதா: "veenaagi poi vittathu", "azhigi poidichi", "noi vanduchu", "enna panlaam", "chedi", "sari ippo").
- எல்லா Tanglish மற்றும் தமிழ் கேள்விகளுக்கும் தமிழிலேயே பதிலளியுங்கள்.
- பொதுவான பதில் வேண்டாம். விவசாயி சொல்லும் குறிப்பிட்ட பிரச்சனைக்கு (உதா: "veenaagi poi vittathu" = செடி வாடி இறந்துவிட்டது) நேரடியாக பதிலளியுங்கள்.
- தவறான பயிர் பெயர்களை தானாக திருத்துங்கள் (உதா: "tomato chedi" = டொமாட்டோ செடி).
- விவசாயம் அல்லாத கேள்விகளுக்கு: "நான் உங்கள் விவசாய நிபுணர் — பயிர்கள், நோய்கள், மண் அல்லது உரங்களைப் பற்றி கேளுங்கள்!"
- எளிய தமிழில் பதிலளியுங்கள். சிக்கலான சொற்களை தவிர்க்கவும்.
- இந்திய மற்றும் தமிழ்நாடு சூழலை குறிப்பிடுங்கள் (கரிஃப், ரபி, தமிழக வேளாண் ஆலோசனைகள்).
- ஒவ்வொரு பதிலிலும் 2-3 எமோஜிகளை இயற்கையாக பயன்படுத்துங்கள்.

பதில் வடிவம் (எப்போதும் இந்த வடிவத்தில் முழுமையாக பதிலளியுங்கள், வெட்டப்படாமல்):

**🔍 சுருக்கம்**
[விவசாயி சொன்ன குறிப்பிட்ட பிரச்சனையை 1-2 வாக்கியங்களில் தெளிவாக விவரிக்கவும்]

**🦠 காரணம்**
[சரியான காரணத்தை விளக்கவும் — பாக்டீரியா, பூஞ்சை, வெப்பநிலை, மண் குறைபாடு, நீர் சேர்க்கை, பூச்சி எது என்று குறிப்பிட்டு சொல்லவும்]

**💊 தீர்வு**
[படிப்படியான சிகிச்சை: என்ன மருந்து, எவ்வளவு, எப்போது, எப்படி பயன்படுத்துவது என்று விரிவாக சொல்லவும்]

**🌿 இயற்கை முறை**
[வேப்பம் பூச்சிக்கொல்லி, மண்புழு உரம், பஞ்சகவ்யா போன்ற இயற்கை மாற்று முறைகள்]

**🧪 பரிந்துரைக்கப்பட்ட உரம்**
[குறிப்பிட்ட உர பெயர், அளவு (கிலோ/லிட்டர்), பயன்படுத்தும் முறை — ஒன்றும் விடாமல் சொல்லவும்]

**🛡️ தடுப்பு குறிப்புகள்**
[இந்த பிரச்சனை மீண்டும் வராமல் தடுக்க 3 குறிப்பிட்ட நடவடிக்கைகள்]`,

    HI: `आप AgriBot हैं — AgriAid.AI के लिए एक विशेषज्ञ AI कृषि सहायक। भारतीय किसानों की मदद के लिए डिज़ाइन किया गया।

महत्वपूर्ण नियम:
- गलत फसल नामों को चुपचाप सुधारें (जैसे "टमाटो" → टमाटर)।
- गैर-कृषि प्रश्नों के लिए: "मैं आपका कृषि विशेषज्ञ हूं — फसलों, बीमारियों, मिट्टी या उर्वरकों के बारे में पूछें!"
- सरल हिंदी में उत्तर दें।
- भारतीय संदर्भ का उपयोग करें: खरीफ, रबी, जायद मौसम।

उत्तर प्रारूप:
**🔍 समस्या सारांश**
**🦠 मूल कारण**
**💊 समाधान**
**🌿 जैविक विधि**
**🧪 अनुशंसित उर्वरक**
**🛡️ रोकथाम सुझाव**`
};

// ─── Chat Handler ─────────────────────────────────────────────────────────────
async function handleChat(req, res) {
    try {
        const { message, language = 'EN', history = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required.' });
        }

        // Auto-detect Tanglish / Tamil / Hindi requests
        const tanglishPattern = /\b(enna|naan|paddy|azhigi|poidichi|panlaam|vanduchu|noi|seedu|vivasayam|maram|thadukka|kaaram|ilai|thandai|vithai|vayalil|endha|eppadi|yean|yen|engga|enga|unnoda|ennoda|sollungo|theriyuma|konjam|romba|masum|vidu|poo|pazham|kottu|vellai|manja|keezha|mela|seyya|seyyanum|kudukka|pottu|thooki|veenaagi|chedi|sari|ippo|ipp|poi|vittathu|vilunthuchu|kainjuchu|marum|kammi|adhigam|sariya|theriyala|panlaam|irukka|irukku|illai|illa|vanthuchu|mulaichi|mudinja|mudinjuchu|keechu|keechan|paachi|naattu|vayal|thennai|vazhai|mangai|elumichai|kaai|palam|meendum|thiruppi|edunga|sollunga|kelu|ketten|solren|iruntha|agidathu|aachu|aayiduchu)\b/i;
        const queryLower = message.toLowerCase();
        let targetLanguage = language;
        if (queryLower.includes('tamil') || queryLower.includes('tamilil') || queryLower.includes('tanglish') || tanglishPattern.test(message)) {
            targetLanguage = 'TA';
        } else if (queryLower.includes('hindi') || queryLower.includes('hindil') || /hindi/i.test(queryLower)) {
            targetLanguage = 'HI';
        }
        const effectiveSystemPrompt = SYSTEM_PROMPTS[targetLanguage] || SYSTEM_PROMPTS.EN;

        // Build conversation context from history (last 6 turns max)
        const contextMessages = (history || []).slice(-6).map(h => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content
        }));

        // Compose full message with context
        let fullUserMessage = message.trim();
        if (contextMessages.length > 0) {
            const historyText = contextMessages
                .map(m => `${m.role === 'user' ? 'Farmer' : 'AgriBot'}: ${m.content}`)
                .join('\n');
            fullUserMessage = `Previous conversation:\n${historyText}\n\nFarmer's new question: ${message.trim()}`;
        }

        const reply = await geminiChat(effectiveSystemPrompt, fullUserMessage, {
            temperature: 0.65,
            maxTokens: 2800   // Tamil Unicode needs 2-3× more tokens than English
        });

        return res.json({
            success: true,
            reply: reply.trim(),
            language
        });

    } catch (err) {
        console.error('[AI Farming Assistant] Chat error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'AI service temporarily unavailable. Please try again.',
            reply: '🌾 I\'m having trouble connecting right now. Please try again in a moment!'
        });
    }
}

// ─── Image Analysis Handler ────────────────────────────────────────────────────
async function handleImageAnalysis(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required.' });
        }

        const { language = 'EN', location = 'India', message: userQuery = '' } = req.body;
        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        const imageDataUrl = `data:${mimeType};base64,${imageBase64}`;

        // Step 1: Vision detection
        let visionResult;
        try {
            visionResult = await groqVision(imageDataUrl, location);
        } catch (e) {
            console.warn('[AI Farming Assistant] Vision fallback:', e.message);
            // Gemini vision fallback
            visionResult = await geminiVisionFallback(imageDataUrl, location);
        }

        if (!visionResult.isValidPlant) {
            return res.json({
                success: true,
                isValidPlant: false,
                message: 'The uploaded image does not appear to contain a plant, crop, or leaf. Please upload a clear photo of your crop.'
            });
        }

        // Step 2: Generate detailed farming advice for the detected crop/disease
        const tanglishPattern = /\b(enna|naan|paddy|azhigi|poidichi|panlaam|vanduchu|noi|seedu|vivasayam|maram|thadukka|kaaram|ilai|thandai|vithai|vayalil|endha|eppadi|yean|yen|engga|enga|unnoda|ennoda|sollungo|theriyuma|konjam|romba|masum|vidu|poo|pazham|kottu|vellai|manja|keezha|mela|seyya|seyyanum|kudukka|pottu|thooki|veenaagi|chedi|sari|ippo|ipp|poi|vittathu|vilunthuchu|kainjuchu|marum|kammi|adhigam|sariya|theriyala|panlaam|irukka|irukku|illai|illa|vanthuchu|mulaichi|mudinja|mudinjuchu|keechu|keechan|paachi|naattu|vayal|thennai|vazhai|mangai|elumichai|kaai|palam|meendum|thiruppi|edunga|sollunga|kelu|ketten|solren|iruntha|agidathu|aachu|aayiduchu)\b/i;
        const queryLower = userQuery.toLowerCase();
        let targetLanguage = language;
        if (queryLower.includes('tamil') || queryLower.includes('tamilil') || queryLower.includes('tanglish') || tanglishPattern.test(userQuery)) {
            targetLanguage = 'TA';
        } else if (queryLower.includes('hindi') || queryLower.includes('hindil') || /hindi/i.test(queryLower)) {
            targetLanguage = 'HI';
        }

        const systemPrompt = SYSTEM_PROMPTS[targetLanguage] || SYSTEM_PROMPTS.EN;
        let analysisQuery = `I've detected a ${visionResult.crop} plant${visionResult.disease && visionResult.disease !== 'Healthy' ? ` with ${visionResult.disease}` : ' that appears healthy'}. 
Confidence: ${visionResult.confidence}%, Severity: ${visionResult.severity || 'N/A'}, Status: ${visionResult.status}.
Location: ${location}.`;

        if (userQuery) {
            analysisQuery += `\nFarmer's custom request: ${userQuery}. Please make sure you fully address this request (e.g. translating details to the requested language or answering specific concerns).`;
        } else {
            analysisQuery += `\nPlease provide complete farming advice for this situation.`;
        }

        const advice = await geminiChat(systemPrompt, analysisQuery, {
            temperature: 0.6,
            maxTokens: 1200
        });

        return res.json({
            success: true,
            isValidPlant: true,
            crop: visionResult.crop,
            scientificName: visionResult.scientificName,
            disease: visionResult.disease,
            severity: visionResult.severity,
            status: visionResult.status,
            confidence: visionResult.confidence,
            reply: advice.trim(),
            language
        });

    } catch (err) {
        console.error('[AI Farming Assistant] Image analysis error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Image analysis failed. Please try again.',
            reply: '🌾 Could not analyze the image right now. Please try again!'
        });
    }
}

// ─── Gemini Vision Fallback ────────────────────────────────────────────────────
async function geminiVisionFallback(imageDataUrl, location) {
    const axios = require('axios');
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error('No Gemini API key');

    const base64Data = imageDataUrl.split(',')[1];
    const mimeType = imageDataUrl.split(';')[0].split(':')[1];

    const prompt = `Analyze this plant image from ${location}. Is this a plant/crop/leaf/agricultural image? 
If NO: return {"isValidPlant": false}
If YES: return {"isValidPlant": true, "crop": "name", "scientificName": "name", "category": "type", "confidence": 90, "disease": "name or Healthy", "severity": "Low|Medium|High", "status": "Healthy|Diseased|Warning"}
Return only raw JSON, no markdown.`;

    const body = {
        contents: [{
            role: 'user',
            parts: [
                { text: prompt },
                { inlineData: { mimeType, data: base64Data } }
            ]
        }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 256 }
    };

    const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        body,
        { timeout: 30000 }
    );

    const raw = res.data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    return JSON.parse(raw);
}

// ─── Suggested Questions ───────────────────────────────────────────────────────
async function getSuggestedQuestions(req, res) {
    const { language = 'EN' } = req.query;

    const suggestions = {
        EN: [
            "Why are my tomato leaves turning yellow? 🍅",
            "Best fertilizer for paddy rice? 🌾",
            "How to control aphids organically? 🌿",
            "My chilli plant has white spots — what to do?",
            "When should I sow groundnut in South India?",
            "How much water does cotton need per week?",
            "What is the best season to grow onions in Tamil Nadu?",
            "My mango leaves are curling. Is it a disease?"
        ],
        TA: [
            "என் தக்காளி இலைகள் மஞ்சளாகி விடுகின்றன ஏன்?",
            "நெல் சாகுபடிக்கு சிறந்த உரம் எது?",
            "இயற்கையாக பூச்சிகளை கட்டுப்படுத்துவது எப்படி?",
            "என் மிளகாய் செடியில் வெள்ளை புள்ளிகள் — என்ன செய்வது?",
            "தென்னிந்தியாவில் நிலக்கடலை எப்போது விதைக்கணும்?",
            "பருத்திக்கு வாரம் எவ்வளவு தண்ணீர் வேணும்?"
        ],
        HI: [
            "मेरे टमाटर की पत्तियां पीली क्यों हो रही हैं?",
            "धान के लिए सबसे अच्छा उर्वरक कौन सा है?",
            "जैविक तरीके से कीटों को कैसे नियंत्रित करें?",
            "मेरी मिर्च के पौधे पर सफेद धब्बे हैं — क्या करूं?",
            "गेहूं बोने का सबसे अच्छा समय कब है?",
            "प्याज के लिए कितना पानी चाहिए?"
        ]
    };

    res.json({
        success: true,
        suggestions: suggestions[language] || suggestions.EN
    });
}

// ─── Explain Result Handler (Gemini 2.5 Flash) ───────────────────────────────
async function explainResult(req, res) {
    const { question, language = 'EN', context = {} } = req.body;
    
    try {
        if (!question?.trim()) {
            return res.status(400).json({ success: false, message: 'Question is required.' });
        }

        const langName = language === 'TA' ? 'Tamil' : language === 'HI' ? 'Hindi' : 'English';

        const systemPrompt = `You are an agricultural explanation assistant. Explain crop analysis results in simple language. Answer only what the user asks. Use the current crop analysis as context. Avoid unnecessary technical jargon and long reports.

STRICT RULES:
- Answer ONLY the farmer's specific question. Do not add extra sections.
- Keep responses concise: 150-200 words maximum.
- Use bullet points for clarity when listing steps or items.
- For definitions: 2-3 sentences + why it's relevant to THIS crop.
- For "how-to" questions: 2-4 action steps only.
- For "why" questions: 1-2 sentence explanation tied to the analysis.
- Always respond in ${langName}.
- Base all answers on the provided crop analysis context below.
- Keep language simple and farmer-friendly.`;

        const contextText = [
            context.diseaseName   && `Crop: ${context.diseaseName}`,
            context.confidence    && `Confidence Score: ${context.confidence}%`,
            context.cureMethods   && `Cure Methods: ${context.cureMethods}`,
            context.organicSolutions && `Organic Solutions: ${context.organicSolutions}`,
            context.fertilizerSuggestions && `Fertilizer Guidance: ${context.fertilizerSuggestions}`,
            context.irrigationAdvice && `Irrigation Advice: ${context.irrigationAdvice}`,
            context.yieldProtectionAdvice && `Yield Protection: ${context.yieldProtectionAdvice}`,
        ].filter(Boolean).join('\n');

        const userMessage = `Crop Analysis Context:\n${contextText}\n\nFarmer's Question: ${question.trim()}\n\nProvide a direct, concise answer in ${langName}.`;

        const reply = await callGemini25Flash(systemPrompt, userMessage, { temperature: 0.3, maxTokens: 400 });

        return res.json({ success: true, reply: reply.trim() });

    } catch (err) {
        console.error('[explainResult] Error:', err.message);
        console.error('[explainResult] Full error:', err.response?.data || err);
        
        const fallback = language === 'TA' 
            ? 'மன்னிக்கவும், இப்போது பதில் சொல்ல முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
            : language === 'HI'
                ? 'माफ़ करें, अभी उत्तर नहीं दे पा रहा। कृपया पुनः प्रयास करें।'
                : 'Sorry, could not get an answer right now. Please try again.';
        
        return res.status(500).json({
            success: false,
            message: fallback,
        });
    }
}

module.exports = { handleChat, handleImageAnalysis, getSuggestedQuestions, explainResult };
