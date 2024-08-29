import React from 'react';
import './ProductList.css'; 
import { Link } from 'react-router-dom';

const ProductList = (props) => {
    const { selectedCategory } = props; 
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [isFadingOut, setIsFadingOut] = React.useState(false);
    const [isFadingIn, setIsFadingIn] = React.useState(false);

    const fetchProducts = () => {
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

            
            setProducts(filteredProducts);
            setLoading(false);
            setIsFadingOut(false);
            setIsFadingIn(true);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            setError(error.message);
            setLoading(false);
        });
    };

    React.useEffect(() => {
        
        setIsFadingOut(true);
        setIsFadingIn(false);

        
        const fadeDuration = 500; 
        const timer = setTimeout(() => {
            fetchProducts(); 
        }, fadeDuration);

        return () => clearTimeout(timer); 
    }, [selectedCategory]); 

    const addToCart = (product) => {
        
        const defaultVariants = product.attributes.reduce((acc, attribute) => {
            acc[attribute.id] = attribute.items[0].value; 
            return acc;
        }, {});

        console.log("Adding to cart:", product); 
        props.addToCart(product, defaultVariants); 
    };

    const sortedProducts = products.sort((a, b) => {
        return (a.in_stock === b.in_stock) ? 0 : a.in_stock ? -1 : 1;
    });

    return (
        <div className={`product-list ${loading ? '' : 'fade-in'}`}>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}

            <div className={`product-cards ${isFadingOut ? 'fade-out' : ''} ${isFadingIn ? 'fade-in' : ''}`}>
                {sortedProducts.map(product => {
                    const price = parseFloat(product.price.replace(/[^0-9.-]+/g, ''));
                    const productNameKebab = product.name.replace(/\s+/g, '-').toLowerCase(); 
                    return (
                        <div 
                            key={product.id} 
                            className={`product-card`} 
                            data-testid={`product-${productNameKebab}`} 
                        >
                            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="image-container">
                                    <img 
                                        src={product.gallery[0]} 
                                        alt={product.name} 
                                        className={!product.in_stock ? 'dimmed' : ''} 
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
                                    onClick={() => addToCart(product)} 
                                >
                                    <span>🛒</span> 
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductList;