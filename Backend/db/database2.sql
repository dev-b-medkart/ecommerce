CREATE TABLE Categories (
id Serial Primary key,
category_name varchar(255) not null

);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    role VARCHAR(10) CHECK (role IN ('admin', 'customer')) NOT NULL, -- Role, must be 'Admin' or 'Customer'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE Products (
    id SERIAL PRIMARY KEY,                                  -- Auto-incremented product ID
    product_name VARCHAR(255) NOT NULL,                     -- Product name, cannot be null
    ws_code INTEGER NOT NULL UNIQUE CHECK (ws_code >= 0),   -- Product code, must be a non-negative integer
    sales_price INTEGER NOT NULL CHECK (sales_price > 0),   -- Sales price, must be greater than 0
    mrp INTEGER NOT NULL CHECK (mrp > 0),                   -- MRP (Maximum Retail Price), must be greater than 0
    package_size INTEGER NOT NULL CHECK (package_size > 0), -- Package size, must be greater than 0
    images TEXT[] DEFAULT '{}',                             -- Array of image URLs for the product
    tags TEXT[] DEFAULT '{}',                               -- Array of tags associated with the product (e.g., 'electronics', 'sale')
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,-- Foreign key to Categories table
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)     -- Ensure stock is non-negative
);



-- -- Indexes for improved query performance
-- CREATE INDEX idx_category_id ON Products(category_id);
-- CREATE INDEX idx_tags ON Products USING GIN (tags);


CREATE TABLE Carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pending',
    total_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Order_Items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES Orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2)
);

