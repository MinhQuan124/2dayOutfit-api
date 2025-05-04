const mongoose = require("mongoose");
const Scheme = mongoose.Schema;
const slug = require("mongoose-slug-updater");
const mongooseDelete = require("mongoose-delete");

const Product = new Scheme(
  {
    name: { type: String, maxLength: 255, required: true },
    price: { type: Number, required: true },
    category: String,
    brand: String,
    description: String,
    variations: [
      {
        color: String,
        image: String,
        sizes: [
          {
            size: String,
            quantity: Number,
          },
        ],
      },
    ],
    slug: { type: String, slug: "name", unique: true, slugPaddingSize: 4 },
  },
  { timestamps: true }
);

//Adding plugins
mongoose.plugin(slug);
Product.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

module.exports = mongoose.model("Product", Product);
