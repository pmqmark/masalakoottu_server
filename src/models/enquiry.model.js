const { default: mongoose } = require("mongoose");
const { enquiryTypeList } = require("../config/data");

const enquirySchema = new mongoose.Schema({
    type: { type: String, enum: enquiryTypeList, default: 'Contact' },
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true },
    mobile: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, trim: true },

}, { timestamps: true })

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = { Enquiry }