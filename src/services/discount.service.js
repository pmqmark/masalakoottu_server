const { Category } = require("../models/category.model")
const { Discount } = require("../models/discount.model")

module.exports.createDiscount = async (obj) => {
    return await Discount.create(obj)
}

module.exports.getDiscounts = async (filters, projects) => {
    return await Discount.find(filters, projects)
    .populate("applicableProducts", "name price thumbnail")
    .populate("applicableCategories", "name image")
}

module.exports.getDiscountsById = async (id) => {
    return await Discount.findById(id, {usedBy: 0})
    .populate("applicableProducts", "name price thumbnail")
    .populate("applicableCategories", "name image")
}

module.exports.updateDiscount = async (id, obj) => {
    return await Discount.findByIdAndUpdate(id, obj, { new: true, runValidators: true });
}

module.exports.addUserIdToCoupon = async (code, userId) => {
    return await Discount.updateOne({ code }, { $push: { usedBy: userId } });
}

module.exports.deleteDiscount = async (id) => {
    return await Discount.findByIdAndDelete(id)
}

module.exports.applyAutomaticDiscounts = async (items = []) => {
    let totalDiscountAmount = 0;
    let discountMessages = [];

    const discounts = await Discount.find({ appliesAutomatically: true, isActive: true });

    const productIds = items.map(it => it.productId.toString());
    const categoryDocs = await Category.find({ productIds: { $in: productIds } }, { _id: 1, productIds: 1 });

    const productCategoryMap = {};
    categoryDocs.forEach(cat => {
        cat.productIds.forEach(pid => {
            productCategoryMap[pid.toString()] = cat._id.toString();
        });
    });

    for (const item of items) {
        let bestDiscountPerItem = 0;
        const productId = item.productId.toString();
        const categoryId = productCategoryMap[productId] || null;
        const quantity = item.quantity || 1; 

        for (const discount of discounts) {
            if (new Date() < discount.startDate || new Date() > discount.endDate) continue;

            const appliesToProduct = discount.applicableProducts.some(id => id.toString() === productId);
            const appliesToCategory = categoryId && discount.applicableCategories.some(id => id.toString() === categoryId);

            if ((!appliesToProduct && !appliesToCategory) || item.price < discount.minOrderAmount) continue;

            let discountAmount =
                discount.discountType === "percentage"
                    ? (item.price * discount.discountValue) / 100
                    : discount.discountValue;

            if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
                discountAmount = discount.maxDiscountAmount;
            }

            bestDiscountPerItem = Math.max(bestDiscountPerItem, discountAmount);
        }

        if (bestDiscountPerItem > 0) {
            const totalItemDiscount = bestDiscountPerItem * quantity; 
            totalDiscountAmount += totalItemDiscount;
            discountMessages.push(`Discount : ${quantity}x ${item?._id}: -$${totalItemDiscount}`);
        }
    }

    return {
        autoDiscountAmt: totalDiscountAmount,
        autoDiscountMsg: discountMessages.length > 0 ? discountMessages.join(", ") : "No automatic discounts applied",
    };
};

module.exports.applyCouponDiscount = async (userId, couponCode = "", amount = 0) => {
    let discountAmount = 0, discountMessage = "";

    const discountResponse = await Discount.findOne({ code: couponCode, isActive: true });
    if (!discountResponse || new Date() < discountResponse.startDate || new Date() > discountResponse.endDate) {
        const err = new Error("Invalid or expired coupon")
        err.statusCode = 400;
        throw err
    }

    if (discountResponse.usedBy.some(id => id.toString() === userId)) {
        const err = new Error("Coupon already used")
        err.statusCode = 400;
        throw err
    }

    discountAmount = discountResponse.discountType === "percentage"
        ? (amount * discountResponse.discountValue) / 100
        : discountResponse.discountValue;

    if (discountResponse.maxDiscountAmount && discountAmount > discountResponse.maxDiscountAmount) {
        discountAmount = discountResponse.maxDiscountAmount;
    }

    discountMessage = `Discount : ${couponCode}`;

    discountAmount = Math.min(discountAmount, amount);

    return {
        couponDiscountAmt: discountAmount,
        couponDiscountMsg: discountMessage
    }
}


module.exports.applyAutoDiscountToAProduct = async (productId) => {
    let discountMessages = [];

    const discounts = await Discount.find({ appliesAutomatically: true, isActive: true });
    const categoryDoc = await Category.findOne({ productIds: { $in: [productId] } }, { _id: 1 });
    const categoryId = categoryDoc?._id?.toString();

    let bestDiscount = 0;

    for (const discount of discounts) {
        if (new Date() < discount.startDate || new Date() > discount.endDate) continue;

        const appliesToProduct = discount.applicableProducts.some(id => id.toString() === productId);
        const appliesToCategory = categoryId && discount.applicableCategories.some(id => id.toString() === categoryId);

        if ((!appliesToProduct && !appliesToCategory) || item.price < discount.minOrderAmount) continue;

        let discountAmount =
            discount.discountType === "percentage"
                ? (item.price * discount.discountValue) / 100
                : discount.discountValue;

        if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
            discountAmount = discount.maxDiscountAmount;
        }

        bestDiscount = Math.max(bestDiscount, discountAmount);
    }

    return {
        autoDiscountAmt: bestDiscount,
        autoDiscountMsg: discountMessages.length > 0 ? discountMessages.join(", ") : "No automatic discounts applied",
    };
};