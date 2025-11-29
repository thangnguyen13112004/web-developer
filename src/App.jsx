import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Outlet, Link } from 'react-router-dom';
// 1. THÊM IMPORT CÒN THIẾU (ĐÂY LÀ LỖI CHÍNH)
import './base.css';
import './main.css';
import "./Chatbox.css";


import Header from './components/Header.jsx';
// 2. XÓA 2 IMPORT THỪA NÀY (vì HomePage đã quản lý chúng)
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import HomePage from './components/HomePage.jsx';
import GioHang from './components/GioHang.jsx';
import DatHang from './components/Dathang.jsx';
import UserInfo from './components/UserInfo.jsx';
import Chatbox from './components/Chatbox.jsx'; // <--- Import Chatbox
import ProductDetail from './components/ProductDetail.jsx'; // Import trang mới


// Import Admin Components
import Dashboard from './admin/components/Dashboard.jsx'; // Đảm bảo đúng đường dẫn file vừa tạo
import AdminLayout from './admin/layouts/AdminLayout.jsx';
import ProductList from './admin/products/ProductList.jsx';
import ProductCreate from './admin/products/ProductCreate.jsx';
import ProductEdit from './admin/products/ProductEdit';
import WarehouseImport from './admin/Import/WarehouseImport.jsx'; 
import LotList from './admin/warehouse/LotList.jsx';
import OrderList from './admin/orders/OrderList.jsx';
import CustomerProfile from './components/CustomerProfile.jsx'; // Đảm bảo đã import
import OrderDetail from './components/OrderDetail.jsx';
import UserLayout from './layouts/UserLayout.jsx'; // Import Layout vừa tạo
import ImportList from './admin/Import/ImportList.jsx';
import EmployeeList from './admin/components/EmployeeList.jsx';
import BackupRestore from './admin/configuration/BackupRestore.jsx';


// HÀM HELPER ĐỂ LẤY TOKEN
const getAuthToken = () => localStorage.getItem('authToken');

