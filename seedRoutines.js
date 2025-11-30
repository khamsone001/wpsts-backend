// Seed script to populate initial routines
require('dotenv').config();
const mongoose = require('mongoose');
const Routine = require('./models/Routine');

const MONGO_URI = process.env.MONGO_URI;

const initialRoutines = [
    // Main Routines
    { id: 'A', name: 'ບິນທະບາດ', description: '', type: 'main', order: 1 },
    { id: 'B', name: 'ໄຫວ້ພຣະແລງ', description: '', type: 'main', order: 2 },
    { id: 'C', name: 'ໄຫວ້ພຣະເຊົ້າ', description: '', type: 'main', order: 3 },
    { id: 'D', name: 'ວຽກຕອນເຊົ້າ', description: 'ປັດເດີ່ນວັດ,ຖູສາລາ', type: 'main', order: 4 },

    // Sub Routines
    { id: 'E', name: 'ຫົດດອກໄມ້', description: '', type: 'sub', order: 1 },
    { id: 'F', name: 'ຕີກອງ', description: '', type: 'sub', order: 2 },
    { id: 'G', name: 'ເຝົ້າສາລາ', description: '', type: 'sub', order: 3 },
];

const seedRoutines = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing routines
        await Routine.deleteMany({});
        console.log('Cleared existing routines');

        // Insert initial routines
        await Routine.insertMany(initialRoutines);
        console.log('✅ Initial routines seeded successfully!');
        console.log(`Inserted ${initialRoutines.length} routines`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding routines:', error);
        process.exit(1);
    }
};

seedRoutines();
