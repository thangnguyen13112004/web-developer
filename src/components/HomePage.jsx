import React from 'react';
import CategorySidebar from './CategorySidebar.jsx';
import ProductList from './ProductList.jsx';
import RecommendationList from './RecommendationList.jsx';

// Trang này nhận các props từ App.jsx và chuyển xuống cho con
function HomePage({ selectedCategory, onCategoryChange, onAddToCart, currentUser }) {
  // Lấy ID user nếu đã đăng nhập
  //const userId = currentUser ? currentUser.manv : null;
  const userId = currentUser ? currentUser.id : null;
  // Debug xem user có dữ liệu không
  console.log("Current User tại HomePage:", currentUser);
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

        {/* --- QUESTION 1: GỢI Ý RIÊNG (Đặt dưới ProductList) --- */}
        {userId && (
            <RecommendationList 
                title="Gợi ý riêng dành cho bạn" 
                type="personal" 
                userId={userId} 
            />
        )}

        {/* --- QUESTION 3: TOP BÁN CHẠY (Đặt dưới Q1) --- */}
        <RecommendationList 
            title="Top bán chạy toàn quốc" 
            type="trending" 
        />
      </div>
    </div>
  );
}

export default HomePage;