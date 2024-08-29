import React from 'react';
import './NewCart.css'; 

class NewCart extends React.Component {
    state = {
        showOverlay: false,
        overlayOpacity: 0,
        isPlacingOrder: false,
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

        if (cartItems.length === 0) return; 

        this.setState({ isPlacingOrder: true }); 

        
        const items = cartItems.map(item => {
            const itemName = item.name; 
            const itemAttributes = item.selectedVariants; 
            const itemQuantity = item.quantity; 

            
            const itemEntry = { name: itemName, attributes: itemAttributes, quantity: itemQuantity }; 

            return JSON.stringify(itemEntry); 
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

            
            const responseText = await response.text(); 
            console.log('Raw response:', responseText); 

            
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }

            
            const data = JSON.parse(responseText);

            
            if (data.errors) {
                throw new Error('GraphQL error: ' + JSON.stringify(data.errors));
            }

            
            this.props.cartItems.forEach(item => this.props.removeFromCart(item));
            alert('Order placed successfully!'); 
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order: ' + error.message); 
        } finally {
            this.setState({ isPlacingOrder: false }); 
        }
    };

    render() {
        const { cartItems, total, isOpen, closeCart } = this.props;
        const { showOverlay, overlayOpacity, isPlacingOrder } = this.state;

        return (
            <>
                {showOverlay && (
                    <div 
                        className="overlay" 
                        style={{ opacity: overlayOpacity }} 
                        onClick={closeCart} 
                        data-testid="cart-overlay" 
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
                                <div key={item.id} className="cart-item" data-testid={`cart-item-${item.name.replace(/\s+/g, '-').toLowerCase()}`}>
                                    <img src={item.gallery[0]} alt={item.name} className="cart-item-image" />
                                    <div className="item-details">
                                        <p className="item-name">{item.name}</p>
                                        <p className="item-price">Price: ${(parseFloat(item.price.replace(/[^0-9.-]+/g, '')) * item.quantity).toFixed(2)}</p>
                                        <div className="selected-variants">
                                            {item.selectedVariants && Object.entries(item.selectedVariants).map(([attributeId, selectedVariant]) => {
                                                const attribute = item.attributes.find(attr => attr.id === attributeId);
                                                return (
                                                    <div key={attributeId} className="selected-variant" data-testid={`cart-item-attribute-${attribute.name.replace(/\s+/g, '-').toLowerCase()}`}>
                                                        <span className="variant-name">{attribute.name}:</span>
                                                        <div className="attribute-tiles">
                                                            {attribute.items.map(attrItem => {
                                                                const isSelected = attrItem.value === selectedVariant;
                                                                const isColorAttribute = attribute.name === 'Color';
                                                                const dataTestId = `product-attribute-color-${attrItem.value.replace(/\s+/g, '-')}`; 
                                                                return isColorAttribute ? (
                                                                    <div 
                                                                        key={attrItem.id} 
                                                                        className={`color-tile ${isSelected ? 'selected' : ''}`} 
                                                                        style={{ backgroundColor: attrItem.value }} 
                                                                        data-testid={dataTestId} 
                                                                    >
                                                                        {isSelected && <span className="selected-color-name">{attrItem.displayValue}</span>} {}
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        key={attrItem.id}
                                                                        className={`attribute-button ${isSelected ? 'selected' : ''}`}
                                                                        data-testid={`product-attribute-${attribute.name.replace(/\s+/g, '-').toLowerCase()}-${attrItem.value.replace(/\s+/g, '-').toLowerCase()}`} 
                                                                    >
                                                                        {attrItem.displayValue}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <hr className="attribute-separator" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="quantity-controls">
                                            <div className="quantity-container">
                                                <button 
                                                    className="quantity-button" 
                                                    onClick={() => this.handleDecreaseQuantity(item)} 
                                                    data-testid="cart-item-amount-decrease" 
                                                >
                                                    -
                                                </button>
                                                <span className="quantity-display" data-testid="cart-item-amount">{item.quantity}</span>
                                                <button 
                                                    className="quantity-button" 
                                                    onClick={() => this.handleIncreaseQuantity(item)} 
                                                    data-testid="cart-item-amount-increase" 
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
                        <h3 data-testid="cart-total">Total: ${Math.max(total, 0).toFixed(2)}</h3>
                    </div>
                    <div className="cart-footer">
                        <button 
                            className="place-order-button" 
                            onClick={this.placeOrder} 
                            disabled={isPlacingOrder || cartItems.length === 0} 
                        >
                            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </>
        );
    }
}

export default NewCart;