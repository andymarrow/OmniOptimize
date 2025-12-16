import { useTracker } from "@omni-analytics/react";

export default function Cart() {
  const tracker = useTracker();

  const handleCheckout = () => {
    tracker?.trackCustom("checkout_started", {
      items: 3,
      total: "$157",
    });
  };

  return (
    <div className="page">
      <h1>Shopping Cart 🛒</h1>

      <div className="cart-items">
        <div className="cart-item">
          <span>Analytics Pro</span>
          <span>$99</span>
        </div>
        <div className="cart-item">
          <span>Basic Plan</span>
          <span>$29</span>
        </div>
        <div className="cart-item">
          <span>Enterprise</span>
          <span>Custom</span>
        </div>
      </div>

      <div className="cart-total">
        <strong>Subtotal:</strong> $157
      </div>

      <button className="btn btn-primary btn-large" onClick={handleCheckout}>
        Proceed to Checkout
      </button>

      <div className="info-box">
        <h3>💳 Event Tracking Example</h3>
        <p>
          Click the checkout button to trigger a custom event that will be
          tracked and logged to the console.
        </p>
      </div>
    </div>
  );
}
