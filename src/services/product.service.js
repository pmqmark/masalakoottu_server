const { Product } = require("../models/product.model");
const { Variation } = require("../models/variation.model");
const { Option } = require("../models/option.model");
const csv = require('csv-parser');
const { Readable } = require('stream');

module.exports.createProduct = async (obj = {}) => {
    return await Product.create(obj);
}

module.exports.getProductById = async (id) => {
    return await Product.findById(id)
        .populate("variations.variationId", "name")
        .populate("variations.options.optionId", "value")
        .lean()
}

module.exports.getManyProducts = async (filters = {}, project = {}) => {
    return await Product.find(filters, project)
        .populate("variations.variationId", "name")
        .populate("variations.options.optionId", "value")
        .sort({ createdAt: -1 })
        .lean()
}

module.exports.updateProduct = async (id, obj = {}) => {
    return await Product.findByIdAndUpdate(id, {
        $set: obj
    }, { new: true })
}

module.exports.updateProductStatus = async (id, isArchived) => {
    return await Product.findByIdAndUpdate(id, {
        $set: { isArchived }
    }, { new: true })
}

module.exports.decrementProductQty = async (cart) => {
    const productUpdates = cart.map(async (item) => {
        const productId = item?.productId;
        const quantityToSell = item?.quantity;

        const product = await Product.findById(productId);
        if (!product) {
            console.log(`Product ${productId} not found`);
            return;
        }

        let remainingQuantity = quantityToSell;

        if (product.batches.length > 0) {
            // Batch-based stock reduction (FEFO)
            product.batches = product.batches
                .filter(batch => batch.quantity > 0 && batch.expDate > new Date())
                .sort((a, b) => a.expDate - b.expDate);

            for (let batch of product.batches) {
                if (remainingQuantity === 0) break;

                if (batch.quantity >= remainingQuantity) {
                    batch.quantity -= remainingQuantity;
                    remainingQuantity = 0;
                } else {
                    remainingQuantity -= batch.quantity;
                    batch.quantity = 0;
                }
            }
        }

        if (remainingQuantity > 0) {
            console.log(`Not enough stock available for product ${productId}`);
            return;
        }

        await product.save();
        console.log(`Sold ${quantityToSell} units of product ${productId} successfully!`);
    });

    await Promise.all(productUpdates);
};



module.exports.createVariation = async (obj) => {
    return await Variation.create(obj)
}

module.exports.getOneVariation = async (id) => {
    return await Variation.findById(id)
        .populate('options', 'value')
}

module.exports.getManyVariation = async (filters) => {
    return await Variation.find(filters)
        .populate('options', 'value')
}

module.exports.updateVariation = async (id, obj) => {
    return await Variation.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

module.exports.deleteVariation = async (id) => {
    return await Variation.findByIdAndDelete(id)
}


module.exports.createOption = async (obj) => {
    return await Option.create(obj)
}

module.exports.getOneOption = async (id) => {
    return await Option.findById(id)
}

module.exports.getManyOption = async (filters) => {
    return await Option.find(filters)
}

module.exports.updateOption = async (id, obj) => {
    return await Option.findByIdAndUpdate(id, { $set: obj }, { new: true })
}

module.exports.deleteOption = async (id) => {
    return await Option.findByIdAndDelete(id)
}


module.exports.checkIfVariationExists = async (productId, variations = []) => {
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


module.exports.getBuyNowItem = async (productId, quantity = 1, variations = []) => {
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

    const productStock = await this.getProductStock(productId)

    let stockStatus = 'AVAILABLE'

    if (productStock <= 0) {
        stockStatus = 'OUT_OF_STOCK'
    }
    else if (productStock < item.quantity) {
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
        stock: productStock,
        stockStatus,
        weight: product.weight,
    };
};


module.exports.stockChecker = async (items) => {
    for (const item of items) {
        const product = await Product.findById(item.productId);
        const productStock = await this.getProductStock(item.productId)

        if (!product) {
            return { success: false, reason: 'Product not found', productId: item.productId };
        }
        if (productStock < item.quantity) {
            return { success: false, reason: 'Insufficient stock', productId: item.productId, availableStock: productStock };
        }
    }

    return { success: true };
};


module.exports.addExtrasNTaxToPrice = (item) => {
    const extraCharges = item.variations?.reduce((acc, elem) => acc + (elem?.additionalPrice || 0), 0) || 0;
    const basePrice = item.price + extraCharges;
    const taxRate = item.tax || 0;
    const finalPrice = basePrice * (1 + taxRate / 100);
    return {
        ...item,
        finalPrice: Number(finalPrice.toFixed(2)),
    };
}


module.exports.bulkInsertProducts = async (file) => {
    const results = [];

    const stream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
        stream
            .pipe(csv())
            .on('data', (row) => {
                results.push({
                    name: row.name,
                    price: parseFloat(row.rate),
                    hsn: row.hsn,
                    tax: row.tax,
                    brand: row.brand,
                    batches: [{ quantity: parseInt(row.stock) }],
                    weight: parseFloat(row.weight) * 1000
                });
            })
            .on('end', async () => {
                try {
                    console.log({results})
                    
                    for (const product of results) {
                        await Product.updateOne(
                            { name: product.name }, 
                            {
                                $set: {
                                    price: product.price,
                                    hsn: product.hsn,
                                    tax: product.tax,
                                    brand: product.brand,
                                    weight: product.weight,
                                },
                                $push: {
                                    batches: { $each: product.batches }
                                }
                            },
                            { upsert: true } 
                        );
                    }

                    console.log({ message: `${results.length} products processed (updated or inserted).` });
                    resolve({ message: `${results.length} products processed.` });
                } catch (err) {
                    console.error('Bulk upsert error:', err);
                    reject(new Error('Bulk update failed.'));
                }
            })
            .on('error', (err) => {
                console.error('CSV parsing error:', err);
                reject(new Error('CSV parsing failed.'));
            });
    });
}


module.exports.getProductStock = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) return 0;

    const totalStock = product.batches.reduce((sum, batch) => sum + batch.quantity, 0);
    return totalStock;
};