// src/App.js
import React from 'react';
import { Route, Routes } from 'react-router-dom'; // Import Routes and Route
import Navbar from './components/Navbar';
import NewCart from './components/NewCart'; // Import the new cart component
import ProductList from './components/ProductList';
import CartItemCounter from './components/CartItemCounter';
import ProductPage from './components/ProductPage'; // Import the ProductPage component
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: [],
      total: 0,
      isCartOpen: false,
      selectedCategory: 'all', 
    };

    this.updateQuantity = this.updateQuantity.bind(this);
    this.removeFromCart = this.removeFromCart.bind(this);
  }

  toggleCart = () => {
    this.setState(prevState => {
      console.log("Toggling cart. Current state:", prevState.isCartOpen);
      return { isCartOpen: !prevState.isCartOpen };
    });
  };

  addToCart = (item, selectedVariants) => {
    console.log("Adding to cart:", item, "with variants:", selectedVariants); // Log the item being added with variants
    this.setState(prevState => {
      // Create a unique identifier for the item based on its id and selected variants
      const itemIdentifier = `${item.id}-${JSON.stringify(selectedVariants)}`;

      const existingItem = prevState.cartItems.find(cartItem => 
        `${cartItem.id}-${JSON.stringify(cartItem.selectedVariants)}` === itemIdentifier
      );

      if (existingItem) {
        return {
          cartItems: prevState.cartItems.map(cartItem => {
            if (cartItem.id === existingItem.id && JSON.stringify(cartItem.selectedVariants) === JSON.stringify(existingItem.selectedVariants)) {
              return { ...cartItem, quantity: cartItem.quantity + 1 };
            }
            return cartItem;
          }),
          total: prevState.total + parseFloat(item.price.replace(/[^0-9.-]+/g, '')),
        };
      } else {
        return {
          cartItems: [...prevState.cartItems, { ...item, quantity: 1, selectedVariants }],
          total: prevState.total + parseFloat(item.price.replace(/[^0-9.-]+/g, '')),
        };
      }
    });
  };

  updateQuantity(item, quantity) {
    this.setState(prevState => {
      const updatedCartItems = prevState.cartItems.map(cartItem => {
        // Check if the cart item matches the item being updated
        if (cartItem.id === item.id && JSON.stringify(cartItem.selectedVariants) === JSON.stringify(item.selectedVariants)) {
          if (quantity <= 0) {
            // If the quantity is 0 or less, remove the item from the cart
            return null; // Mark for removal
          } else {
            return { ...cartItem, quantity }; // Update quantity for the specific variant
          }
        }
        return cartItem; // Return the cart item unchanged
      }).filter(item => item !== null); // Filter out any null items (items with quantity 0 or less)
      
      const total = updatedCartItems.reduce((acc, cartItem) => {
        return acc + (cartItem.quantity * parseFloat(cartItem.price.replace(/[^0-9.-]+/g, '')));
      }, 0);
      
      return {
        cartItems: updatedCartItems,
        total,
      };
    });
  }

  removeFromCart(item) {
    this.setState(prevState => {
      const updatedCartItems = prevState.cartItems.filter(cartItem => 
        cartItem.id !== item.id || JSON.stringify(cartItem.selectedVariants) !== JSON.stringify(item.selectedVariants)
      );
      const priceChange = item.quantity * parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
      return {
        cartItems: updatedCartItems,
        total: prevState.total - priceChange,
      };
    });
  }

  closeCart = () => {
    this.setState({ isCartOpen: false });
  };

  handleSelectCategory = (category) => {
    this.setState({ selectedCategory: category });
  };

  render() {
    const cartCount = this.state.cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
      <div className="app">
        <Navbar 
          toggleCart={this.toggleCart} 
          cartCount={cartCount} 
          selectedCategory={this.state.selectedCategory}
          onSelectCategory={this.handleSelectCategory} 
        />
        <CartItemCounter cartCount={cartCount} />
        <NewCart // Use the new cart component
          cartItems={this.state.cartItems}
          total={this.state.total}
          isOpen={this.state.isCartOpen}
          closeCart={this.closeCart}
          updateQuantity={this.updateQuantity}
          removeFromCart={this.removeFromCart}
        />
        
        <div className="main-content">
          <Routes>
            <Route path="/product/:productId" element={<ProductPage addToCart={this.addToCart} />} />
            <Route path="/" element={
              <>
                <h2 className="category-title">{this.state.selectedCategory.charAt(0).toUpperCase() + this.state.selectedCategory.slice(1)}</h2>
                <ProductList 
                  addToCart={this.addToCart} // Pass the addToCart function to ProductList
                  selectedCategory={this.state.selectedCategory} 
                  onSelectCategory={this.handleSelectCategory} 
                  cartItems={this.state.cartItems} // Pass cartItems to ProductList
                  updateQuantity={this.updateQuantity} // Pass the updateQuantity function
                  removeFromCart={this.removeFromCart} // Pass the removeFromCart function
                />
              </>
            } />
          </Routes>
        </div>
      </div>
    );
  }
}

export default App;