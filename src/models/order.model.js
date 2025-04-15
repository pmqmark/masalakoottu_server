const mongoose = require("mongoose");
const { payModeList, payStatusList, orderStatusList, deliveryTypeList, buyModeList, refundStatusList } = require("../config/data");

const OrderSchema = new mongoose.Schema(
  {
    payMode: {
      type: String,
      enum: payModeList,
      required: true
    },

    transactionId: { type: String },

    refundTransactionId: { type: String },

    merchantOrderId: { type: String, required: true },
    pgOrderId: { type: String },

    merchantRefundId: { type: String },
    pgRefundId: { type: String },

    buyMode: {
      type: String,
      enum: buyModeList,
      required: true
    },

    couponCode: { type: String },

    payStatus: {
      type: String,
      enum: payStatusList,
      default: 'pending'
    },

    refundStatus: {
      type: String,
      enum: refundStatusList,
      default: 'none'
    },

    status: {
      type: String,
      enum: orderStatusList,
      default: 'processing',
    },

    totalTax: { type: Number },
    discount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    subTotal: { type: Number, required: true },
    amount: { type: Number, required: true },

    refundAmount: { type: Number },

    orderDate: { type: Date, default: Date.now, index: true },
    expectedDelivery: { type: Date, default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 }, // 7 Days 

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },

        name: { type: String },
        price: { type: Number, required: true },
        tax: { type: Number, default: 0, min: 0 },
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


    billAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    shipAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },

    deliveryType: { type: String, enum: deliveryTypeList, default: 'Standard' },

    waybill: { type: String }, // <= a.k.a Tracking id
    delivered_on: { type: Date },

    deliveryPartner: { type: String }

  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = { Order }