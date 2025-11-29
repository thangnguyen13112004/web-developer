import React, { useEffect, useState } from 'react';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    Title, 
    Tooltip, 
    Legend, 
    ArcElement 
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';

// Đăng ký các component biểu đồ
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const res = await fetch('http://localhost:5223/api/admin/reports/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Lỗi tải dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-6 text-center">Đang tải dữ liệu tổng quan...</div>;
    if (!stats) return <div className="p-6 text-center">Không có dữ liệu.</div>;

    // Cấu hình biểu đồ Line (Doanh thu)
    const revenueChartData = {
        labels: stats.chartData.labels,
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: stats.chartData.revenue,
                borderColor: '#06b6d4', // Cyan-500
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    // Cấu hình biểu đồ Doughnut (Danh mục)
    const categoryChartData = {
        labels: stats.chartData.categories,
        datasets: [
            {
                data: stats.chartData.categoryRevenue,
                backgroundColor: ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
                borderWidth: 1,
            },
        ],
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="space-y-6 px-6 py-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tổng Quan</h1>
                    <p className="text-gray-500 text-sm md:text-base">Tổng quan hệ thống bán hàng của bạn</p>
                </div>
                
                {/* --- HIỂN THỊ TRẠNG THÁI REDIS (MỚI) --- */}
                <div className="text-right">
                    <div className={`text-sm font-bold px-3 py-1 rounded-full inline-flex items-center gap-2 
                        ${stats.source.includes('Redis') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {stats.source.includes('Redis') ? '⚡' : '💾'} {stats.source}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Thời gian xử lý: <strong>{stats.processingTime}</strong></p>
                </div>
                {/* ---------------------------------------- */}
            </div>

            {/* Stats Grid (Giống file index.blade.php) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                
                {/* 1. Tổng doanh thu */}
                <div className="bg-white shadow rounded-lg p-4 flex flex-col justify-between border-l-4 border-cyan-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-600">Tổng doanh thu</h3>
                        <DollarSign className="text-cyan-500" size={24} />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-bold text-cyan-600">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <TrendingUp size={12}/> Tích lũy toàn thời gian
                        </p>
                    </div>
                </div>

                {/* 2. Đơn hàng đang xử lý */}
                <div className="bg-white shadow rounded-lg p-4 flex flex-col justify-between border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-600">Đơn hàng đang xử lý</h3>
                        <ShoppingCart className="text-purple-500" size={24} />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-bold text-purple-600">{stats.activeOrders}</div>
                        <p className="text-xs text-gray-400 mt-1">Đơn hàng cần giải quyết ngay</p>
                    </div>
                </div>

                {/* 3. Sản phẩm */}
                <div className="bg-white shadow rounded-lg p-4 flex flex-col justify-between border-l-4 border-pink-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-600">Sản phẩm</h3>
                        <Package className="text-pink-500" size={24} />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-bold text-pink-600">{stats.productStats.total}</div>
                        <p className="text-xs text-gray-400 mt-1">
                            <span className="text-red-500 font-bold">{stats.productStats.lowStock}</span> sản phẩm sắp hết hàng
                        </p>
                    </div>
                </div>

                {/* 4. Khách hàng (Thay cho Bảo hành) */}
                <div className="bg-white shadow rounded-lg p-4 flex flex-col justify-between border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-600">Khách hàng</h3>
                        <Users className="text-blue-500" size={24} />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</div>
                        <p className="text-xs text-gray-400 mt-1">Tổng số người dùng đăng ký</p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                
                {/* Sales Overview (Chiếm 2 cột) */}
                <div className="bg-white shadow rounded-lg p-4 md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Tổng quan doanh thu 6 tháng</h3>
                    <div className="h-64">
                        <Line 
                            data={revenueChartData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true } }
                            }} 
                        />
                    </div>
                </div>

                {/* Sales by Category (Chiếm 1 cột) */}
                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Doanh thu theo danh mục</h3>
                    <div className="h-64 flex justify-center">
                        <Doughnut 
                            data={categoryChartData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { 
                                    legend: { position: 'bottom' } 
                                }
                            }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;