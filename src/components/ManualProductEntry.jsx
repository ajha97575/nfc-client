"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../utils/CartContext.jsx";
import { getAllProducts, getProductById } from "../utils/productData.js";
import { playSuccessSound } from "../utils/soundUtils.js";
import { SmartImage } from "../utils/imageUtils.jsx";

const ManualProductEntry = ({ onProductAdded }) => {
  const [productId, setProductId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allProducts, setAllProducts] = useState({});
  const [showProductList, setShowProductList] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addItemOnce, isItemInCart } = useCart();

  useEffect(() => {
    loadAllProducts();
  }, []);

  const loadAllProducts = async () => {
    try {
      console.log("📦 Loading all products...");
      const products = await getAllProducts();
      setAllProducts(products);
      console.log("✅ Loaded", Object.keys(products).length, "products");
    } catch (error) {
      console.error("❌ Error loading products:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId.trim()) {
      return;
    }
    await addProductToCart(productId.trim().toUpperCase());
  };

  const addProductToCart = async (id) => {
    setIsLoading(true);

    try {
      const product = await getProductById(id);

      if (product) {
        if (isItemInCart(product.id)) {
          console.log(`${product.name} is already in your cart!`);
        } else {
          addItemOnce(product);
          playSuccessSound();
          console.log(`✅ Added ${product.name} to cart!`);

          if (onProductAdded) {
            onProductAdded(product);
          }
          setProductId("");
        }
      } else {
        console.log(`Product ${id} not found`);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredProducts = () => {
    const products = Object.values(allProducts);
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        product.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  };

  const getCategories = () => {
    const categories = [
      ...new Set(
        Object.values(allProducts)
          .map((p) => p.category)
          .filter(Boolean)
      ),
    ];
    return categories.sort();
  };

  const filteredProducts = getFilteredProducts();
  const categories = getCategories();

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h3
          style={{
            margin: "0",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          📝 Manual Product Entry
        </h3>
        <button
          onClick={() => {
            setShowProductList(!showProductList);
            console.log(
              showProductList ? "Product list hidden" : "Product list shown"
            );
          }}
          className="nav-btn info"
          style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
        >
          {showProductList ? "🔼 Hide Products" : "🔽 Show Products"}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <div className="form-group">
          <label htmlFor="productId" className="form-label">
            Product ID
          </label>
          <input
            type="text"
            id="productId"
            value={productId}
            onChange={(e) => setProductId(e.target.value.toUpperCase())}
            placeholder="Enter Product ID (e.g., FOOD001)"
            disabled={isLoading}
            className="form-input"
            style={{ textTransform: "uppercase" }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !productId.trim()}
          className="nav-btn primary"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              Adding Product...
            </>
          ) : (
            <>➕ Add to Cart</>
          )}
        </button>
      </form>

      <AnimatePresence>
        {showProductList && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h4
                style={{
                  margin: "0",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                🛒 Available Products ({filteredProducts.length})
              </h4>
              <button
                onClick={() => {
                  loadAllProducts();
                  console.log("Products refreshed!");
                }}
                className="nav-btn secondary"
                style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
              >
                🔄 Refresh
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ flex: "1", minWidth: "200px" }}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input"
                style={{ minWidth: "150px" }}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
                maxHeight: "500px",
                overflowY: "auto",
                padding: "1rem",
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-light)",
              }}
            >
              <AnimatePresence>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="card"
                      style={{
                        padding: "1.5rem",
                        position: "relative",
                        background: isItemInCart(product.id)
                          ? "rgba(16, 185, 129, 0.05)"
                          : "var(--bg-primary)",
                        border: isItemInCart(product.id)
                          ? "2px solid var(--secondary-color)"
                          : "1px solid var(--border-light)",
                      }}
                      whileHover={{ y: -4, boxShadow: "var(--shadow-xl)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="badge primary"
                        style={{
                          position: "absolute",
                          top: "1rem",
                          right: "1rem",
                        }}
                      >
                        {product.id}
                      </div>

                      {product.category && (
                        <div
                          className="badge info"
                          style={{
                            position: "absolute",
                            top: "1rem",
                            left: "1rem",
                          }}
                        >
                          {product.category}
                        </div>
                      )}

                      <div style={{ marginTop: "2rem" }}>
                        <SmartImage
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "120px",
                            objectFit: "cover",
                            borderRadius: "var(--radius-lg)",
                            marginBottom: "1rem",
                          }}
                          fallbackSrc="/placeholder.svg?height=120&width=300&text=Product+Image"
                        />

                        <h5
                          style={{
                            margin: "0 0 0.75rem 0",
                            color: "var(--text-primary)",
                            fontSize: "1.125rem",
                            fontWeight: "600",
                          }}
                        >
                          {product.name}
                        </h5>

                        <p
                          style={{
                            margin: "0 0 1rem 0",
                            color: "var(--text-secondary)",
                            fontSize: "0.875rem",
                            lineHeight: "1.5",
                          }}
                        >
                          {product.description}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "1rem",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "700",
                              color: "var(--secondary-color)",
                              fontSize: "1.25rem",
                            }}
                          >
                            ₹{product.price.toFixed(2)}
                          </span>
                          {product.stock && (
                            <span
                              className="badge secondary"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Stock: {product.stock}
                            </span>
                          )}
                        </div>

                        <button
                          className={`nav-btn ${
                            isItemInCart(product.id) ? "accent" : "primary"
                          }`}
                          style={{ width: "100%", justifyContent: "center" }}
                          onClick={(e) => {
                            addProductToCart(product.id);
                          }}
                        >
                          {isItemInCart(product.id)
                            ? "✅ In Cart"
                            : "➕ Add to Cart"}
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="empty-state"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    {Object.keys(allProducts).length === 0 ? (
                      <>
                        <div className="empty-state-icon">📦</div>
                        <h3>Loading Products...</h3>
                        <div
                          className="loading-spinner"
                          style={{ margin: "1rem auto" }}
                        ></div>
                      </>
                    ) : (
                      <>
                        <div className="empty-state-icon">🔍</div>
                        <h3>No Products Found</h3>
                        <p>Try adjusting your search or category filter.</p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          background:
            "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-light)",
        }}
      >
        <h4
          style={{
            margin: "0 0 1rem 0",
            fontSize: "1rem",
            color: "var(--text-primary)",
          }}
        >
          ⚡ Quick Add - Popular Items
        </h4>

        <div style={{ display: "grid", gap: "1rem" }}>
          {[
            {
              title: "🍽️ Food",
              ids: ["FOOD001", "FOOD002", "FOOD003", "FOOD004", "FOOD005"],
            },
            {
              title: "📱 Electronics",
              ids: ["ELEC001", "ELEC002", "ELEC003", "ELEC004", "ELEC005"],
            },
            {
              title: "👕 Clothes",
              ids: ["CLTH001", "CLTH002", "CLTH003", "CLTH004", "CLTH005"],
            },
          ].map((category) => (
            <div key={category.title}>
              <h5
                style={{
                  margin: "0 0 0.75rem 0",
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                }}
              >
                {category.title}
              </h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {category.ids.map((id) => {
                  const product = allProducts[id];
                  return (
                    <motion.button
                      key={id}
                      className={`badge ${
                        isItemInCart(id) ? "warning" : "primary"
                      }`}
                      style={{
                        cursor: "pointer",
                        border: "none",
                        transition: "var(--transition)",
                      }}
                      onClick={() => addProductToCart(id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isItemInCart(id) ? "✅" : "+"} {id}
                      {product && ` - ₹${product.price}`}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            margin: "1rem 0 0 0",
            textAlign: "center",
          }}
        >
          💡 Click any Product ID to add instantly • Perfect for testing NFC
          tags!
        </p>
      </div>
    </motion.div>
  );
};

export default ManualProductEntry;
