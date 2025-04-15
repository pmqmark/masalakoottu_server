const nodemailer = require('nodemailer');
const { default: axios } = require("axios");
const { Otp } = require('../models/otp.model');
const { OAuth2Client } = require("google-auth-library");
const { sendEmail } = require('../utils/mailer.util');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports.sendOTPViaEmail = async (email, OTP) => {
    try {
        const mailObj = {
            from: `"Masalakoottu" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "OTP for Authentication",
            html: `
                <span>OTP: ${OTP}</span>
                <p>Use this OTP within 5 minutes</p>
            `,
        }

        return await sendEmail(mailObj)
    } catch (error) {
        console.error('Error sending OTP via email:', error);
        throw error;
    }
};

module.exports.sendOTPViaSMS = async (mobile, OTP) => {
    try {
        const options = {
            method: 'get',
            url: process.env.FAST2SMS_API_URL,
            params: {
                authorization: process.env.FAST2SMS_API_KEY,
                variables_values: OTP,
                route: 'otp',
                numbers: mobile,
            },
            headers: {
                'Cache-Control': 'no-cache',
            },
        };

        return await axios(options);
    } catch (error) {
        console.error('Error sending OTP via SMS:', error);
        throw error;
    }
};

module.exports.getOTPWithMobile = async (mobile) => {
    return await Otp.findOne({ mobile }).lean()
}

module.exports.getOTPWithEmail = async (email) => {
    return await Otp.findOne({ email }).lean()
}

module.exports.deleteOTP = async (id) => {
    return await Otp.findByIdAndDelete(id);
}

module.exports.createOTP = async (obj) => {
    return await Otp.create(obj)
}

module.exports.validateOTPWithMobile = async ({ mobile, otp }) => {
    return await Otp.findOne({
        mobile: mobile.trim(),
        otp: otp.trim(),
    });
}

module.exports.validateOTPWithEmail = async ({ email, otp }) => {
    return await Otp.findOne({
        email: email.trim(),
        otp: otp.trim(),
    });
}

module.exports.verifyOTP = async (id) => {
    return await Otp.findByIdAndUpdate(id, {
        $set: { isVerified: true }
    }, { new: true })
}

module.exports.OTPVerificationStatus = async (id) => {
    const otpDoc = await Otp.findById(id)

    if (otpDoc?.isVerified === true) {
        return true;
    }

    return false
}

module.exports.verifyGoogleIdToken = async (idToken) => {
    return await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
}