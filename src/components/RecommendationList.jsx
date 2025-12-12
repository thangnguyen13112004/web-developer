import React, { useEffect, useState } from 'react';
import ProductItem from './ProductItem.jsx'; // Tái sử dụng component item cũ

const RecommendationList = ({ title, type, userId, cartItems, onAddToCart }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchRecs = async () => {
            let url = '';
            let method = 'GET';
            let body = null;

            if (type === 'personal' && userId) {
                url = `http://localhost:5223/api/recommendation/personal/${userId}`;
            } else if (type === 'trending') {
                url = `http://localhost:5223/api/recommendation/trending`;
            } else if (type === 'cart' && cartItems && cartItems.length > 0) {
                url = `http://localhost:5223/api/recommendation/cart-related`;
                method = 'POST';
                // Lấy danh sách ID thuốc trong giỏ
                const ids = cartItems.map(item => item.mathuoc);
                body = JSON.stringify(ids);
            }

            if (!url) return;

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: body
                });
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Lỗi lấy gợi ý:", error);
            }
        };

        fetchRecs();
    }, [type, userId, cartItems]); // Re-run khi giỏ hàng hoặc user thay đổi

    if (products.length === 0) return null;

    return (
        <div className="grid__full-width" style={{marginTop: '30px'}}>
            <div className="product-proposal">
                <div className="product-proposal__header" style={{
                    backgroundColor: '#fff', padding: '15px', borderRadius: '4px', marginBottom: '10px',
                    borderBottom: '4px solid #1B51A6'
                }}>
                    <h3 style={{margin: 0, color: '#1B51A6', textTransform: 'uppercase', fontSize: '1.6rem'}}>
                        {type === 'personal' && <i className="fa-solid fa-heart" style={{marginRight: '10px'}}></i>}
                        {type === 'trending' && <i className="fa-solid fa-fire" style={{marginRight: '10px'}}></i>}
                        {type === 'cart' && <i className="fa-solid fa-cart-plus" style={{marginRight: '10px'}}></i>}
                        {title}
                    </h3>
                </div>
                
                <div className="grid__row">
                    {products.map(product => (
                        <ProductItem 
                            key={product.mathuoc} 
                            product={product} 
                            // --- SỬA LỖI TẠI ĐÂY ---
                            // Truyền hàm onAddToCart xuống cho ProductItem
                            // Lưu ý: Kiểm tra xem bên ProductItem prop tên là onAddToCart hay onProductSelect
                            // Dựa vào code ProductItem bạn từng gửi, nó là onProductSelect
                            onProductSelect={onAddToCart} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecommendationList;