const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    house: String,
    city: String,
    district: String,
}, { _id: false });

const PersonalInfoSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    name: String,
    nickname: String,
    age: Number,
    class: { type: String, enum: ['M', 'N'] },
    currentAddress: AddressSchema,
}, { _id: false });

const FamilyMemberSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    age: Number,
    placeOfBirth: AddressSchema,
    currentAddress: AddressSchema,
}, { _id: false });

const FamilySchema = new mongoose.Schema({
    father: FamilyMemberSchema,
    mother: FamilyMemberSchema,
}, { _id: false });

const ClassHistorySchema = new mongoose.Schema({
    entryDate: Date,
    location: AddressSchema,
    issuerName: String,
    idCard: String,
    totalWorkAge: Number,
}, { _id: false });

const HistorySchema = new mongoose.Schema({
    workAge: Number,
    birthDate: Date,
    placeOfBirth: AddressSchema,
    race: String,
    nationality: String,
    tribe: String,
    education: String,
    classN: ClassHistorySchema,
    classM: ClassHistorySchema,
}, { _id: false });

const WorkInfoSchema = new mongoose.Schema({
    skillLevel: { type: Number, default: 0 },
}, { _id: false });

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    // We will handle password hashing later
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'manager', 'admin', 'super_admin'],
        default: 'user',
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    photoURL: String,
    personalInfo: PersonalInfoSchema,
    history: HistorySchema,
    family: FamilySchema,
    workInfo: WorkInfoSchema,
    firebaseUid: { type: String, unique: true, sparse: true } // To map old data
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('User', UserSchema);