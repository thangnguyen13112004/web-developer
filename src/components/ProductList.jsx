import React, { useState, useEffect } from 'react';
import ProductItem from './ProductItem.jsx';
import ProductModal from './ProductModal.jsx';

// 1. Nhận prop `selectedCategory` từ App.jsx
function ProductList({ selectedCategory, onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    
    // --- STATE MỚI CHO PHÂN TRANG ---
    const [page, setPage] = useState(1);       // Trang hiện tại
    const [totalPages, setTotalPages] = useState(0); // Tổng số trang
    const pageSize = 10;                       // Số lượng item mỗi trang (khớp với Backend)

    const [sortBy, setSortBy] = useState('moi-nhat');
    const [priceSort, setPriceSort] = useState(null);

    // 1. Reset về trang 1 khi thay đổi Danh mục hoặc Sắp xếp
    useEffect(() => {
        setPage(1);
    }, [selectedCategory, sortBy, priceSort]);

    // 2. Gọi API (Phụ thuộc vào page, và các filter)
    useEffect(() => {
        let apiUrl = `http://localhost:5223/api/Thuoc?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}`;
        
        if (selectedCategory) {
            apiUrl += `&maloai=${selectedCategory}`;
        }
        if (priceSort) {
            apiUrl += `&priceSort=${priceSort}`;
        }

        fetch(apiUrl)
            .then(res => res.json())
            .then(resData => {
                // Lưu ý: Backend bây giờ trả về object { data, totalPages, ... }
                // chứ không phải mảng trực tiếp nữa
                setProducts(resData.data); 
                setTotalPages(resData.totalPages);
            })
            .catch(err => console.error("Lỗi khi tải sản phẩm:", err));
    }, [sortBy, priceSort, selectedCategory, page]); // Chạy lại khi page thay đổi

    // 3. Hàm xử lý chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            // Cuộn lên đầu danh sách sản phẩm cho trải nghiệm tốt hơn
            window.scrollTo({ top: 400, behavior: 'smooth' });
        }
    };

    // 4. Hàm render các số trang (1, 2, 3...)
    const renderPaginationItems = () => {
        let items = [];
        for (let i = 1; i <= totalPages; i++) {
            items.push(
                <li key={i} className={`pagination-item ${page === i ? 'pagination-item--active' : ''}`}>
                    <a 
                        href="#" 
                        className="pagination-item__link"
                        onClick={(e) => { e.preventDefault(); handlePageChange(i); }}
                    >
                        {i}
                    </a>
                </li>
            );
        }
        return items;
    };

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
                {/* Phân trang mini ở header (Option) */}
                <div className="home-filter__page">
                    <span className="home-filter__page-num">
                        <span className="home-filter__page-current">{page}</span>/{totalPages > 0 ? totalPages : 1}
                    </span>
                    <div className="home-filter__page-control">
                        <a href="#" className={`home-filter__page-btn ${page === 1 ? 'home-filter__page-btn--disable' : ''}`}
                           onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}>
                            <i className="home-filter__page-icon fa-solid fa-angle-left"></i>
                        </a>
                        <a href="#" className={`home-filter__page-btn ${page === totalPages ? 'home-filter__page-btn--disable' : ''}`}
                           onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}>
                            <i className="home-filter__page-icon fa-solid fa-angle-right"></i>
                        </a>
                    </div>
                </div>
                
            </div>

            {/* Danh sách sản phẩm */}
            <div className="home-product">
                <div className="grid__row">
                    {products.length > 0 ? products.map(product => (
                        <ProductItem 
                            key={product.mathuoc} 
                            product={product} 
                            onProductSelect={setSelectedProductId} 
                        />
                    )) : (
                        <div style={{width: '100%', textAlign: 'center', padding: '20px', fontSize: '1.4rem'}}>
                            Không tìm thấy sản phẩm nào.
                        </div>
                    )}
                </div>
            </div>

            {/* --- PHÂN TRANG FOOTER (ĐÃ THÊM LOGIC) --- */}
            {totalPages > 1 && (
                <ul className="pagination home-product__pagination">
                    <li className="pagination-item">
                        <a href="#" className="pagination-item__link"
                           onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}>
                            <i className="pagination-item__icon fa-solid fa-angle-left"></i>
                        </a>
                    </li>

                    {renderPaginationItems()}

                    <li className="pagination-item">
                        <a href="#" className="pagination-item__link"
                           onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}>
                            <i className="pagination-item__icon fa-solid fa-angle-right"></i>
                        </a>
                    </li>
                </ul>
            )}
            
            <ProductModal 
                selectedProductId={selectedProductId} 
                onAddToCart={onAddToCart} // <-- TRUYỀN XUỐNG
            />
        </div>
    );
}

export default ProductList;