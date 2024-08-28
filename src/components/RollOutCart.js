import React from 'react';
import './RollOutCart.css';

class RollOutCart extends React.Component {
    handleDecreaseQuantity = (item) => {
        const newQuantity = item.quantity - 1;
        if (newQuantity <= 0) {
            this.props.removeFromCart(item); // Remove item if quantity reaches 0
        } else {
            this.props.updateQuantity(item, newQuantity); // Update quantity
        }
    }

    handleIncreaseQuantity = (item) => {
        const newQuantity = item.quantity + 1;
        this.props.updateQuantity(item, newQuantity); // Update quantity
    }

    render() {
        const { cartItems, total, isOpen, closeCart } = this.props;

        return (
            <div className={`rollout-cart ${isOpen ? 'open' : ''}`}>
                <div className="cart-content">
                    <button className="close-button" onClick={closeCart}>×</button>
                    <h2>Your Cart</h2>
                    {cartItems.length === 0 ? (
                        <p>No items in the cart</p>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <img src={item.gallery[0]} alt={item.name} />
                                <div className="item-details">
                                    <p>{item.name}</p>
                                    <p>Price: ${(parseFloat(item.price.replace(/[^0-9.-]+/g, '')) * item.quantity).toFixed(2)}</p>
                                    <div className="quantity-controls">
                                        <button 
                                            className="quantity-button" 
                                            onClick={() => this.handleDecreaseQuantity(item)} // Decrease quantity
                                            disabled={item.quantity <= 1} // Disable if quantity is 1
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button 
                                            className="quantity-button" 
                                            onClick={() => this.handleIncreaseQuantity(item)} // Increase quantity
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button 
                                        className="remove-button" 
                                        onClick={() => this.props.removeFromCart(item)} // Remove item from cart
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    <h3>Total: ${total.toFixed(2)}</h3>
                </div>
            </div>
        );
    }
}

export default RollOutCart;