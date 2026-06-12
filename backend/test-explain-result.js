/**
 * Test Script for Explain Result AI Assistant
 * 
 * Run: node backend/test-explain-result.js
 */

const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.CLIENT_URL || 'http://localhost:3001';

// Test cases for all three languages
const testCases = [
    {
        name: 'English: What is confidence score?',
        language: 'EN',
        question: 'What is confidence score?',
        context: {
            diseaseName: 'Rice Blast',
            confidence: 92.5,
            cureMethods: 'Apply Tricyclazole fungicide 75% WP @ 0.6g/L every 7 days',
            organicSolutions: 'Neem oil spray @ 5ml/L weekly',
            fertilizerSuggestions: 'NPK 20:10:10 @ 50kg/acre',
            irrigationAdvice: 'Drip irrigation twice daily, avoid waterlogging',
            yieldProtectionAdvice: 'Remove infected leaves, maintain field hygiene'
        }
    },
    {
        name: 'Tamil: நம்பிக்கை மதிப்பெண் என்றால் என்ன?',
        language: 'TA',
        question: 'நம்பிக்கை மதிப்பெண் என்றால் என்ன?',
        context: {
            diseaseName: 'Rice Blast',
            confidence: 92.5,
            cureMethods: 'Apply Tricyclazole fungicide 75% WP @ 0.6g/L every 7 days',
            organicSolutions: 'Neem oil spray @ 5ml/L weekly',
            fertilizerSuggestions: 'NPK 20:10:10 @ 50kg/acre',
            irrigationAdvice: 'Drip irrigation twice daily, avoid waterlogging',
            yieldProtectionAdvice: 'Remove infected leaves, maintain field hygiene'
        }
    },
    {
        name: 'Hindi: कॉन्फिडेंस स्कोर क्या होता है?',
        language: 'HI',
        question: 'कॉन्फिडेंस स्कोर क्या होता है?',
        context: {
            diseaseName: 'Rice Blast',
            confidence: 92.5,
            cureMethods: 'Apply Tricyclazole fungicide 75% WP @ 0.6g/L every 7 days',
            organicSolutions: 'Neem oil spray @ 5ml/L weekly',
            fertilizerSuggestions: 'NPK 20:10:10 @ 50kg/acre',
            irrigationAdvice: 'Drip irrigation twice daily, avoid waterlogging',
            yieldProtectionAdvice: 'Remove infected leaves, maintain field hygiene'
        }
    },
    {
        name: 'English: How do I use organic solutions?',
        language: 'EN',
        question: 'How do I use organic solutions?',
        context: {
            diseaseName: 'Tomato Leaf Curl',
            confidence: 88.0,
            cureMethods: 'Apply Imidacloprid @ 0.5ml/L',
            organicSolutions: 'Neem oil spray (1000 ppm) @ 5ml/L + Sticky yellow traps',
            fertilizerSuggestions: 'Balanced NPK + Calcium spray',
            irrigationAdvice: 'Morning irrigation, keep foliage dry',
            yieldProtectionAdvice: 'Remove infected plants immediately'
        }
    },
    {
        name: 'Tamil: கரிம தீர்வு எப்படி பயன்படுத்துவது?',
        language: 'TA',
        question: 'கரிம தீர்வு எப்படி பயன்படுத்துவது?',
        context: {
            diseaseName: 'Tomato Leaf Curl',
            confidence: 88.0,
            organicSolutions: 'Neem oil spray (1000 ppm) @ 5ml/L + Sticky yellow traps',
        }
    }
];

async function runTests() {
    console.log('🧪 Testing Explain Result AI Assistant\n');
    console.log('=' .repeat(80));
    
    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY not found in .env file!');
        console.error('   Get your key from: https://aistudio.google.com\n');
        process.exit(1);
    }
    
    console.log('✅ GEMINI_API_KEY found in environment\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const test of testCases) {
        console.log(`\n📝 Test: ${test.name}`);
        console.log('-'.repeat(80));
        
        try {
            const startTime = Date.now();
            
            const response = await axios.post(
                `${API_URL}/api/farmer/assistant/explain-result`,
                {
                    question: test.question,
                    language: test.language,
                    context: test.context
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            );
            
            const duration = Date.now() - startTime;
            
            if (response.data.success && response.data.reply) {
                const wordCount = response.data.reply.split(/\s+/).length;
                
                console.log(`✅ PASSED (${duration}ms)`);
                console.log(`   Word Count: ${wordCount} words`);
                console.log(`   Response:\n`);
                console.log(`   ${response.data.reply.split('\n').join('\n   ')}`);
                
                // Validate response length
                if (wordCount > 250) {
                    console.log(`   ⚠️  Warning: Response exceeds 200 word target (${wordCount} words)`);
                } else {
                    console.log(`   ✓ Response length appropriate`);
                }
                
                passed++;
            } else {
                console.log(`❌ FAILED: Invalid response structure`);
                console.log(`   Response:`, response.data);
                failed++;
            }
            
        } catch (error) {
            console.log(`❌ FAILED: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Error:`, error.response.data);
            }
            failed++;
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 Test Summary:`);
    console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
    console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
    
    if (failed === 0) {
        console.log(`\n🎉 All tests passed! Explain Result AI Assistant is working correctly.\n`);
        process.exit(0);
    } else {
        console.log(`\n⚠️  Some tests failed. Please check the errors above.\n`);
        process.exit(1);
    }
}

// Run tests
runTests().catch(err => {
    console.error('❌ Test execution failed:', err.message);
    process.exit(1);
});
