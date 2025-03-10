const mongoose = require("mongoose");
const { payModeList, payStatusList, orderStatusList, deliveryTypeList } = require("../config/data");

const OrderSchema = new mongoose.Schema(
  {
    payMode: {
      type: String,
      enum: payModeList,
      required: true
    },

    transactionId: { type: String },

    payStatus: {
      type: String,
      enum: payStatusList,
      default: 'pending'
    },

    status: {
      type: String,
      enum: orderStatusList,
      default: 'processing',
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
            value: { type: String },
            additionalPrice: { type: Number, default: 0 }
          }
        ]
      },
    ],

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    discount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },

    billAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    shipAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },

    deliveryType: { type: String, enum: deliveryTypeList, default: 'Standard' },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = { Order }