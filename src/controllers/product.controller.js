const { isValidObjectId } = require("mongoose");
const { createProduct, updateProduct, updateProductStatus, getProductById, getManyProducts } = require("../services/product.service");

exports.createProductCtrl = async (req, res) => {
    try {
        const { name, description, brand, price, discount, images,
            stock, reviews, variations, isFeatured, tags, isArchived
        } = req.body;

        const createObj = {
            name, description, brand, price, discount, images,
            stock, reviews, variations, isFeatured, tags, isArchived
        }

        const product = await createProduct(createObj)

        if (!product) {
            throw new Error('FAILED')
        }

        return res.status(201).json({
            success: true,
            message: 'success',
            data: { product },
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

exports.updateProductCtrl = async (req, res, next) => {
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

        const updateObj = req.body;

        const product = await updateProduct(id, updateObj)

        if (!product) {
            throw new Error('FAILED')
        }

        return res.status(201).json({
            success: true,
            message: 'success',
            data: { product },
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

exports.updateProductStatusCtrl = async (req, res, next) => {
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

        const { status } = req.body;
        if (!['archived', 'unarchived']?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Id',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        let isArchived;
        if (status === 'archived') {
            isArchived = true;
        }
        else {
            isArchived = false;
        }

        const product = await updateProductStatus(id, isArchived)

        if (!product) {
            throw new Error('FAILED')
        }

        return res.status(201).json({
            success: true,
            message: 'success',
            data: { product },
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


exports.getProductByIdCtrl = async (req, res) => {
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

        const product = await getProductById(id)

        if (!product) {
            throw new Error('FAILED')
        }

        return res.status(201).json({
            success: true,
            message: 'success',
            data: { product },
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



exports.getManyProductsCtrl = async (req, res, next) => {
    try {
        let { page, entries } = req.query;
        page = parseInt(page);
        entries = parseInt(entries)
        const { tag, search } = req.query;

        const filters = { isArchived: false };

        if (search?.trim()) {
            filters.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { brand: new RegExp(search, 'i') },
            ]
        }

        if (tag?.trim()) {
            filters.tags = { $in: [tag] }
        }

        let result = await getManyProducts(filters)
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


exports.getAllProductsCtrl = async (req, res, next) => {
    try {
        let { page, entries } = req.query;
        page = parseInt(page);
        entries = parseInt(entries)
        const { tag, search } = req.query;

        const filters = {};

        if (search?.trim()) {
            filters.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { brand: new RegExp(search, 'i') },
            ]
        }

        if (tag?.trim()) {
            filters.tags = { $in: [tag] }
        }

        let result = await getManyProducts(filters)
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