
import React from 'react';
import { Link } from 'react-router-dom'; 
import './CategoryBar.css'; 

const categories = ['all', 'tech', 'clothes']; 

const CategoryBar = ({ selectedCategory, onSelectCategory }) => {
  const handleCategorySelect = (category) => {
    onSelectCategory(category); 
  };

  return (
    <div className="category-bar" role="navigation" aria-label="Product categories">
      {categories.map(category => (
        <Link
          key={category}
          to={`/${category}`} 
          data-testid={selectedCategory === category ? 'active-category-link' : 'category-link'} 
          className={`category-link ${selectedCategory === category ? 'active' : ''}`}
          onClick={() => handleCategorySelect(category)} 
          aria-pressed={selectedCategory === category} 
        >
          {category.charAt(0).toUpperCase() + category.slice(1)} {}
        </Link>
      ))}
    </div>
  );
};

export default CategoryBar;