const https = require('https');

console.log('🔍 Checking Render Server Status...\n');

// Test 1: Check if Render is reachable
const testRender = () => {
    return new Promise((resolve, reject) => {
        const req = https.get('https://wpsts-backend.onrender.com/', (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('✅ Render is reachable!');
                console.log(`Status Code: ${res.statusCode}`);
                console.log(`Response: ${data}\n`);
                resolve({ success: true, statusCode: res.statusCode, data });
            });
        });

        req.on('error', (error) => {
            console.log('❌ Cannot reach Render!');
            console.log(`Error: ${error.message}\n`);
            reject(error);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout (10s)'));
        });
    });
};

// Test 2: Check Render Logs URL
const checkRenderDashboard = () => {
    console.log('📊 Render Dashboard:');
    console.log('👉 https://dashboard.render.com/');
    console.log('   Go to: Services → wpsts-backend → Logs\n');
};

// Run tests
(async () => {
    try {
        await testRender();
        console.log('✅ All checks passed!');
        console.log('If you still see errors, check Render Dashboard logs.');
    } catch (error) {
        console.log('\n⚠️ Render Server Issues Detected!\n');
        console.log('Possible causes:');
        console.log('1. ❌ Server crashed due to MongoDB connection error');
        console.log('2. ❌ Environment variables not set correctly');
        console.log('3. ❌ Render is deploying (wait 2-3 minutes)');
        console.log('4. ❌ Render service is suspended/stopped\n');

        checkRenderDashboard();

        console.log('💡 Quick Fix:');
        console.log('1. Check Render Dashboard → Logs');
        console.log('2. Look for error messages (especially MongoDB errors)');
        console.log('3. Verify MONGO_URI in Environment Variables');
        console.log('4. Try Manual Deploy if needed\n');
    }
})();
