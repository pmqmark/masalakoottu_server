const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    payMode: {
      type: String,
      enum: ['COD', 'Credit Card', 'UPI', 'Net Banking'],
      required: true
    },

    transactionId: { type: String },

    payStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending'
    },

    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    amount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now, index: true },
    expectedDelivery: { type: Date, default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 }, // 7 Days 

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },

        name: { type: String },
        price: { type: Number, required: true },
        thumbnail: {
          type: {
            location: {
              type: String,
            },
            name: {
              type: String,
            },
            key: {
              type: String,
            },
          }
        },

        variations: [
          {
            name: { type: String },
            option: {
              value: { type: String },
              additionalPrice: { type: Number, default: 0 }
            }
          }
        ]
      },
    ],

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    billAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    shipAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },

    discount: { type: Number, default: 0 },
    deliveryType: { type: String, enum: ['Standard', 'Express'], default: 'Standard' },
    deliveryCharge: { type: Number, default: 0 },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = { Order }