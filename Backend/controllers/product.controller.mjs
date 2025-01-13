import { log } from "console";
import { pool } from "../db/db.mjs";
import multer from "multer";
import path from "path";

// Configure storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage }).array("images", 10); // Limit to 10 images

const createProduct = async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error uploading images." });
      }
  
      try {
        const {
          product_name,
          ws_code,
          sales_price,
          mrp,
          package_size,
          tags, // Received as a string, e.g., '["astro","sports"]'
          category_id,
        } = req.body;
  log(req.body)
  // Parse tags into an array if it's a JSON string
  const parsedTags = tags.split(',');
  log(parsedTags)
  
        const images = req.files
          ? req.files.map((file) => `/uploads/${file.filename}`)
          : [];
  
        if (images.length === 0) {
          return res
            .status(400)
            .json({ message: "At least one image is required." });
        }
  
        const result = await pool.query(
          "INSERT INTO Products (product_name, ws_code, sales_price, mrp, package_size, images, tags, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
          [
            product_name,
            ws_code,
            sales_price,
            mrp,
            package_size,
            images, // Array of image URLs
            parsedTags, // PostgreSQL expects an array
            category_id,
          ]
        );
  
        res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating product" });
      }
    });
  };
  

const getProductsByName = async (req, res) => {
    const { product_name } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM Products WHERE product_name ILIKE $1",
            [`%${product_name}%`]
        );
        const products = result.rows;

        if (products.length === 0) {
            return res
                .status(404)
                .json({ error: "No products found matching the name" });
        }

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: "Error fetching products by name" });
        console.log(err);
    }
};
const getProductsByWsCode = async (req, res) => {
    const { ws_code } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM Products WHERE CAST(ws_code AS TEXT) ILIKE $1",
            [`%${ws_code}%`]
        );
        const products = result.rows;

        if (products.length === 0) {
            return res
                .status(404)
                .json({ error: "No products found matching the ws_code" });
        }

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: "Error fetching products by ws_code" });
        console.log(err);
    }
};

const createCategory = async (req, res) => {
    const { category_name } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO Categories (category_name) VALUES ($1) RETURNING *",
            [category_name]
        );
        const category = result.rows[0];
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: "Error creating category" });
        console.log(err);
    }
};

const getAllProducts = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Products");
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error fetching products" });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM Products WHERE id = $1",
            [id]
        );
        const product = result.rows[0];

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: "Error fetching product" });
    }
};

const getCategories = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Categories");
        res.status(200).json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error fetching categories" });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM Products WHERE id = $1 RETURNING *",
            [id]
        );
        const product = result.rows[0];

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting product" });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const {
        product_name,
        ws_code,
        sales_price,
        mrp,
        package_size,
        images,
        tags,
        category_id,
    } = req.body;

    try {
        const result = await pool.query(
            "UPDATE Products SET product_name = $1, ws_code = $2, sales_price = $3, mrp = $4, package_size = $5, images = $6, tags = $7, category_id = $8 WHERE id = $9 RETURNING *",
            [
                product_name,
                ws_code,
                sales_price,
                mrp,
                package_size,
                images,
                tags,
                category_id,
                id,
            ]
        );

        const product = result.rows[0];

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: "Error updating product" });
        console.log(err);
    }
};
export {
    createProduct,
    createCategory,
    getAllProducts,
    getProductById,
    deleteProduct,
    updateProduct,
    getProductsByName,
    getProductsByWsCode,
    getCategories,
};
