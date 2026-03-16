const https = require('https');

const API_URL = 'https://wpsts-backend-git-main-khamsone001s-projects.vercel.app/api/works';
// You might need a valid token if endpoints are protected, but let's try a public one or login first if needed.
// Based on previous code, most GETs need a token. Let's try to hit the root first, then login.

const makeRequest = (url, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, data: data });
            });
        });

        req.on('error', (e) => reject(e));

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

const runtest = async () => {
    console.log('--- Testing Vercel API ---');

    // 1. Check Root
    try {
        console.log('1. Checking Root URL...');
        const root = await makeRequest('https://wpsts-backend-git-main-khamsone001s-projects.vercel.app/');
        console.log('Status:', root.statusCode);
        console.log('Response:', root.data);
    } catch (e) {
        console.error('Root Check Failed:', e.message);
    }

    // 2. Try to Login (to get token) - Assumption: User has a test account or we can try to fetch a public route?
    // Looking at code, most routes are protected. Let's just check Root for now to see if DB is connected.
    // If Root returns "Connected", then backend is fine.

    // Let's try to hit /api/users (usually protected but might give 401 instead of timeout)
    try {
        console.log('\n2. Checking /api/users (Expect 401 or 200)...');
        const users = await makeRequest('https://wpsts-backend-git-main-khamsone001s-projects.vercel.app/api/users');
        console.log('Status:', users.statusCode);
        // Don't log full data if it's huge, just length
        console.log('Response Length:', users.data.length);
        if (users.statusCode !== 200) console.log('Response:', users.data);
    } catch (e) {
        console.error('Users Check Failed:', e.message);
    }
};

runtest();
