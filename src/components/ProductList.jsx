import React, { useState, useEffect } from 'react';
import ProductItem from './ProductItem.jsx';
import ProductModal from './ProductModal.jsx';

// 1. Nhận prop `selectedCategory` từ App.jsx
function ProductList({ selectedCategory, onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    
    // Các state lọc khác (giữ nguyên)
    const [sortBy, setSortBy] = useState('moi-nhat');
    const [priceSort, setPriceSort] = useState(null);

    // useEffect (Giữ nguyên)
    useEffect(() => {
        let apiUrl = `http://localhost:5223/api/Thuoc?sortBy=${sortBy}`;
        if (selectedCategory) {
            apiUrl += `&maloai=${selectedCategory}`;
        }
        if (priceSort) {
            apiUrl += `&priceSort=${priceSort}`;
        }
        fetch(apiUrl)
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error("Lỗi khi tải sản phẩm:", err));
    }, [sortBy, priceSort, selectedCategory]); 

    return (
        <div className="grid__column-10">
            
           
            <div className="home-filter">
                <span className="home-filter__label">Sắp xếp theo</span>
                
                {/* Thêm onClick để gọi hàm setSortBy.
                  Thêm logic className để tự động đổi màu nút khi active.
                */}
                <button 
                    className={`home-filter__btn btn_css ${sortBy === 'pho-bien' ? 'btn--primary_css' : ''}`}
                    onClick={() => setSortBy('pho-bien')}
                >
                    Phổ biến
                </button>
                <button 
                    className={`home-filter__btn btn_css ${sortBy === 'moi-nhat' ? 'btn--primary_css' : ''}`}
                    onClick={() => setSortBy('moi-nhat')}
                >
                    Mới nhất
                </button>
                <button 
                    className={`home-filter__btn btn_css ${sortBy === 'ban-chay' ? 'btn--primary_css' : ''}`}
                    onClick={() => setSortBy('ban-chay')}
                >
                    Bán chạy
                </button>

                {/* Dropdown giá */}
                <div className="select-input">
                    <span className="select-input__label">
                        {/* Hiển thị giá trị đã chọn */}
                        {priceSort === 'thap-den-cao' ? 'Giá: Thấp đến cao' : 
                         priceSort === 'cao-den-thap' ? 'Giá: Cao đến thấp' : 'Giá'}
                    </span>
                    <i className="select-input__incon fa-solid fa-chevron-down"></i>

                    <ul className="select-input__list">
                        <li className="select-input__item" onClick={() => setPriceSort('thap-den-cao')}>
                            <a href="#" className="select-input__link">Giá: Thấp đến cao</a>
                        </li>
                        <li className="select-input__item" onClick={() => setPriceSort('cao-den-thap')}>
                            <a href="#" className="select-input__link">Giá: Cao đến thấp</a>
                        </li>
                    </ul>
                </div>

                {/* ... (Phần phân trang giữ nguyên) ... */}
                
            </div>

            <div className="home-product">
                <div className="grid__row">
                    {products.map(product => (
                        <ProductItem 
                            key={product.mathuoc} 
                            product={product} 
                            onProductSelect={setSelectedProductId} 
                        />
                    ))}
                </div>
            </div>
            
            <ProductModal 
                selectedProductId={selectedProductId} 
                onAddToCart={onAddToCart} // <-- TRUYỀN XUỐNG
            />
        </div>
    );
}

export default ProductList;