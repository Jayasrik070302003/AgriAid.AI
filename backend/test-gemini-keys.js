/**
 * Test All Gemini API Keys
 * 
 * Run: node backend/test-gemini-keys.js
 */

const axios = require('axios');

const KEYS_TO_TEST = [
    'AIzaSyBKG_gc-UIfYc39VOxWgnZ8Lulg3S8YdaQ',
    'AIzaSyCQbYcqXiDuSYhvX9Z69nJ-L8aG91e6r88',
    'AIzaSyAdfahDJ54ILLs_qcIh8QxxiRfEY4rfIe4'
];

const MODELS_TO_TEST = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-pro'
];

async function testKey(apiKey, model) {
    const testPrompt = {
        contents: [{ 
            role: 'user', 
            parts: [{ text: 'Say hello in one word.' }] 
        }],
        generationConfig: { 
            temperature: 0.3, 
            maxOutputTokens: 10 
        }
    };

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            testPrompt,
            { timeout: 10000 }
        );
        
        return {
            success: true,
            reply: response.data.candidates[0].content.parts[0].text.trim()
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.status === 404 ? '404 Model Not Found' 
                 : error.response?.status === 403 ? '403 Invalid/Unauthorized'
                 : error.response?.status === 400 ? '400 Bad Request'
                 : error.response?.data?.error?.message || error.message
        };
    }
}

async function testAllKeys() {
    console.log('🔑 Testing All Gemini API Keys\n');
    console.log('='.repeat(80));
    
    for (let i = 0; i < KEYS_TO_TEST.length; i++) {
        const key = KEYS_TO_TEST[i];
        console.log(`\n📝 Key #${i + 1}: ${key.substring(0, 15)}...${key.slice(-4)}`);
        console.log('-'.repeat(80));
        
        let keyWorking = false;
        let workingModel = null;
        
        for (const model of MODELS_TO_TEST) {
            const result = await testKey(key, model);
            
            if (result.success) {
                console.log(`   ✅ ${model}: SUCCESS - "${result.reply}"`);
                keyWorking = true;
                if (!workingModel) workingModel = model;
            } else {
                console.log(`   ❌ ${model}: ${result.error}`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        if (keyWorking) {
            console.log(`\n   🎉 KEY #${i + 1} WORKS! Use with model: ${workingModel}`);
        } else {
            console.log(`\n   ❌ KEY #${i + 1} FAILED - All models returned errors`);
        }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n💡 Recommendation:\n');
    console.log('Edit backend/.env and keep ONLY ONE GEMINI_API_KEY line:');
    console.log('Remove the duplicate lines and keep the working key.\n');
}

testAllKeys().catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});
