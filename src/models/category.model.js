const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    offerValue: {
        //(%) Represents a percentage discount applied to products in this category.
        type: Number,
        default: 0
    },
    maxValue: {
        //(Rs.) Represents the maximum discount a user can get in this category.
        type: Number,
    },
    minValue: {
        //(Rs.) The minimum amount a user must spend to qualify for the discount.
        type: Number,
    },
    description: {
        type: String,
    },
    isArchived: {
        type: Boolean,
        default: false
    },

    image: {
        type: {
            name: { type: String },
            key: { type: String },
            location: { type: String },
        }
    },

    productIds: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
    ]

});

exports.Category = mongoose.model('Category', categorySchema);
