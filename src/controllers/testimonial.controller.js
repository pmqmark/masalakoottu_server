const { isValidObjectId } = require("mongoose");
const { createTestimonial, updateTestimonial, getTestimonialById, getManyTestimonials, deleteTestimonial } = require("../services/testimonial.service");
const { deleteFileFromDO } = require("../utils/storage.util");

module.exports.createTestimonialCtrl = async (req, res) => {
    try {
        const createObj = req.body;

        const testimonial = await createTestimonial(createObj);

        if (!testimonial) {
            throw new Error('Failed')
        }

        return res.status(201).json({
            success: true,
            message: 'success',
            data: { result: testimonial },
            error: null
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.getTestimonialByIdCtrl = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const testimonial = await getTestimonialById(id)

        if (!testimonial) {
            throw new Error('FAILED')
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { result: testimonial },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.getManyTestimonialsCtrl = async (req, res, next) => {
    try {
        let { page, entries } = req.query;
        page = parseInt(page);
        entries = parseInt(entries)
        const { search } = req.query;

        const filters = {};

        if (search?.trim()) {
            filters.$or = [
                { title: new RegExp(search, 'i') },
                { subtitle: new RegExp(search, 'i') },
            ]
        }


        let result = await getManyTestimonials(filters)
        console.log({ result })

        if (page && entries) {
            result = result.slice((page - 1) * entries, page * entries)
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { result },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}


module.exports.updateTestimonialCtrl = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const testimonial = await getTestimonialById(id)

        if (!testimonial) {
            return res.status(400).json({
                success: false,
                message: 'Not Found',
                data: null,
                error: 'NOT_FOUND'
            })
        }

        const updateObj = req.body;

        if(testimonial?.image?.key && (updateObj?.image?.key !== testimonial?.image?.key)){
            try {
                await deleteFileFromDO(testimonial?.image?.key)
            } catch (error) {
                console.log(error)
            }
        }

        const updatedTestimonial = await updateTestimonial(id, updateObj)

        if (!updatedTestimonial) {
            throw new Error('FAILED')
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { result: updatedTestimonial },
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}

module.exports.deleteTestimonialCtrl = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const testimonial = await deleteTestimonial(id)

        if (!testimonial) {
            throw new Error('FAILED')
        }

        if (testimonial?.image?.key) {
            try {
                await deleteFileFromDO(testimonial.image.key)
            } catch (error) {
                console.log(error)
            }
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: null,
            error: null
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error",
            data: null,
            error: 'INTERNAL_SERVER_ERROR'
        })
    }
}