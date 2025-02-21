const nodemailer = require('nodemailer');
const { default: axios } = require("axios");
const { Otp } = require('../models/otp.model');
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.sendOTPViaEmail = async (email, OTP) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"Masalakoottu" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "OTP for Authentication",
            html: `
                <span>OTP: ${OTP}</span>
                <p>Use this OTP within 5 minutes</p>
            `,
        });
    } catch (error) {
        console.error('Error sending OTP via email:', error);
        throw error;
    }
};

exports.sendOTPViaSMS = async (mobile, OTP) => {
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

        await axios(options);
    } catch (error) {
        console.error('Error sending OTP via SMS:', error);
        throw error;
    }
};

exports.getOTPWithMobile = async(mobile)=>{
    return await Otp.findOne({ mobile }).lean()
}

exports.getOTPWithEmail = async(email)=>{
    return await Otp.findOne({ email }).lean()
}

exports.deleteOTP = async(id)=>{
    return await Otp.findByIdAndDelete(id);
}

exports.createOTP = async(obj)=>{
    return await Otp.create(obj)
}

exports.validateOTPWithMobile = async({mobile, otp})=>{
    return await Otp.findOne({
        mobile: mobile.trim(),
        otp: otp.trim(),
    });
}

exports.validateOTPWithEmail = async({email, otp})=>{
    return await Otp.findOne({
        email: email.trim(),
        otp: otp.trim(),
    });
}

exports.verifyGoogleIdToken = async(idToken)=>{
    return await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
}