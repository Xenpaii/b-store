// src/components/CategoryBar.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './CategoryBar.css'; 

const categories = ['all', 'tech', 'clothes']; // Original categories

const CategoryBar = ({ selectedCategory, onSelectCategory }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleCategorySelect = (category) => {
    onSelectCategory(category); // Update the selected category
    navigate('/'); // Redirect to the ProductList (home page)
  };

  return (
    <div className="category-bar" role="navigation" aria-label="Product categories">
      {categories.map(category => (
        <button
          key={category}
          data-testid={selectedCategory === category ? 'active-category-link' : 'category-link'} // Set data-testid
          className={`category-link ${selectedCategory === category ? 'active' : ''}`}
          onClick={() => handleCategorySelect(category)} // Use the new handler
          aria-pressed={selectedCategory === category} // Accessibility improvement
        >
          {category.charAt(0).toUpperCase() + category.slice(1)} {/* Capitalize the first letter */}
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;