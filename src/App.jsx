import React, { useState, useEffect } from 'react';
// 1. THÊM IMPORT CÒN THIẾU (ĐÂY LÀ LỖI CHÍNH)
import { Routes, Route } from 'react-router-dom'; 
import './base.css';
import './main.css';

import Header from './components/Header.jsx';
// 2. XÓA 2 IMPORT THỪA NÀY (vì HomePage đã quản lý chúng)
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import HomePage from './components/HomePage.jsx';
import GioHang from './components/GioHang.jsx';

// HÀM HELPER ĐỂ LẤY TOKEN
const getAuthToken = () => localStorage.getItem('authToken');

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // 1. State "chủ" quản lý người dùng
  const [currentUser, setCurrentUser] = useState(null);

  // 2. STATE "CHỦ" QUẢN LÝ GIỎ HÀNG
  const [cart, setCart] = useState([]);

  // 3. Hàm fetch giỏ hàng từ API
  const fetchUserCart = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5223/api/GioHang', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else {
        console.error("Lỗi khi tải giỏ hàng");
        setCart([]); // Xóa giỏ hàng nếu token hết hạn
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Kiểm tra localStorage VÀ fetch giỏ hàng khi App mới tải (Sửa lại)
  useEffect(() => {
    try {
      const userString = localStorage.getItem('appUser');
      if (userString) {
        const user = JSON.parse(userString); // Phải parse user
        setCurrentUser(user);
        
        // Ngay khi biết user, fetch giỏ hàng của họ
        fetchUserCart(); 
      }
    } catch (e) {
      console.error("Lỗi khi đọc localStorage:", e);
      localStorage.clear();
    }
  }, []); // [] = Chỉ chạy 1 lần

  // 5. Hàm được gọi từ AuthModal (Sửa lại để fetch giỏ hàng)
  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    localStorage.setItem('appUser', JSON.stringify(user));
    localStorage.setItem('authToken', token); // LƯU TOKEN
    setShowAuthModal(false);
    
    fetchUserCart(); // Fetch giỏ hàng ngay sau khi đăng nhập
  };

  // 6. Hàm xử lý ĐĂNG XUẤT (Sửa lại để xóa giỏ hàng)
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('appUser');
    setCurrentUser(null);
    setCart([]); // Xóa giỏ hàng khỏi state
  };

  // 7. HÀM XỬ LÝ "THÊM VÀO GIỎ" (MỚI)
  const handleAddToCart = async (mathuoc, soluong) => {
    if (!currentUser) {
      setShowAuthModal(true); // Nếu chưa đăng nhập, bắt đăng nhập
      return;
    }
    
    const token = getAuthToken();
    try {
      const res = await fetch('http://localhost:5223/api/GioHang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ maThuoc: mathuoc, soLuong: soluong })
      });

      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart); // Cập nhật state giỏ hàng (QUAN TRỌNG)
        // (Tùy chọn: Hiện thông báo "Thêm thành công")
      } else {
        const err = await res.json();
        alert(`Lỗi khi thêm vào giỏ: ${err.message}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 8. (MỚI) HÀM CẬP NHẬT SỐ LƯNG (Cần API)
  const handleUpdateCartQuantity = async(malo, newQuantity) => {
    // Logic < 1 sẽ được API xử lý (nó sẽ tự gọi hàm Xóa)
    const token = getAuthToken();
    if (!token) return;

    try {
        const res = await fetch(`http://localhost:5223/api/GioHang/${malo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ soLuong: newQuantity })
        });

        if (res.ok) {
            fetchUserCart(); // <-- Tải lại giỏ hàng sau khi thành công
        } else {
            alert("Lỗi khi cập nhật số lượng.");
        }
    } catch (e) {
        console.error("Lỗi cập nhật API:", e);
    }
  };

  // 9. (MỚI) HÀM XÓA SẢN PHẨM (Cần API)
  const handleRemoveFromCart = async (malo) => {
    const token = getAuthToken();
    if (!token) return;

    try {
        const res = await fetch(`http://localhost:5223/api/GioHang/${malo}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            fetchUserCart(); // <-- Tải lại giỏ hàng sau khi thành công
        } else {
            alert("Lỗi khi xóa sản phẩm.");
        }
    } catch (e) {
        console.error("Lỗi xóa API:", e);
    }
  };

  // 4. SỬA LẠI HÀM RETURN ĐỂ DÙNG ROUTER
  return (
    <div className="app">
      
      {/* Header luôn hiển thị */}
      <Header 
        currentUser={currentUser} 
        cart={cart}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      {/* 5. VÙNG NỘI DUNG THAY ĐỔI */}
      <Routes>
        
        {/* Route 1: Trang chủ */}
        <Route 
          path="/" 
          element={
            <HomePage 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onAddToCart={handleAddToCart}
            />
          } 
        />
        
        {/* Route 2: Trang giỏ hàng */}
        <Route 
          path="/gio-hang" 
          element={
            <GioHang 
              cart={cart}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
            />
          } 
        />

      </Routes>

      <Footer />
      
      {/* 6. Truyền hàm xử lý đăng nhập xuống AuthModal */}
      <AuthModal 
        show={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;