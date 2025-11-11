import React from 'react';
import CategorySidebar from './CategorySidebar.jsx';
import ProductList from './ProductList.jsx';

// Trang này nhận các props từ App.jsx và chuyển xuống cho con
function HomePage({ selectedCategory, onCategoryChange, onAddToCart }) {
  return (
    <div className="app__container">
      <div className="grid">
        <div className="grid__row app__content">
          
          <div className="grid__column-2">
            <CategorySidebar 
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
            />
          </div>

          <ProductList 
            selectedCategory={selectedCategory} 
            onAddToCart={onAddToCart}
          />

        </div>
      </div>
    </div>
  );
}

export default HomePage;