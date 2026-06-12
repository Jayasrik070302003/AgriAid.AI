/**
 * Backend Connection Test Script
 * 
 * Run: node backend/test-connection.js
 */

const axios = require('axios');

const BASE_URL = process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3001';

async function testConnection() {
    console.log('🧪 Testing Backend Connection...\n');
    console.log(`Target: ${BASE_URL}\n`);
    console.log('='.repeat(80) + '\n');

    const tests = [
        {
            name: 'Root Endpoint',
            url: `${BASE_URL}`,
            method: 'GET',
            description: 'Tests if backend server is running'
        },
        {
            name: 'Farmer Routes',
            url: `${BASE_URL}/api/farmer/history`,
            method: 'GET',
            description: 'Tests if farmer routes are accessible'
        },
        {
            name: 'Explain Result Endpoint',
            url: `${BASE_URL}/api/farmer/assistant/explain-result`,
            method: 'POST',
            data: {
                question: 'What is confidence score?',
                language: 'EN',
                context: { 
                    confidence: 90,
                    diseaseName: 'Test Disease'
                }
            },
            description: 'Tests the Explain Result AI Assistant endpoint'
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        console.log(`📝 Test: ${test.name}`);
        console.log(`   Description: ${test.description}`);
        console.log('-'.repeat(80));

        try {
            const startTime = Date.now();
            
            let response;
            if (test.method === 'GET') {
                response = await axios.get(test.url, { timeout: 10000 });
            } else {
                response = await axios.post(test.url, test.data, { 
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000 
                });
            }
            
            const duration = Date.now() - startTime;
            
            console.log(`✅ SUCCESS (${duration}ms)`);
            console.log(`   Status: ${response.status} ${response.statusText}`);
            console.log(`   Response Preview:`);
            
            const preview = JSON.stringify(response.data, null, 2);
            const lines = preview.split('\n').slice(0, 10);
            console.log(`   ${lines.join('\n   ')}`);
            
            if (preview.split('\n').length > 10) {
                console.log(`   ... (truncated)`);
            }
            
            console.log('');
            passed++;
            
        } catch (error) {
            console.log(`❌ FAILED`);
            
            if (error.code === 'ECONNREFUSED') {
                console.log(`   Error: Connection Refused`);
                console.log(`   Cause: Backend server is not running`);
                console.log(`   Fix: Run 'npm run dev' in backend folder`);
                console.log(`   Command: cd backend && npm run dev`);
            } else if (error.code === 'ETIMEDOUT') {
                console.log(`   Error: Request Timeout`);
                console.log(`   Cause: Server is too slow to respond`);
                console.log(`   Fix: Check server logs for errors`);
            } else if (error.response) {
                console.log(`   Status: ${error.response.status} ${error.response.statusText}`);
                console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
            } else {
                console.log(`   Error: ${error.message}`);
            }
            
            console.log('');
            failed++;
        }
    }

    // Summary
    console.log('='.repeat(80));
    console.log(`\n📊 Test Summary:`);
    console.log(`   ✅ Passed: ${passed}/${tests.length}`);
    console.log(`   ❌ Failed: ${failed}/${tests.length}`);

    if (failed === 0) {
        console.log(`\n🎉 All tests passed! Backend is running correctly.`);
        console.log(`   Frontend can connect to: ${BASE_URL}\n`);
        process.exit(0);
    } else {
        console.log(`\n⚠️  Some tests failed. Follow the fixes above.\n`);
        
        if (failed === tests.length) {
            console.log(`❌ Backend appears to be completely offline.`);
            console.log(`\n🔧 Quick Fix:`);
            console.log(`   1. Open a new terminal`);
            console.log(`   2. cd backend`);
            console.log(`   3. npm run dev`);
            console.log(`   4. Wait for "Server running on port 3001"`);
            console.log(`   5. Re-run this test: node test-connection.js\n`);
        }
        
        process.exit(1);
    }
}

// Check if axios is available
try {
    require.resolve('axios');
} catch (e) {
    console.error('❌ axios is not installed!');
    console.error('   Fix: cd backend && npm install\n');
    process.exit(1);
}

// Run tests
testConnection().catch(err => {
    console.error('❌ Test execution failed:', err.message);
    process.exit(1);
});
