const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: { type: String },

    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    email: {
        type: String,
        sparse: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    mobile: {
        type: String,
        unique: true,
        sparse: true,
    },
    password: {
        type: String,
    },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],

    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
    ],

    cart: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],

    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],

    role: { type: String, default: 'user', enum: ['user', 'admin'] },

    isBlocked: { type: Boolean, default: false },

}, { timestamps: true })

exports.User = mongoose.model('User', UserSchema)