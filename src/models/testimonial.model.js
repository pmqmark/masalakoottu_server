const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    designation: { type: String, default: 'customer' },
    content: { type: String, required: true, trim: true },
    image: {
        type: {
            name: { type: String },
            key: { type: String },
            location: { type: String},
        }
    },
})

const Testimonial = mongoose.model('Testimonial', TestimonialSchema);

module.exports = { Testimonial };