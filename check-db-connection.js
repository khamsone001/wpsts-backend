// Script ตรวจสอบการเชื่อมต่อฐานข้อมูล MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

console.log('=== Checking MongoDB Connection ===');
console.log('Database URI from .env:', process.env.MONGO_URI);
console.log('Current time:', new Date().toISOString());

// ตั้งค่าการเชื่อมต่อ
const options = {
    serverSelectionTimeoutMS: 10000, // 10 วินาที
    socketTimeoutMS: 45000, // 45 วินาที
    family: 4, // ใช้ IPv4 เท่านั้น
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

console.log('Connection options:', options);

// สร้างการเชื่อมต่อ
const connectDB = async () => {
    try {
        console.log('\n1. Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, options);
        console.log('✓ Connection successful!');
        
        // ตรวจสอบสถานะการเชื่อมต่อ
        console.log('\n2. Checking connection status...');
        const db = mongoose.connection;
        console.log('Database status:', db.readyState);
        
        // ลอง query ข้อมูลง่ายๆ
        console.log('\n3. Testing database query...');
        const collections = await db.db.listCollections().toArray();
        console.log('✓ Database query successful!');
        console.log('Available collections:', collections.map(c => c.name));
        
        // ปิดการเชื่อมต่อ
        console.log('\n4. Closing connection...');
        await mongoose.connection.close();
        console.log('✓ Connection closed successfully!');
        
        console.log('\n=== All tests passed ===');
        
    } catch (error) {
        console.error('\n✗ Connection failed!');
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        
        // ตรวจสอบประเภทของ error
        if (error.name === 'MongoServerSelectionError') {
            console.error('\nServer Selection Error - Possible DNS or network issues');
        } else if (error.name === 'MongoNetworkError') {
            console.error('\nNetwork Error - Check firewall, proxy, or internet connection');
        } else if (error.name === 'MongoTimeoutError') {
            console.error('\nTimeout Error - Connection taking too long');
        }
        
        console.log('\n=== Connection test failed ===');
        process.exit(1);
    }
};

// เริ่มต้นการเชื่อมต่อ
connectDB();