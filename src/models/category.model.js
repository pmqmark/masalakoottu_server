const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
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
