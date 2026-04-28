const mongoose = require('mongoose');

// แบบ SRV (ใช้ DNS SRV records) - อาจถูกบล็อก
// const MONGO_URI = 'mongodb+srv://Wpstsmanagement003:khamsone@sone001.s47qyyz.mongodb.net/wpsts_DB2?retryWrites=true&w=majority&appName=sone001';

// แบบ Standard (ใช้ direct connection ผ่าน shard addresses)
const MONGO_URI = 'mongodb://Wpstsmanagement003:khamsone@ac-ftvxsfx-shard-00-00.s47qyyz.mongodb.net:27017,ac-ftvxsfx-shard-00-01.s47qyyz.mongodb.net:27017,ac-ftvxsfx-shard-00-02.s47qyyz.mongodb.net:27017/wpsts_DB2?retryWrites=true&w=majority&authSource=admin';

console.log('🔄 Testing MongoDB Atlas Connection...');
console.log('URI:', MONGO_URI.replace(/\/\/.*:.*@/, '//***:***@'));

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // IPv4 only
})
.then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // List collections
    return mongoose.connection.db.listCollections().toArray();
})
.then(collections => {
    console.log('\n📦 Collections in wpsts_DB2:');
    collections.forEach(col => {
        console.log('  -', col.name);
    });
    
    // Count documents in each collection
    return Promise.all(collections.map(col => {
        return mongoose.connection.db.collection(col.name).countDocuments()
            .then(count => ({ name: col.name, count }));
    }));
})
.then(results => {
    console.log('\n📊 Document counts:');
    results.forEach(r => {
        console.log(`  ${r.name}: ${r.count} documents`);
    });
    
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
})
.catch(err => {
    console.error('❌ Connection failed:', err.message);
    console.error('Error code:', err.code);
    process.exit(1);
});
