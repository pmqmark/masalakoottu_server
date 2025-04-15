const { default: mongoose, Schema, model } = require('mongoose');

const productSchema = new Schema(
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

    hsn: {
      type: String,
      trim: true
    },

    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    thumbnail: {
      location: {
        type: String,
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

    weight: {
      type: Number,
    },

    reviews: [
      {
        userId: {
          type: Schema.Types.ObjectId,
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
        variationId: { type: Schema.Types.ObjectId, ref: 'Variation' }, // e.g., 'Color'
        options: [
          {
            optionId: { type: Schema.Types.ObjectId, ref: 'Option' },// e.g., 'Red', 'Green'
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

    batches: [
      {
        batchNumber: {
          type: String,
          required: true,
          default: function () {
            const today = new Date();
            const formattedDate = today.toISOString().slice(2, 10).replace(/-/g, "");
            const randomNum = Math.floor(100 + Math.random() * 900);
            return `DEFAULT-${formattedDate}-${randomNum}`;
          },
        },
        quantity: { type: Number, required: true, min: 0 },
        mfgDate: { type: Date },
        expDate: { type: Date },
      },
    ],

    videoLink: { type: String },

  },
  {
    timestamps: true,
  }
);

exports.Product = model('Product', productSchema);
