// src/components/Navbar.js
import React from 'react';
import './CategoryBar.css'; 
import CategoryBar from './CategoryBar'; // Import CategoryBar
import logo from '../images/website logo.png'; // Import your logo image

class Navbar extends React.Component {
  render() {
    const { toggleCart, cartCount, selectedCategory, onSelectCategory } = this.props; 

    return (
      <nav className={`navbar ${this.props.theme}`}> {/* Use theme prop to set class */}
        <div className="navbar-content">
          <div className="category-bar">
            <CategoryBar 
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory} 
            />
          </div>
          <img src={logo} alt="Logo" className="navbar-logo" /> {/* Add logo image */}
          <div className="cart-button" data-testid="cart-btn" onClick={toggleCart}>
            <span className="cart-icon" role="img" aria-label="cart">🛒</span> {/* Cart emoji */}
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>} {/* Badge for cart count */}
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;