import React from 'react';
import './CartItemCounter.css'; 

const CartItemCounter = ({ cartCount }) => {
  if (cartCount === 0) return null; 

  return (
    <div className={`cart-item-counter fade-in`}>
      {cartCount === 1 ? '1 Item' : `${cartCount} Items`}
    </div>
  );
};

export default CartItemCounter;