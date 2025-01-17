import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ProductPage.css'; 

const ProductPage = ({ addToCart }) => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedVariants, setSelectedVariants] = useState({}); 

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const query = `
            query {
                products {
                    id
                    name
                    description
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
    
        try {
            const response = await fetch(process.env.REACT_APP_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });
    
            if (!response.ok) {
                const errorText = await response.text(); // Read the response text
                console.error('API response error:', errorText); // Log the error response
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }
    
            const text = await response.text(); // Read the response as text
            console.log('Raw response:', text); // Log the raw response for debugging
    
            // Parse the JSON after logging
            const data = JSON.parse(text);
    
            if (data.errors) {
                console.error('GraphQL errors:', data.errors);
                throw new Error('GraphQL error: ' + JSON.stringify(data.errors));
            }
    
            const foundProduct = data.data.products.find(p => p.id === productId);
            if (foundProduct) {
                setProduct(foundProduct);
                setSelectedImage(foundProduct.gallery[0]); 
            } else {
                setError('Product not found');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleAddToCart = () => {
        if (product) {
            console.log('Adding to cart:', {
                id: product.id,
                name: product.name,
                selectedVariants: selectedVariants 
            });
            addToCart(product, selectedVariants); 
        }
    };

    const nextImage = () => {
        const currentIndex = product.gallery.indexOf(selectedImage);
        const nextIndex = (currentIndex + 1) % product.gallery.length;
        setSelectedImage(product.gallery[nextIndex]);
    };

    const prevImage = () => {
        const currentIndex = product.gallery.indexOf(selectedImage);
        const prevIndex = (currentIndex - 1 + product.gallery.length) % product.gallery.length;
        setSelectedImage(product.gallery[prevIndex]);
    };

    const handleVariantChange = (attributeId, selectedVariant) => {
        setSelectedVariants(prev => ({
            ...prev,
            [attributeId]: selectedVariant,
        }));
    };

    const allAttributesSelected = () => {
        return product.attributes.every(attribute => selectedVariants[attribute.id]);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!product) return <p>Product not found.</p>;

    return (
        <div className="product-page">
            <div className="product-page-content">
                <div className="image-gallery" data-testid="product-gallery">
                    <div className="thumbnail-list">
                        {product.gallery.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={product.name}
                                className={`thumbnail ${selectedImage === image ? 'selected' : ''}`} 
                                onClick={() => handleImageClick(image)}
                            />
                        ))}
                    </div>
                    <div className="carousel">
                        <button className="arrow left" onClick={prevImage}>&lt;</button>
                        <div className="main-image">
                            <img src={selectedImage} alt={product.name} />
                        </div>
                        <button className="arrow right" onClick={nextImage}>&gt;</button>
                    </div>
                </div>
                <div className="product-details">
                    <h1>{product.name}</h1>
                    <p>Price: ${parseFloat(product.price).toFixed(2)}</p>
                    {product.attributes && product.attributes.map(attribute => (
                        <div key={attribute.id} className="attribute-selector">
                            <label data-testid={`product-attribute-${attribute.name.replace(/\s+/g, '-').toLowerCase()}`}>{attribute.name}:</label>
                            <div className="attribute-tiles">
                                {attribute.items.map(item => {
                                    return (
                                        <button
                                            key={item.id}
                                            className={`attribute-button ${selectedVariants[attribute.id] === item.value ? 'selected' : ''}`}
                                            onClick={() => handleVariantChange(attribute.id, item.value)}
                                            style={attribute.name === 'Color' ? { backgroundColor: item.value, width: '30px', height: '30px' } : {}}
                                            data-testid={`product-attribute-${attribute.name.replace(/\s+/g, '-').toLowerCase()}-${item.value.replace(/\s+/g, '-')}`} 
                                        >
                                            {attribute.name !== 'Color' && item.displayValue}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    <div style={{ margin: '20px 0' }} />
                    <button 
                        className={`add-to-cart-button ${!allAttributesSelected() ? 'disabled' : ''}`}
                        onClick={handleAddToCart} 
                        disabled={!allAttributesSelected()} 
                        data-testid="add-to-cart" 
                    >
                        Add to Cart
                    </button>
                    <div className="product-description" data-testid="product-description">
                        {product.description.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;