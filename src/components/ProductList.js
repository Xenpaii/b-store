// src/components/ProductList.js
import React from 'react';
import './ProductList.css'; 
import { Link } from 'react-router-dom';

class ProductList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            loading: true,
            error: null,
            selectedVariants: {},
            isFadingOut: false,
            isFadingIn: false,
        };
    }

    componentDidMount() {
        this.fetchProducts(this.props.selectedCategory);
    }

    componentDidUpdate(prevProps) {
        // Check if the selected category has changed
        if (prevProps.selectedCategory !== this.props.selectedCategory) {
            this.fadeOutCurrentItems();
        }
    }

    fetchProducts = (selectedCategory) => {
        const query = `
            query {
                products {
                    id
                    name
                    category
                    price 
                    gallery
                    in_stock
                    attributes {
                        id
                        name
                        items {
                            id
                            displayValue
                            value
                        }
                    }
                }
            }
        `;
    
        fetch(process.env.REACT_APP_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(json => {
                    throw new Error(`${response.status} - ${response.statusText}: ${JSON.stringify(json)}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.errors) {
                throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
            }
    
            const filteredProducts = data.data.products.filter(product => 
                selectedCategory === 'all' || product.category === selectedCategory
            );
    
            this.setState({ products: filteredProducts, loading: false, isFadingOut: false, isFadingIn: true });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            this.setState({ error: error.message, loading: false });
        });
    }

    fadeOutCurrentItems = () => {
        this.setState({ isFadingOut: true, isFadingIn: false });
        setTimeout(() => {
            this.fetchProducts(this.props.selectedCategory);
        }, 500);
    }

    addToCart = (product) => {
        // Set default variants by selecting the first item for each attribute
        const defaultVariants = product.attributes.reduce((acc, attribute) => {
            acc[attribute.id] = attribute.items[0].value; // Select the first item
            return acc;
        }, {});

        console.log("Adding to cart:", product); // Log the product being added
        this.props.addToCart(product, defaultVariants); // Pass the default variants to addToCart
    }

    render() {
        const { loading, error, products } = this.state;

        const sortedProducts = products.sort((a, b) => {
            return (a.in_stock === b.in_stock) ? 0 : a.in_stock ? -1 : 1;
        });

        return (
            <div className={`product-list ${loading ? '' : 'fade-in'}`}>
                {loading && <p>Loading...</p>}
                {error && <p>Error: {error}</p>}

                <div className={`product-cards ${this.state.isFadingOut ? 'fade-out' : ''} ${this.state.isFadingIn ? 'fade-in' : ''}`}>
                    {sortedProducts.map(product => {
                        const price = parseFloat(product.price.replace(/[^0-9.-]+/g, ''));
                        const productNameKebab = product.name.replace(/\s+/g, '-').toLowerCase(); // Convert product name to kebab case
                        return (
                            <div 
                                key={product.id} 
                                className={`product-card`} 
                                data-testid={`product-${productNameKebab}`} // Add data-testid attribute
                            >
                                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="image-container">
                                        <img 
                                            src={product.gallery[0]} 
                                            alt={product.name} 
                                            className={!product.in_stock ? 'dimmed' : ''} // Apply dimmed class if out of stock
                                        />
                                        {!product.in_stock && (
                                            <div className="out-of-stock-overlay">
                                                <span>Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="divider"></div>
                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <p>{price.toFixed(2)} USD</p>
                                    </div>
                                </Link>
                                {product.in_stock && (
                                    <button 
                                        className="quick-shop-button" 
                                        onClick={() => this.addToCart(product)} // Ensure this calls addToCart correctly
                                    >
                                        <span>🛒</span> {/* Only the cart symbol */}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default ProductList;