function App() {
  const location = useLocation(); // Dùng để kiểm tra URL hiện tại
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ DỮ LIỆU CHUNG ---
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --- LOGIC KIỂM TRA ROUTE ADMIN ---
  // Nếu đường dẫn bắt đầu bằng "/admin", biến này sẽ là true
  const isAdminRoute = location.pathname.startsWith('/admin');


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

  // SỬA LẠI LOGIC CHECK ADMIN (Thêm .toLowerCase() để chắc chắn)
  const isUserAdmin = (user) => {
      if (!user) return false;
      const role = user.role || '';
      
      // Cho phép Admin, Manager và cả Staff vào trang quản trị
      // (Nhưng Staff sẽ thấy ít menu hơn - xử lý ở Sidebar)
      return role === 'Admin' || role === 'Manager' || role === 'Staff';
  };

  const handleLoginSuccess = (user, token) => {
    console.log("Login Success Data:", user); // Log debug

    // Lưu vào localStorage TRƯỚC
    localStorage.setItem('appUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
    
    // Cập nhật State
    setCurrentUser(user);
    setShowAuthModal(false);
    
    // Xử lý chuyển hướng
    if (isUserAdmin(user)) {
        console.log("Redirecting to Admin...");
        // Dùng replace: true để không cho back lại trang login
        navigate('/admin', { replace: true }); 
    } else {
        console.log("Redirecting to Home...");
        fetchUserCart(); 
        navigate('/'); 
    }
  };

  // 6. Hàm xử lý ĐĂNG XUẤT (Sửa lại để xóa giỏ hàng)
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('appUser');
    setCurrentUser(null);
    setCart([]); // Xóa giỏ hàng khỏi state
    navigate('/');
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
      {/* HEADER KHÁCH HÀNG: 
          Chỉ hiển thị khi KHÔNG PHẢI trang Admin 
      */}
      {!isAdminRoute && (
        <Header 
            currentUser={currentUser} 
            cart={cart}
            onLoginClick={() => setShowAuthModal(true)}
            onLogout={handleLogout}
        />
      )}

      {/* ROUTING SYSTEM 
          Đây là phần quan trọng nhất để phân chia Admin và Client
      */}
      <div className={isAdminRoute ? "" : "flex-1"}> {/* Client cần flex-1 để đẩy footer xuống */}
        <Routes>
            
            {/* --- GROUP 1: CÁC ROUTE CỦA KHÁCH HÀNG --- */}
            <Route path="/" element={
                <HomePage 
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    onAddToCart={handleAddToCart}
                />
            } />
            
            <Route path="/gio-hang" element={
                <GioHang 
                    cart={cart}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    onRemoveItem={handleRemoveFromCart}
                />
            } />

            <Route path="/dat-hang" element={
                <DatHang 
                    cart={cart} 
                    currentUser={currentUser} 
                    // 👇 BỔ SUNG DÒNG NÀY
                    onOrderPlaced={fetchUserCart} 
                />
            } />

            <Route path="/tai-khoan" element={<UserLayout />}>
                {/* Route index: Mặc định vào /tai-khoan sẽ hiện CustomerProfile (Lịch sử)
                */}
                <Route index element={<CustomerProfile />} />
                
                {/* Route con: /tai-khoan/don-hang/:id sẽ hiện OrderDetail
                    nhưng VẪN GIỮ sidebar của UserLayout
                */}
                <Route path="don-hang/:id" element={<OrderDetail />} />
            </Route>

            {/* Route Thông tin cá nhân: Dùng chung UserLayout để có Sidebar */}
            <Route path="/thong-tin" element={<UserLayout />}>
                <Route index element={<UserInfo />} />
            </Route>

            {/* ROUTE CHI TIẾT SẢN PHẨM */}
            <Route path="/san-pham/:id" element={<ProductDetail onAddToCart={handleAddToCart} />} />


            {/* --- GROUP 2: CÁC ROUTE CỦA ADMIN --- */}
            {/* Cấu trúc lồng nhau (Nested Routes):
               - /admin : Load AdminLayout (chứa Sidebar, Header Admin)
               - Các route con sẽ hiển thị bên trong <Outlet /> của AdminLayout
            */}
            <Route path="/admin" element={<AdminLayout />}>

                {/* Route Mặc định (Tổng quan) */}
                <Route index element={<Dashboard />} />

                {/* Route Báo cáo (cũng trỏ về Dashboard hoặc tạo trang riêng sau này) */}
                <Route path="reports" element={<Dashboard />} />
                
                {/* Quản lý sản phẩm */}
                <Route path="products" element={<ProductList />} />
                <Route path="products/create" element={<ProductCreate />} />
                <Route path="products/edit/:id" element={<ProductEdit />} />

                {/* Route nhập kho mới */}
                <Route path="warehouse/import" element={<WarehouseImport />} />

                {/* Route quản lý lô thuốc */}
                <Route path="warehouse/lots" element={<LotList />} />

                {/* ĐÃ THÊM: Route quản lý đơn hàng */}
                <Route path="orders" element={<OrderList />} />

                // 2. Trong Route Admin
                <Route path="warehouse/receipts" element={<ImportList />} />

                {/* Route Quản lý nhân viên (Route này trùng với link trong sidebar) */}
                <Route path="customers" element={<EmployeeList />} />

                <Route path="configuration/backup" element={<BackupRestore />} />

                
                
                {/* Bạn có thể thêm các route admin khác ở đây */}
                {/* <Route path="categories" element={<CategoryList />} /> */}
            </Route>

        </Routes>
      </div>

      {/* FOOTER KHÁCH HÀNG: 
          Chỉ hiển thị khi KHÔNG PHẢI trang Admin 
      */}
      {!isAdminRoute && <Footer />}


      {/* MODAL AUTH DÙNG CHUNG */}
      <AuthModal 
        show={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {!isAdminRoute && <Chatbox />}
    </div>
  );
}

export default App;