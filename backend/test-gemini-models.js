/**
 * Gemini API Model Tester
 * 
 * Tests which Gemini models are available with your API key
 * Run: node backend/test-gemini-models.js
 */

const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Models to test
const MODELS_TO_TEST = [
    'gemini-2.5-flash-preview-05-20',  // Gemini 2.5 Flash (preview)
    'gemini-2.0-flash-exp',            // Gemini 2.0 Flash Experimental
    'gemini-2.0-flash',                // Gemini 2.0 Flash (stable)
    'gemini-1.5-flash',                // Gemini 1.5 Flash
    'gemini-1.5-flash-latest',         // Gemini 1.5 Flash Latest
    'gemini-pro',                      // Gemini Pro
];

async function testModel(modelName) {
    const testPrompt = {
        contents: [{ 
            role: 'user', 
            parts: [{ text: 'Say "Hello" in exactly one word.' }] 
        }],
        systemInstruction: { 
            parts: [{ text: 'You are a helpful assistant. Be concise.' }] 
        },
        generationConfig: { 
            temperature: 0.3, 
            maxOutputTokens: 10 
        }
    };

    try {
        const startTime = Date.now();
        const response = await axios.post(
            `${GEMINI_BASE}/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
            testPrompt,
            { timeout: 10000 }
        );
        const duration = Date.now() - startTime;

        const reply = response.data.candidates[0].content.parts[0].text.trim();
        
        return {
            success: true,
            model: modelName,
            duration,
            reply,
            status: response.status
        };
    } catch (error) {
        return {
            success: false,
            model: modelName,
            error: error.response?.status === 404 ? '404 Model Not Found' 
                 : error.response?.status === 403 ? '403 API Key Invalid/Unauthorized'
                 : error.response?.status === 429 ? '429 Rate Limit Exceeded'
                 : error.code === 'ETIMEDOUT' ? 'Request Timeout'
                 : error.message,
            details: error.response?.data?.error?.message || ''
        };
    }
}

async function testAllModels() {
    console.log('🧪 Testing Gemini API Models\n');
    console.log('='.repeat(80));
    
    // Check API key
    if (!GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY not found in .env file!');
        console.error('   Get your key from: https://aistudio.google.com\n');
        process.exit(1);
    }
    
    console.log(`✅ API Key found: ${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.slice(-4)}\n`);
    console.log('Testing models...\n');
    
    const results = [];
    
    for (const model of MODELS_TO_TEST) {
        console.log(`📝 Testing: ${model}`);
        console.log('-'.repeat(80));
        
        const result = await testModel(model);
        results.push(result);
        
        if (result.success) {
            console.log(`✅ SUCCESS (${result.duration}ms)`);
            console.log(`   Response: "${result.reply}"`);
            console.log('');
        } else {
            console.log(`❌ FAILED`);
            console.log(`   Error: ${result.error}`);
            if (result.details) {
                console.log(`   Details: ${result.details}`);
            }
            console.log('');
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('='.repeat(80));
    console.log('\n📊 Summary:\n');
    
    const working = results.filter(r => r.success);
    const notWorking = results.filter(r => !r.success);
    
    if (working.length > 0) {
        console.log(`✅ Working Models (${working.length}):`);
        working.forEach(r => {
            console.log(`   • ${r.model} (${r.duration}ms)`);
        });
        console.log('');
    }
    
    if (notWorking.length > 0) {
        console.log(`❌ Not Working (${notWorking.length}):`);
        notWorking.forEach(r => {
            console.log(`   • ${r.model} - ${r.error}`);
        });
        console.log('');
    }
    
    // Recommendation
    if (working.length > 0) {
        const fastest = working.reduce((prev, curr) => 
            prev.duration < curr.duration ? prev : curr
        );
        
        console.log('💡 Recommendation:');
        console.log(`   Use: ${fastest.model}`);
        console.log(`   Reason: Fastest response time (${fastest.duration}ms)`);
        console.log('');
        console.log('   Update backend/controllers/aiFarmingAssistantController.js:');
        console.log(`   const GEMINI_25_FLASH = '${fastest.model}';`);
        console.log('');
    } else {
        console.log('❌ No working models found!');
        console.log('   Check your API key at: https://aistudio.google.com');
        console.log('   Make sure the Gemini API is enabled for your project.');
        console.log('');
    }
}

// Run tests
testAllModels().catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});
