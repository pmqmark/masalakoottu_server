const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String },
    subtitle: { type: String },
    panel: { type: String, required: true },
    index: { type: Number, required: true },
    screenType: { type: String, enum: ['mobile', 'desktop'], default: 'desktop', required: true },
    image: {
        type: {
            name: { type: String },
            key: { type: String, required: true },
            location: { type: String, required: true },
        }
    },
})

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = { Banner };