const { isValidObjectId } = require("mongoose");

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc.js');
const timezone = require('dayjs/plugin/timezone.js');
const { createEnquiry, sendEmailViaNodemailer, findEnquiryById, getManyEnquiries, deleteEnquiry } = require("../services/enquiry.service");
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

module.exports.postEnquiryCtrl = async (req, res) => {
    console.log(req.body);
    const { type, name, email, mobile, subject, message } = req.body;
    try {

        const createObj = { type, name, email, mobile, subject, message }

        try {
            await createEnquiry(createObj);
        } catch (error) {
            console.log(error)
        }

        const from = `"Masalakoottu Website" <${process.env.MAIL_USER}>`;
        const mailSubject = `${type} Message`;
        const html = `
                <h2>Contact Message</h2>
                <span> Name: ${name || 'NIL'}</span>
                <hr>
                <span> Email: ${email || 'NIL'}</span>
                <hr>
                <span> Mobile: ${mobile || 'NIL'}</span>
                <hr>
                <span> Subject: ${subject || 'NIL'}</span>
                <hr>
                <span> Message: ${message || 'NIL'}</span>
                `

        const info = await sendEmailViaNodemailer(from, mailSubject, html)
        console.log("Message sent: %s", info);

        return res.status(200).json({
            success: true,
            message: "success",
            data: null,
            error: null
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        })
    }
}


module.exports.getEnquiryByIdCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Id",
                data: null,
                error: "INVALID_ID"
            })
        }

        const enquiry = await findEnquiryById(id);

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Not Found',
                data: null,
                error: "NOT_FOUND",
            })
        }

        return res.status(200).json({
            success: true,
            message: "success",
            data: { result: enquiry },
            error: null
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        })
    }
}

module.exports.getManyEnquiryCtrl = async (req, res) => {
    try {
        //search query;
        const searchQuery = req.query.search;

        // Paginators
        const page = parseInt(req.query.page, 10);
        const entries = parseInt(req.query.entries, 10);
        const { startDate, endDate } = req.query;

        const filters = {}

        if (searchQuery) {
            const regexPattern = new RegExp(searchQuery, "i")

            filters.$or = [
                { name: { $regex: regexPattern } },
                { email: { $regex: regexPattern } },
                { mobile: { $regex: regexPattern } },
                { subject: { $regex: regexPattern } },
                { message: { $regex: regexPattern } },
            ]
        }

        if (startDate && endDate) {
            const parsedStartDate = dayjs(startDate, 'DD-MM-YYYY');
            const parsedEndDate = dayjs(endDate, 'DD-MM-YYYY');

            const startOfDay = parsedStartDate.startOf('day').toISOString();
            const endOfDay = parsedEndDate.endOf('day').toISOString();

            filters.createdAt = {
                $gte: startOfDay,
                $lt: endOfDay
            }
        }

        const enquirys = await getManyEnquiries(filters)
        const total = enquirys?.length

        let result = enquirys;

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        return res.status(200).json({
            success: true,
            message: "success",
            data: { result, pagination: { total } },
            error: null
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null,
            error: "INTERNAL_SERVER_ERROR",
        })
    }
}


module.exports.deleteEnquiryCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Id",
                data: null,
                error: "INVALID_ID"
            })
        }

        const enquiry = await deleteEnquiry(id);

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Not Found',
                data: null,
                error: "NOT_FOUND",
            })
        }

        return res.status(200).json({
            success: true,
            message: "success",
            data: null,
            error: null
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        })
    }
}
