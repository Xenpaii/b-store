import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import NewCart from './components/NewCart';
import ProductList from './components/ProductList';
import CartItemCounter from './components/CartItemCounter';
import ProductPage from './components/ProductPage';
import './App.css';

const App = () => {
    const location = useLocation();
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [cartItems, setCartItems] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const [isCartOpen, setIsCartOpen] = React.useState(false);

    React.useEffect(() => {
        const category = location.pathname.split('/')[1];

        if (category === '' || !['all', 'tech', 'clothes'].includes(category)) {
            setSelectedCategory('all');
        } else {
            setSelectedCategory(category);
        }
    }, [location]);

    const toggleCart = () => {
        setIsCartOpen(prevState => !prevState);
    };

    const addToCart = (item, selectedVariants) => {
        console.log("Adding to cart:", item, "with variants:", selectedVariants);
        
        const itemIdentifier = `${item.id}-${JSON.stringify(selectedVariants)}`;
        const existingItem = cartItems.find(cartItem => 
            `${cartItem.id}-${JSON.stringify(cartItem.selectedVariants)}` === itemIdentifier
        );

        if (existingItem) {
            
            setCartItems(prevCartItems => prevCartItems.map(cartItem => {
                if (cartItem.id === existingItem.id && JSON.stringify(cartItem.selectedVariants) === JSON.stringify(existingItem.selectedVariants)) {
                    return { ...cartItem, quantity: cartItem.quantity + 1 };
                }
                return cartItem;
            }));
            
            setTotal(prevTotal => prevTotal + parseFloat(item.price.replace(/[^0-9.-]+/g, '')));
        } else {
            
            setCartItems(prevCartItems => {
                const updatedCartItems = [...prevCartItems, { ...item, quantity: 1, selectedVariants }];
                setIsCartOpen(true); 
                return updatedCartItems;
            });
            
            setTotal(prevTotal => prevTotal + parseFloat(item.price.replace(/[^0-9.-]+/g, '')));
        }
    };

    const updateQuantity = (item, quantity) => {
        setCartItems(prevCartItems => {
            const updatedCartItems = prevCartItems.map(cartItem => {
                if (cartItem.id === item.id && JSON.stringify(cartItem.selectedVariants) === JSON.stringify(item.selectedVariants)) {
                    if (quantity <= 0) {
                        return null; 
                    } else {
                        return { ...cartItem, quantity }; 
                    }
                }
                return cartItem; 
            }).filter(item => item !== null);
            
            
            const newTotal = updatedCartItems.reduce((acc, cartItem) => {
                return acc + (cartItem.quantity * parseFloat(cartItem.price.replace(/[^0-9.-]+/g, '')));
            }, 0);
            
            setTotal(newTotal); 
            return updatedCartItems;
        });
    };

    const removeFromCart = (item) => {
        setCartItems(prevCartItems => {
            const updatedCartItems = prevCartItems.filter(cartItem => 
                cartItem.id !== item.id || JSON.stringify(cartItem.selectedVariants) !== JSON.stringify(item.selectedVariants)
            );
            const priceChange = item.quantity * parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
            const newTotal = Math.max(0, total - priceChange); 
            setTotal(newTotal);
            return updatedCartItems;
        });
    };

    const closeCart = () => {
        setIsCartOpen(false);
    };

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
    };

    const cartCount = React.useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.quantity, 0);
    }, [cartItems]);

    return (
        <div className="app">
            <Navbar 
                toggleCart={toggleCart} 
                cartCount={cartCount} 
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory} 
            />
            <CartItemCounter cartCount={cartCount} />
            <NewCart 
                cartItems={cartItems}
                total={total}
                isOpen={isCartOpen}
                closeCart={closeCart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
            />
            <div className="main-content">
                <Routes>
                    <Route path="/product/:productId" element={<ProductPage addToCart={addToCart} />} />
                    <Route path="/all" element={
                        <>
                            <h2 className="category-title">All</h2>
                            <ProductList 
                                addToCart={addToCart} 
                                selectedCategory="all" 
                                onSelectCategory={handleSelectCategory} 
                                cartItems={cartItems} 
                                updateQuantity={updateQuantity} 
                                removeFromCart={removeFromCart} 
                            />
                        </>
                    } />
                    <Route path="/tech" element={
                        <>
                            <h2 className="category-title">Tech</h2>
                            <ProductList 
                                addToCart={addToCart} 
                                selectedCategory="tech" 
                                onSelectCategory={handleSelectCategory} 
                                cartItems={cartItems} 
                                updateQuantity={updateQuantity} 
                                removeFromCart={removeFromCart} 
                            />
                        </>
                    } />
                    <Route path="/clothes" element={
                        <>
                            <h2 className="category-title">Clothes</h2>
                            <ProductList 
                                addToCart={addToCart} 
                                selectedCategory="clothes" 
                                onSelectCategory={handleSelectCategory} 
                                cartItems={cartItems} 
                                updateQuantity={updateQuantity} 
                                removeFromCart={removeFromCart} 
                            />
                        </>
                    } />
                    <Route path="/" element={<Navigate to="/all" />} /> 
                    <Route path="*" element={<Navigate to="/all" />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;