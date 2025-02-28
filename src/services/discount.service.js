const { Category } = require("../models/category.model")
const { Discount } = require("../models/discount.model")

exports.createDiscount = async (obj) => {
    return await Discount.create(obj)
}

exports.getDiscounts = async (filters) => {
    return await Discount.find(filters)
}

exports.getDiscountsById = async (id) => {
    return await Discount.findById(id)
}

exports.updateDiscount = async (id, obj) => {
    return await Discount.findByIdAndUpdate(id, obj, { new: true, runValidators: true });
}

exports.addUserIdToCoupon = async (code, userId) => {
    return await Discount.updateOne({ code }, { $push: { usedBy: userId } });
}

exports.deleteDiscount = async (id) => {
    return await Discount.findByIdAndDelete(id)
}

exports.applyAutomaticDiscounts = async (order) => {
    const { amount, products, categories } = order;

    const discounts = await Discount.find({ appliesAutomatically: true, isActive: true });

    let bestDiscount = { discountAmount: 0, message: "" };

    discounts.forEach((discount) => {
        if (new Date() < discount.startDate || new Date() > discount.endDate) return;

        const appliesToOrder =
            discount.applicableProducts.some((id) => products.includes(id.toString())) ||
            discount.applicableCategories.some((id) => categories.includes(id.toString()));

        if (!appliesToOrder || amount < discount.minOrderAmount) return;

        let discountAmount =
            discount.discountType === "percentage"
                ? (amount * discount.discountValue) / 100
                : discount.discountValue;

        if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
            discountAmount = discount.maxDiscountAmount;
        }

        if (discountAmount > bestDiscount.discountAmount) {
            bestDiscount = {
                discountAmount,
                message: `Automatic discount applied: -$${discountAmount}`,
            };
        }
    });

    return bestDiscount;
};


exports.calculateDiscount = async (userId, couponCode = "", amount = 0, items = []) => {

    let discountAmount = 0, discountMessage = "";

    if (couponCode) {
        const discountResponse = await Discount.findOne({ code: couponCode, isActive: true });
        if (!discountResponse || new Date() < discountResponse.startDate || new Date() > discountResponse.endDate) {
            return res.status(400).json({ success: false, message: "Invalid or expired coupon", error: "INVALID_COUPON" });
        }

        if (discountResponse.usedBy.some(id => id.toString() === userId)) {
            return res.status(400).json({ success: false, message: "Coupon already used", error: "COUPON_ALREADY_USED" });
        }

        discountAmount = discountResponse.discountType === "percentage"
            ? (amount * discountResponse.discountValue) / 100
            : discountResponse.discountValue;

        if (discountResponse.maxDiscountAmount && discountAmount > discountResponse.maxDiscountAmount) {
            discountAmount = discountResponse.maxDiscountAmount;
        }

        discountMessage = `Discount applied: ${couponCode}`;
    } else {
        const productIds = items.map(it => String(it.productId));
        const categories = await Category.find({ productIds: { $in: productIds } }, { _id: 1 });
        const categoryIds = categories.map(cat => String(cat._id));

        const autoDiscount = await this.applyAutomaticDiscounts({ amount, products: productIds, categories: categoryIds }) || { discountAmount: 0, message: "" };

        discountAmount = autoDiscount.discountAmount;
        discountMessage = autoDiscount.message;
    }

    discountAmount = Math.min(discountAmount, amount);

    return discountAmount;
}