const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',required: true },
    fullName: {
        type: String,
        required: true,
    },
    street: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    pincode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
}, { timestamps: true });


const Address = mongoose.model('Address', addressSchema)

module.exports = { Address }