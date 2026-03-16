// Simple Node.js script to test API endpoints
const fetch = require('node-fetch');

// Test the API endpoints directly
async function testEndpoints() {
    console.log('Testing API endpoints...');
    
    const baseURL = 'https://wpsts-backend-007.onrender.com/api';
    
    // Test basic endpoint
    try {
        console.log('\n1. Testing GET /users (basic test):');
        const response = await fetch(`${baseURL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✓ Success! Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('✗ Failed with status:', response.status);
            const errorText = await response.text();
            console.log('Error details:', errorText.substring(0, 200) + '...');
        }
    } catch (error) {
        console.log('✗ Error testing users endpoint:', error.message);
    }
    
    // Test another common endpoint
    try {
        console.log('\n2. Testing GET /works (works test):');
        const response = await fetch(`${baseURL}/works`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✓ Success! Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('✗ Failed with status:', response.status);
            const errorText = await response.text();
            console.log('Error details:', errorText.substring(0, 200) + '...');
        }
    } catch (error) {
        console.log('✗ Error testing works endpoint:', error.message);
    }
    
    // Test a simple health check
    try {
        console.log('\n3. Testing GET /health (health check):');
        const response = await fetch(`${baseURL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✓ Success! Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('✗ Failed with status:', response.status);
            const errorText = await response.text();
            console.log('Error details:', errorText.substring(0, 200) + '...');
        }
    } catch (error) {
        console.log('✗ Error testing health endpoint:', error.message);
    }
}

// Run the tests
testEndpoints().catch(console.error);