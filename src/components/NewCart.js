import React from 'react';
import './NewCart.css'; // Ensure this CSS file exists

class NewCart extends React.Component {
    state = {
        showOverlay: false,
        overlayOpacity: 0,
    };

    handleDecreaseQuantity = (item) => {
        const newQuantity = item.quantity - 1;
        if (newQuantity <= 0) {
            this.props.removeFromCart(item);
        } else {
            this.props.updateQuantity(item, newQuantity);
        }
    };

    handleIncreaseQuantity = (item) => {
        const newQuantity = item.quantity + 1;
        this.props.updateQuantity(item, newQuantity);
    };

    componentDidUpdate(prevProps) {
        if (this.props.isOpen && !prevProps.isOpen) {
            this.setState({ showOverlay: true, overlayOpacity: 1 });
        } else if (!this.props.isOpen && prevProps.isOpen) {
            this.setState({ overlayOpacity: 0 });
            setTimeout(() => {
                this.setState({ showOverlay: false });
            }, 300);
        }
    }

    placeOrder = async () => {
        const { cartItems, total } = this.props;

        if (cartItems.length === 0) return; // Prevent placing an order if the cart is empty

        // Prepare items data including attributes
        const items = cartItems.map(item => {
            const itemName = item.name; // Assuming item has a name property
            const itemAttributes = item.selectedVariants; // Assuming selectedVariants contains the attributes

            // Create a structured object for the order
            const itemEntry = { name: itemName };

            for (const [key, value] of Object.entries(itemAttributes)) {
                itemEntry[key] = value; // Add attribute to the item entry
            }

            return JSON.stringify(itemEntry); // Convert each item entry to JSON string
        });

        const query = `
            mutation PlaceOrder($items: [String!]!, $total: Float!) {
                placeOrder(items: $items, total: $total) {
                    id
                    items
                    total
                    createdAt
                }
            }
        `;

        const variables = {
            items: items,
            total: total,
        };

        try {
            const response = await fetch(process.env.REACT_APP_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, variables }),
            });

            const data = await response.json(); // Get the response data

            // Log the response for debugging
            console.log('GraphQL response:', data);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            if (data.errors) {
                throw new Error('GraphQL error: ' + JSON.stringify(data.errors));
            }

            // Clear the cart after placing the order
            this.props.cartItems.forEach(item => this.props.removeFromCart(item));
            alert('Order placed successfully!'); // Notify the user
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order: ' + error.message); // Show detailed error message
        }
    };

    render() {
        const { cartItems, total, isOpen, closeCart } = this.props;
        const { showOverlay, overlayOpacity } = this.state;

        return (
            <>
                {showOverlay && (
                    <div 
                        className="overlay" 
                        style={{ opacity: overlayOpacity }} 
                        onClick={closeCart} 
                    />
                )}
                <div className={`new-cart ${isOpen ? 'open' : ''}`}>
                    <div className="cart-content">
                        <button className="close-button" onClick={closeCart}>×</button>
                        <h2>Your Cart</h2>
                        {cartItems.length === 0 ? (
                            <p>No items in the cart</p>
                        ) : (
                            cartItems.map(item => (
                                <div key={item.id} className="cart-item">
                                    <img src={item.gallery[0]} alt={item.name} className="cart-item-image" />
                                    <div className="item-details">
                                        <p className="item-name">{item.name}</p>
                                        <p className="item-price">Price: ${(parseFloat(item.price.replace(/[^0-9.-]+/g, '')) * item.quantity).toFixed(2)}</p>
                                        <div className="selected-variants">
                                            {item.selectedVariants && Object.entries(item.selectedVariants).map(([attributeId, selectedVariant]) => {
                                                const attribute = item.attributes.find(attr => attr.id === attributeId);
                                                return (
                                                    <div key={attributeId} className="selected-variant">
                                                        <span className="variant-name">{attribute.name}:</span>
                                                        <div className="attribute-tiles">
                                                            {attribute.items.map(attrItem => {
                                                                const isSelected = attrItem.value === selectedVariant;
                                                                const isColorAttribute = attribute.name === 'Color';
                                                                return (
                                                                    <button
                                                                        key={attrItem.id}
                                                                        className={`attribute-button ${isSelected ? 'selected' : ''}`}
                                                                        style={isColorAttribute ? { backgroundColor: attrItem.value, width: '30px', height: '30px', pointerEvents: 'none' } : {}}
                                                                    >
                                                                        {!isColorAttribute && attrItem.displayValue}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="quantity-controls">
                                            <div className="quantity-container">
                                                <button 
                                                    className="quantity-button" 
                                                    onClick={() => this.handleDecreaseQuantity(item)} 
                                                >
                                                    -
                                                </button>
                                                <span className="quantity-display">{item.quantity}</span>
                                                <button 
                                                    className="quantity-button" 
                                                    onClick={() => this.handleIncreaseQuantity(item)} 
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            className="remove-button" 
                                            onClick={() => this.props.removeFromCart(item)} 
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                        <h3>Total: ${Math.max(total, 0).toFixed(2)}</h3>
                    </div>
                    <button 
                        className="place-order-button" 
                        onClick={this.placeOrder} 
                        disabled={cartItems.length === 0} // Disable if the cart is empty
                    >
                        Place Order
                    </button>
                </div>
            </>
        );
    }
}

export default NewCart;