import React, { useState, useEffect } from 'react';

function CategorySidebar({ selectedCategory, onCategoryChange }) {
    
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // SỬA LẠI ĐƯỜNG DẪN Ở ĐÂY
        fetch('http://localhost:5223/api/LoaiThuoc') 
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                if (data.length > 0 && !selectedCategory) {
                    onCategoryChange(data[0].maloai); 
                }
            })
            .catch(err => console.error("Lỗi khi tải danh mục:", err));
    }, []); // Chỉ chạy 1 lần

    return (
        <nav className="category">
            {/* ... (Phần JSX giữ nguyên) ... */}
            <h3 className="category__heading">
                <i className="category__heading-icon fa-solid fa-list"></i> 
                Danh mục
            </h3>
    
            <ul className="category-list">
                {categories.map(category => (
                    <li 
                        key={category.maloai} 
                        className={`category-item ${selectedCategory === category.maloai ? 'category-item--active' : ''}`}
                        onClick={() => onCategoryChange(category.maloai)}
                    >
                        <a href="#" className="category-item__link">{category.tenloai}</a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default CategorySidebar;