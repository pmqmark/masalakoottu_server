const { default: mongoose, Schema, model } = require('mongoose');
const { credTypeList, genderList, roleList } = require('../config/data');

const UserSchema = new Schema({
    credType: {
        type: String,
        enum: ['email', 'mobile', 'googleId'],
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
    addresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }],

    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        },
    ],

    cart: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity: {
                type: Number,
                default: 1,
            },

            variations: [
                {
                    variationId: { type: Schema.Types.ObjectId, ref: 'Variation' }, // e.g., 'Color', 'Size'
                    optionId: { type: Schema.Types.ObjectId, ref: 'Option' },
                }
            ]
        },
    ],

    orderHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }],

    role: { type: String, default: 'user', enum: ['user', 'admin'] },

    isBlocked: { type: Boolean, default: false },

}, { timestamps: true })

exports.User = model('User', UserSchema)