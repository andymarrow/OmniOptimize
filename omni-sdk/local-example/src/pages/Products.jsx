import { useTracker } from "@omni-analytics/react";
import { useState } from "react";

export default function Products() {
  const tracker = useTracker();
  const [products] = useState([
    { id: 1, name: "Analytics Pro", price: "$99", desc: "Advanced tracking" },
    { id: 2, name: "Basic Plan", price: "$29", desc: "Essential analytics" },
    { id: 3, name: "Enterprise", price: "Custom", desc: "Full featured" },
  ]);

  const handleProductClick = (product) => {
    tracker?.trackCustom("product_click", {
      productId: product.id,
      productName: product.name,
      price: product.price,
    });
  };

  const handleAddCart = (product) => {
    tracker?.trackCustom("add_to_cart", {
      productId: product.id,
      productName: product.name,
    });
  };

  return (
    <div className="page">
      <h1>Our Products 🛍️</h1>
      <p className="subtitle">
        Click products to see them tracked in the console
      </p>

      <div className="products-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => handleProductClick(product)}
          >
            <h3>{product.name}</h3>
            <p className="price">{product.price}</p>
            <p className="desc">{product.desc}</p>
            <button
              className="btn btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleAddCart(product);
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <div className="info-box">
        <h3>🎯 What Happens Here?</h3>
        <ul>
          <li>Clicking a product card = custom event tracked</li>
          <li>Clicking "Add to Cart" = another custom event</li>
          <li>All auto-tracked in the browser console (F12)</li>
          <li>Events are batched together before sending</li>
        </ul>
      </div>
    </div>
  );
}
