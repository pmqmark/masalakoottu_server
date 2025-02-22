const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: { type: String },

    mobile: { type: String },

    otp: { type: String },

    isVerified: { type: Boolean, default: false },

    createdAT: { type: Date, default: Date.now, index: { expires: '15m' } }

})

exports.Otp = mongoose.model("Otp", otpSchema);