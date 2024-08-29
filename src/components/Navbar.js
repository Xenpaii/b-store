import React from 'react';
import { Link } from 'react-router-dom'; 
import './CategoryBar.css'; 
import CategoryBar from './CategoryBar'; 
import logo from '../images/website logo.png'; 

class Navbar extends React.Component {
  render() {
    const { toggleCart, cartCount, selectedCategory, onSelectCategory } = this.props; 

    return (
      <nav className="navbar"> 
        <div className="navbar-content">
          <div className="category-bar">
            <CategoryBar 
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory} 
            />
          </div>
          <Link to="/" className="navbar-logo"> 
            <img src={logo} alt="Logo" className="navbar-logo" />
          </Link>
          <div className="cart-button" data-testid="cart-btn" onClick={toggleCart}>
            <span className="cart-icon" role="img" aria-label="cart">🛒</span> 
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;