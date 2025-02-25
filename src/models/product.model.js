const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    brand: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0, // Percentage discount
    },

    thumbnail: {
      location: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      key: {
        type: String,
      },
    },

    images: [
      {
        location: {
          type: String,
          required: true,
        },
        name: {
          type: String,
        },
        key: {
          type: String,
        },
      },
    ],

    stock: {
      type: Number,
      default: 0,
    },

    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    variations: [
      {
        name: {
          type: String, // e.g., 'Color', 'Size'
        },
        options: [
          {
            value: {
              type: String, // e.g., 'Red', 'Medium'
            },
            additionalPrice: {
              type: Number,
              default: 0,
            },
          },
        ],
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    tags: [
      {
        type: String,
      },
    ],

    isArchived: {
      type: Boolean,
      default: false
    },

  },
  {
    timestamps: true,
  }
);

exports.Product = mongoose.model('Product', productSchema);
