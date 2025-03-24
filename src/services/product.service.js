const { Product } = require("../models/product.model");
const { Variation } = require("../models/variation.model");
const { Option } = require("../models/option.model");

exports.createProduct = async (obj = {}) => {
    return await Product.create(obj);
}

exports.getProductById = async (id) => {
    return await Product.findById(id)
        .populate("reviews.userId", "firstName lastName")
        .populate("variations.variationId", "name")
        .populate("variations.options.optionId", "value")
        .lean()
}

exports.getManyProducts = async (filters = {}, project = {}) => {
    return await Product.find(filters, project)
        .populate("reviews.userId", "firstName lastName")
        .populate("variations.variationId", "name")
        .populate("variations.options.optionId", "value")
        .lean()
}

exports.updateProduct = async (id, obj = {}) => {
    return await Product.findByIdAndUpdate(id, {
        $set: obj
    }, { new: true })
}

exports.updateProductStatus = async (id, isArchived) => {
    return await Product.findByIdAndUpdate(id, {
        $set: { isArchived }
    }, { new: true })
}

exports.decrementProductQty = async (cart) => {
    const productUpdates = cart?.map(async (item) => {
        const productId = item?.productId;
        const quantity = item?.quantity;

        return await Product.findOneAndUpdate(
            { _id: productId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } }
        );

    })

    await Promise.all(productUpdates);
}


exports.createVariation = async (obj) => {
    return await Variation.create(obj)
}

exports.getOneVariation = async (id) => {
    return await Variation.findById(id)
        .populate('options', 'value')
}

exports.getManyVariation = async (filters) => {
    return await Variation.find(filters)
        .populate('options', 'value')
}

exports.updateVariation = async (id, obj) => {
    return await Variation.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

exports.deleteVariation = async (id) => {
    return await Variation.findByIdAndDelete(id)
}


exports.createOption = async (obj) => {
    return await Option.create(obj)
}

exports.getOneOption = async (id) => {
    return await Option.findById(id)
}

exports.getManyOption = async (filters) => {
    return await Option.find(filters)
}

exports.updateOption = async (id, obj) => {
    return await Option.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

exports.deleteOption = async (id) => {
    return await Option.findByIdAndDelete(id)
}


exports.checkIfVariationExists = async (productId, variations = []) => {
    const product = await Product.findById(productId);
    console.log({ product })
    if (!product) {
        return null;
    }
    const prodVars = product?.variations;
    console.log({ prodVars })

    const varExists = variations?.every(vr => {
        const pV = prodVars.find(pv => pv?.variationId?.toString() === vr?.variationId?.toString())

        const optExists = pV.options?.find(opt => opt?.optionId?.toString() === vr?.optionId?.toString())

        if (optExists) {
            return true
        }
        else {
            return false
        }
    })

    return varExists;
}


exports.getBuyNowItem = async (productId, quantity = 1, variations = []) => {
    const existingVariation = await this.checkIfVariationExists(productId, variations);
    if (!existingVariation) {
        return null;
    }

    const [product, variationDocs, optionDocs] = await Promise.all([
        Product.findById(productId),
        Variation.find({ _id: { $in: variations.map(v => v.variationId) } }),
        Option.find({ _id: { $in: variations.map(v => v.optionId) } })
    ]);

    if (!product) return null;

    const variationMap = new Map(variationDocs.map(v => [v._id.toString(), v.name]));
    const optionMap = new Map(optionDocs.map(o => [o._id.toString(), o.value]));
    const productVarMap = new Map(
        product.variations?.map(v => [v.variationId.toString(), v.options]) || []
    );

    let stockStatus = 'AVAILABLE'       

        if(product.stock <= 0){
            stockStatus = 'OUT_OF_STOCK'
        }
        else if(product.stock < item.quantity){
            stockStatus = 'INSUFFICIENT'
        }

    return {
        productId,
        quantity,
        name: product.name || "Unknown Product",
        price: product.price || 0,
        thumbnail: product.thumbnail || null,
        variations: variations.map(({ variationId, optionId }) => {
            const prodOpt = productVarMap.get(variationId)?.find(opt => opt.optionId.toString() === optionId);
            return {
                name: variationMap.get(variationId) || "Unknown Variation",
                value: optionMap.get(optionId) || "Unknown Option",
                additionalPrice: prodOpt?.additionalPrice || 0
            };
        }),
        stock: product.stock,
        stockStatus,
    };
};


exports.stockChecker = async (items) => {
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            return { success: false, reason: 'Product not found', productId: item.productId };
        }
        if (product.stock < item.quantity) {
            return { success: false, reason: 'Insufficient stock', productId: item.productId, availableStock: product.stock };
        }
    }

    return { success: true };
};


exports.addExtrasNTaxToPrice = (item) => {
    const extraCharges = item.variations?.reduce((acc, elem) => acc + (elem?.additionalPrice || 0), 0) || 0;
    const basePrice = item.price + extraCharges;
    const taxRate = item.tax || 0;
    const finalPrice = basePrice * (1 + taxRate / 100);
    return {
        ...item,
        finalPrice: Number(finalPrice.toFixed(2)),
    };
}