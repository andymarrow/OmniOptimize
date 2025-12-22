import React from "react";
import { useTracker } from "@omni-analytics/react";
import { Link } from "react-router-dom";

export function Cart() {
  const tracker = useTracker();

  // Sample cart items
  const [cartItems] = React.useState([
    { id: 1, name: "Laptop Pro", price: 1299, quantity: 1 },
    { id: 3, name: "Mechanical Keyboard", price: 149, quantity: 2 },
  ]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleRemoveItem = (productId, productName) => {
    tracker?.trackCustom("cart_item_removed", {
      productId,
      productName,
      timestamp: new Date().toISOString(),
    });
  };

  const handleCheckout = () => {
    tracker?.trackCustom("checkout_initiated", {
      itemCount: cartItems.length,
      totalAmount: total,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="page">
      <h1>🛒 Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link to="/products" className="primary-btn">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div>
          <div className="cart-items">
            <div className="cart-header">
              <span>Product</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Action</span>
            </div>
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <span className="product-name">{item.name}</span>
                <span className="quantity">{item.quantity}</span>
                <span className="price">${item.price * item.quantity}</span>
                <button
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${total}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${total}</span>
            </div>
          </div>

          <div className="cart-actions">
            <Link to="/products" className="secondary-btn">
              Continue Shopping
            </Link>
            <button onClick={handleCheckout} className="primary-btn">
              💳 Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      <div className="code-snippet">
        <h3>📝 Tracking Cart Operations</h3>
        <pre>{`// Track when items are removed
tracker.trackCustom('cart_item_removed', {
  productId: 123,
  productName: 'Laptop'
})

// Track checkout initiation
tracker.trackCustom('checkout_initiated', {
  itemCount: 2,
  totalAmount: 1447
})`}</pre>
      </div>
    </div>
  );
}
