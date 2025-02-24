// const { getProductById } = require("../services/product.service");
// const { getCart } = require("../services/user.service");

// exports.checkout = async (req, res) => {
//     const { userId, address, payMode, discountPercent} = req.body;

//     try {
//         let cart = await getCart(userId);
//         if (!cart || cart.length === 0) {
//             return res.status(400).json({ message: "Cart is empty" });
//         }

//         let amount = cart.reduce(async (total, item) => {
//             const product = await getProductById(item.productId)
//             return (total + product.price * item.quantity)
//         }, 0);
        
//         let order = new Order({
//             userId,
//             address,
//             payMode,
//             amount,
//             discount,
//             items: cart.items.map((item) => ({
//                 productId: item.productId._id,
//                 quantity: item.quantity,
//             })),
//         });

//         await order.save();
//         await user.cart.findOneAndDelete({ userId });

//         res.status(201).json({ message: "Order placed successfully", order });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };