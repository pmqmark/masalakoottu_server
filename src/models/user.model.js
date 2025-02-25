const mongoose = require('mongoose');
const { credTypeList, genderList, roleList } = require('../config/data');

const UserSchema = new mongoose.Schema({
    credType: {
        type: String,
        enum: credTypeList,
        required: true
    },
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
        enum: genderList
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

            variations: [
                {
                    name: { type: String },
                    option: {
                        value: { type: String },
                        additionalPrice: { type: Number, default: 0 }
                    }
                }
            ]
        },
    ],

    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],

    role: { type: String, default: 'user', enum: roleList },

    isBlocked: { type: Boolean, default: false },

}, { timestamps: true })

exports.User = mongoose.model('User', UserSchema)