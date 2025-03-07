const { isValidObjectId } = require("mongoose");
const { createProduct, updateProduct, updateProductStatus, getProductById, getManyProducts, createVariation, updateVariation, getOneVariation, deleteVariation, getManyVariation, createOption, getOneOption, getManyOption, updateOption, deleteOption } = require("../services/product.service");
const { deleteMultipleFilesFromDO, deleteFileFromDO } = require("../utils/storage.util");

exports.createProductCtrl = async (req, res) => {
    try {
        const { name, description, brand, price, images,
            stock, reviews, variations, isFeatured, tags, isArchived
        } = req.body;

        const createObj = {
            name, description, brand, price, images,
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

exports.updateProductCtrl = async (req, res) => {
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
            return res.status(400).json({
                success: false,
                message: 'Not Found',
                data: null,
                error: 'NOT_FOUND'
            })
        }

        const updateObj = req.body;

        if (product?.thumbnail?.key && updateObj?.thumbnail?.key && (updateObj?.thumbnail?.key !== product?.thumbnail?.key)) {
            try {
                await deleteFileFromDO(product?.thumbnail?.key)
            } catch (error) {
                console.log(error)
            }
        }

        const oldImgKeys = Array.isArray(product?.images) ? product?.images?.map(img => img?.key) : [];
        const newImgKeys = Array.isArray(updateObj?.images) ? updateObj?.images?.map(img => img?.key) : [];

        if (oldImgKeys?.length > 0) {
            const deletableKeys = oldImgKeys?.filter(oik => !newImgKeys?.includes(oik))
            if (deletableKeys?.length > 0) {
                try {
                    await deleteMultipleFilesFromDO(deletableKeys)
                } catch (error) {
                    console.log(error)
                }
            }
        }

        const updatedProduct = await updateProduct(id, updateObj)

        if (!updatedProduct) {
            throw new Error('FAILED')
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { product: updatedProduct },
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

        return res.status(200).json({
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

        return res.status(200).json({
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

exports.createVariationCtrl = async (req, res) => {
    try {
        const { name, options = [] } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Data',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const variation = await createVariation({ name, options })

        if (!variation) {
            return res.status(400).json({
                success: false,
                message: 'failed',
                data: null,
                error: 'FAILED'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { variation },
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

exports.getOneVariationCtrl = async (req, res) => {
    try {
        const { variationId } = req.params;

        const variation = await getOneVariation(variationId)

        if (!variation) {
            return res.status(400).json({
                success: false,
                message: 'failed',
                data: null,
                error: 'FAILED'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { variation },
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

exports.getManyVariationCtrl = async (req, res) => {
    try {
        const filters = {}

        const variations = await getManyVariation(filters)

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { variations },
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

exports.updateVariationCtrl = async (req, res) => {
    try {
        const { variationId } = req.params;
        const { name, options } = req.body;

        const variation = await updateVariation(variationId, { name, options })

        if (!variation) {
            return res.status(400).json({
                success: false,
                message: 'failed',
                data: null,
                error: 'FAILED'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { variation },
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

exports.deleteVariationCtrl = async (req, res) => {
    try {
        const { variationId } = req.params;

        const variation = await deleteVariation(variationId)

        if (!variation) {
            return res.status(400).json({
                success: false,
                message: 'failed',
                data: null,
                error: 'FAILED'
            })
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


exports.createOptionCtrl = async (req, res) => {
    try {
        const { value } = req.body;
        if (!value?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Data',
                data: null,
                error: 'BAD_REQUEST'
            })
        }

        const option = await createOption({ value })

        if (!option) {
            return res.status(400).json({
                success: false,
                message: 'failed',
                data: null,
                error: 'FAILED'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { option },
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

exports.getOneOptionCtrl = async (req, res) => {
    try {
        const { optionId } = req.params;

        const option = await getOneOption(optionId)

        if (!option) {
            return res.status(400).json({
                success: false,
                message: 'failed',
                data: null,
                error: 'FAILED'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { option },
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

exports.getManyOptionCtrl = async (req, res) => {
    try {
        const filters = {}

        const options = await getManyOption(filters)

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { options },
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

exports.updateOptionCtrl = async (req, res) => {
    try {
        const { optionId } = req.params;
        const { value } = req.body;

        const option = await updateOption(optionId, { value })

        if (!option) {
            return res.status(400).json({
                success: false,
                message: 'failed',
                data: null,
                error: 'FAILED'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'success',
            data: { option },
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

exports.deleteOptionCtrl = async (req, res) => {
    try {
        const { optionId } = req.params;

        const option = await deleteOption(optionId)

        if (!option) {
            return res.status(400).json({
                success: false,
                message: 'failed',
                data: null,
                error: 'FAILED'
            })
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