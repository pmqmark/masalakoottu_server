const { isValidObjectId } = require("mongoose");
const { createReview, updateReview, getReviewById, getManyReviews, deleteReview } = require("../services/reviews.service.js");

module.exports.createReviewCtrl = async (req, res) => {
    try {
        const createObj = req.body;

        const Review = await createReview(createObj);

        if (!Review) {
            throw new Error('Failed')
        }

        return res.status(201).json({
            success: true,
            message: 'success',
            data: { result: Review },
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

module.exports.getReviewByIdCtrl = async (req, res) => {
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

        const Review = await getReviewById(id)

        if (!Review) {
            throw new Error('FAILED')
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { result: Review },
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

module.exports.getManyReviewsCtrl = async (req, res) => {
    try {
        let { page, entries } = req.query;
        page = parseInt(page);
        entries = parseInt(entries)
        const { search, productId } = req.query;

        const filters = { isArchived: false };

        if (isValidObjectId(productId)) {
            filters.productId = productId;
        }

        if (search) {
            filters.$or = [
                { rating: new RegExp(search, 'i') },
                { comment: new RegExp(search, 'i') },
            ]
        }


        let result = await getManyReviews(filters)
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

module.exports.getAllReviewsCtrl = async (req, res) => {
    try {
        let { page, entries } = req.query;
        page = parseInt(page);
        entries = parseInt(entries)
        const { search, productId } = req.query;

        const filters = {};

        if (isValidObjectId(productId)) {
            filters.productId = productId;
        }

        if (search) {
            filters.$or = [
                { rating: new RegExp(search, 'i') },
                { comment: new RegExp(search, 'i') },
            ]
        }


        let result = await getManyReviews(filters)
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


module.exports.updateReviewCtrl = async (req, res) => {
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

        const Review = await getReviewById(id)

        if (!Review) {
            return res.status(400).json({
                success: false,
                message: 'Not Found',
                data: null,
                error: 'NOT_FOUND'
            })
        }

        const isOwner = req.user.userId === String(Review?.userId?._id);
        const isAdmin = req.user.role === 'admin';

        if (!(isAdmin || isOwner)) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                data: null,
                error: 'UNAUTHORIZED'
            })
        }

        const {rating, comment} = req.body;

        const updatedReview = await updateReview(id, {rating, comment})

        if (!updatedReview) {
            throw new Error('FAILED')
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { result: updatedReview },
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

module.exports.deleteReviewCtrl = async (req, res) => {
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

        const Review = await getReviewById(id)

        if (!Review) {
            return res.status(400).json({
                success: false,
                message: 'Not Found',
                data: null,
                error: 'NOT_FOUND'
            })
        }

        const isOwner = req.user.userId === String(Review?.userId?._id);
        const isAdmin = req.user.role === 'admin';

        if (!(isAdmin || isOwner)) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                data: null,
                error: 'UNAUTHORIZED'
            })
        }
       
        const deletedReview = await deleteReview(id)

        if (!deletedReview) {
            throw new Error('FAILED')
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