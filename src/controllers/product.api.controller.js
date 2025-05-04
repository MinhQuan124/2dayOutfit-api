const qs = require("qs");
const cloudinary = require("cloudinary").v2;

const Product = require("../models/Product.model");

const productController = {
  //[GET] API /api/v1/products
  getAllProductAPI: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 12;

      const skip = (page - 1) * limit;

      const products = await Product.find().skip(skip).limit(limit);
      const total = await Product.countDocuments();

      res.json({
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(500).json(err);
    }
  },

  //[GET] /api/v1/products/detail
  getProductDetailAPI: async (req, res, next) => {
    try {
      const product = await Product.findOne({ slug: req.params.slug }).lean();
      res.json(product);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //[GET] /api/v1/products/category/:category
  getProductsByCategory: async (req, res, next) => {
    try {
      const category = req.params.category;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      // get params from query
      const {
        brand,
        size,
        color,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder = "desc",
      } = req.query;

      // Base filter by category
      const filter = {
        category,
        deleted: false,
      };

      if (brand) {
        const brands = Array.isArray(brand) ? brand : [brand];
        filter.brand = { $in: brands.map((b) => new RegExp(b, "i")) };
      }

      // Filter by price
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }

      // Filter color and size
      const variationFilters = [];

      if (color) {
        const colors = decodeURIComponent(color)
          .split(",")
          .map((c) => c.trim());

        const colorRegex = colors.map((c) => new RegExp(c, "i"));

        filter["variations.color"] = { $in: colorRegex };
      }

      if (size) {
        const sizes = decodeURIComponent(size)
          .split(",")
          .map((s) => s.trim());
        filter["variations.sizes.size"] = { $in: sizes };
      }

      if (variationFilters.length > 0) {
        filter.$and = variationFilters;
      }

      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
      }

      const [products, total] = await Promise.all([
        Product.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
        Product.countDocuments(filter),
      ]);

      res.json({
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //[POST] /api/v1/products/filtered
  getFilteredProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      const {
        category,
        brand,
        size,
        color,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder = "desc",
      } = req.query;

      const filter = { deleted: false };

      //$regex to distingush between normal case and uppercase
      if (category) {
        filter.category = { $regex: new RegExp(category, "i") };
      }

      if (brand) {
        const brands = decodeURIComponent(brand).split(","); // Decode URL and split to array
        filter.brand = { $in: brands.map((b) => new RegExp(b.trim(), "i")) };
      }

      // Filter by size and color
      const variationFilters = [];

      if (color) {
        const colors = decodeURIComponent(color)
          .split(",")
          .map((c) => c.trim());

        const colorRegex = colors.map((c) => new RegExp(c, "i"));

        filter["variations.color"] = { $in: colorRegex };
      }

      if (size) {
        const sizes = decodeURIComponent(size)
          .split(",")
          .map((s) => s.trim());
        filter["variations.sizes.size"] = { $in: sizes };
      }

      if (variationFilters.length > 0) {
        filter.$and = variationFilters;
      }

      // Filter by price
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice); // >= Greater Than or Equal
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice); // <= Less Than or Equal
      }

      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
      }

      const [products, total] = await Promise.all([
        Product.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
        Product.countDocuments(filter),
      ]);

      res.status(200).json({
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Filter error:", error);
      res.status(500).json({ error });
    }
  },

  getSearchedProducts: async (req, res, next) => {
    try {
      //q = query
      const { q = "", page = 1 } = req.query;

      const limit = 12;
      const skip = (page - 1) * limit;

      const searchTextRegex = new RegExp(q, "i"); //not to distingush between normal case and uppercase

      //find name or category or brand that include searchTextRegex
      const filter = {
        $or: [
          { name: searchTextRegex },
          { category: searchTextRegex },
          { brand: searchTextRegex },
          { description: searchTextRegex },
        ],
      };

      const [products, total] = await Promise.all([
        Product.find(filter).skip(skip).limit(limit).lean(),
        Product.countDocuments(filter),
      ]);

      res.status(200).json({
        data: products,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalProducts: total,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  },
};

module.exports = productController;
