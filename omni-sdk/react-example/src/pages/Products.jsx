import React from "react";
import { useTracker } from "@omni-analytics/react";
import { Link } from "react-router-dom";

export function Products() {
  const tracker = useTracker();
  const [products] = React.useState([
    { id: 1, name: "Laptop Pro", price: "$1,299", category: "electronics" },
    { id: 2, name: "Wireless Mouse", price: "$49", category: "accessories" },
    {
      id: 3,
      name: "Mechanical Keyboard",
      price: "$149",
      category: "accessories",
    },
    { id: 4, name: "4K Monitor", price: "$599", category: "electronics" },
    { id: 5, name: "Laptop Stand", price: "$79", category: "accessories" },
    { id: 6, name: "USB-C Hub", price: "$89", category: "accessories" },
  ]);

  const handleProductView = (productId, productName, category) => {
    // This gets auto-tracked as a click, but we also track as custom event
    tracker?.trackCustom("product_viewed", {
      productId,
      productName,
      category,
      timestamp: new Date().toISOString(),
    });
  };

  const handleAddToCart = (e, productId, productName, price) => {
    e.stopPropagation();
    // This gets auto-tracked as a click + custom event
    tracker?.trackCustom("add_to_cart", {
      productId,
      productName,
      price,
      page: "products",
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="page">
      <h1>Our Products Catalog</h1>
      <p className="page-subtitle">Browse our collection of tech products</p>

      <div className="products-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() =>
              handleProductView(product.id, product.name, product.category)
            }
          >
            <div
              className="product-image"
              style={{
                background: "#f0f0f0",
                height: "150px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "10px",
              }}
            >
              📦
            </div>
            <h3>{product.name}</h3>
            <p className="category">{product.category}</p>
            <p className="price">{product.price}</p>
            <button
              onClick={(e) =>
                handleAddToCart(e, product.id, product.name, product.price)
              }
              className="secondary-btn"
            >
              🛒 Add to Cart
            </button>
          </div>
        ))}
      </div>

      <div className="code-snippet">
        <h3>📝 How This Works in Code</h3>
        <pre>{`const tracker = useTracker()

const handleAddToCart = (productId, name) => {
  // Click is auto-tracked
  // Plus we track custom event:
  tracker.trackCustom('add_to_cart', {
    productId,
    name,
    page: 'products'
  })
}`}</pre>
      </div>
    </div>
  );
}
