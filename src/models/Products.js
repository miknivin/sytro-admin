import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter bag name"],
      maxLength: [200, "Bag name cannot exceed 200 characters"],
    },
    actualPrice: {
      type: Number,
      required: [true, "Please enter bag actual price"],
    },
    offer: {
      type: Number,
      required: false,
    },
    offerEndTime: {
      type: Date,
      required: false,
    },
    details: {
      description: {
        type: String,
        required: [true, "Please enter bag description"],
        maxLength: [5000, "Description cannot exceed 5000 characters"],
      },
      features: [{ type: String }], // Removed enum restriction
      materialUsed: [{ type: String }],
      aPlusContent: {
        type: [
          {
            title: { type: String, required: true },
            content: { type: String, required: false },
            images: [
              {
                public_id: { type: String, required: false },
                url: { type: String, required: true },
              },
            ],
            videoUrl: { type: String, required: false },
          },
        ],
        required: false,
      },
    },
    ratings: {
      type: Number,
      default: 4,
    },
    images: [
      {
        public_id: {
          type: String,
          required: false,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "Please enter bag category"],
      enum: {
        values: [
          "Kids Bags",
          "gym_duffle_bag",
          "travel_duffle_bag",
          "mens_sling_bag",
          "custom_sling_bag",
          "womens_sling_bag",
          "mens_backpack",
          "laptop_backpack",
          "ladies_backpack",
          "womens_backpack",
          "laptop_messenger_bag",
          "trekking_bag",
          "tote_bag",
          "women_shoulder_bag",
        ],
        message: "Please select correct category",
      },
      default: "Kids Bags",
    },
    specifications: {
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: {
          type: String,
          enum: ["cm", "inches"],
        },
      },
      color: {
        type: String,
      },
      weight: {
        type: Number,
      },
    },
    capacity: {
      type: Number,
      required: [true, "Please enter bag capacity in litres"],
    },
    size: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      required: true,
    },
    stock: {
      type: Number,
      required: [true, "Please enter bag stock"],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        ratings: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
