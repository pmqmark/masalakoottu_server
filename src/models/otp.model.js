const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    otp: {
        type: String,
    },

    createdAT: { type: Date, default: Date.now, index: { expires: '5m' } }
}, { timestamps: true })

exports.Otp = mongoose.model("Otp", otpSchema);