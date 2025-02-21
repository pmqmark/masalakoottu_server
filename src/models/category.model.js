const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    offerValue: {
        type: Number,
        default: 0
    },
    maxValue: {
        type: Number,
    },
    minValue: {
        type: Number,
    },
    description: {
        type: String,
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    
    image: {
        type: {
            name: { type: String },
            location: { type: String },
        }
    },
    

});

exports.Category = mongoose.model('Category', categorySchema);
