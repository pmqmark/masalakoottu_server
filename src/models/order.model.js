const { default: mongoose } = require("mongoose")

const OrderSchema = new mongoose.Schema({

  totalAmount: {
    type: Number,
    required: true,
  },

  orderDate: {
    type: Date,
    default: Date.now,
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],

  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  
  transactionId: { type: String },
  payMode: { type: String },

  expectedDelivery: {
    type: Date,
  },

  discount: { type: Number },
  deliveryType: { type: String },
  deliveryCharge: { type: Number },

  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  },

  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
}, { timestamps: true })

exports.Order = mongoose.model('Order', OrderSchema)
