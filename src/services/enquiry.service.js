const { Enquiry } = require("../models/enquiry.model")
const nodemailer = require("nodemailer");


module.exports.createEnquiry = async (obj) => {
    return await Enquiry.create(obj)
}

module.exports.findEnquiryById = async (id) => {
    return await Enquiry.findById(id)
}

module.exports.getManyEnquiries = async (filters) => {
    return await Enquiry.find(filters).sort({ createdAt: -1 })
}

module.exports.deleteEnquiry = async (id) => {
    return await Enquiry.findByIdAndDelete(id)
}

module.exports.sendEmailViaNodemailer = async (from, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    return await transporter.sendMail({
        from,
        to: process.env.MAIL_RECEIVER,
        subject,
        html
    });

}