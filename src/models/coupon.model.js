const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
   userList: [{
      type: String
   }],

   code: {
      type: String,
      required: true,
      unique: true
   },
   value: {
      type: Number,
      required: true
   },
   expiryDate: {
      type: Date,
      required: true
   },
   maxValue: {
      type: Number,
   },
   minValue: {
      type: Number,
   },
   isAvailable: {
      type: Boolean,
      default: true
   }
}, { timestamps: true });

exports.Coupon = mongoose.model('Coupon', couponSchema);
