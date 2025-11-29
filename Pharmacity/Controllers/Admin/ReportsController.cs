using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pharmacity.Models;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics; // Dùng để đo thời gian

using Microsoft.Extensions.Caching.Distributed; // Import thư viện
using System.Text.Json;
using Pharmacity.DTOs.Admin; // Import JSON

namespace Pharmacity.Controllers.Admin
{
    [Route("api/admin/reports")]
    [ApiController]
    [Authorize(Roles = "Admin, Quản lý cửa hàng")]
    public class ReportsController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;
        private readonly IDistributedCache _cache; // 1. Inject Cache

        public ReportsController(DB_QuanLyNhaThuoc2Context context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stopwatch = Stopwatch.StartNew(); // Bắt đầu bấm giờ
            string cacheKey = "admin_dashboard_stats";
            string source = "Database"; // Mặc định là DB

            // 1. Kiểm tra Redis
            string cachedData = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedData))
            {
                stopwatch.Stop();
                // Deserialize để lấy object cũ
                var cachedObj = JsonSerializer.Deserialize<DashboardData>(cachedData);

                // Gán lại thông tin debug để trả về client
                cachedObj.Source = "Redis Cache 🚀";
                cachedObj.ProcessingTime = $"{stopwatch.ElapsedMilliseconds} ms";

                return Ok(cachedObj);
            }

            // 2. Nếu Cache Miss -> Query Database (Giữ nguyên logic cũ của bạn)
            var today = DateTime.Now;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            // 1. Tổng doanh thu (Chỉ tính đơn Hoàn tất)
            var totalRevenue = await _context.Donhangs
                .Where(d => d.Trangthai == "Hoàn tất")
                .SumAsync(d => d.Tongtien);

            // 2. Đơn hàng đang xử lý (Chưa hoàn tất và chưa hủy)
            var activeOrders = await _context.Donhangs
                .CountAsync(d => d.Trangthai != "Hoàn tất" && d.Trangthai != "Đã hủy" && d.Trangthai != "GioHang");

            // 3. Thống kê sản phẩm & Sắp hết hàng (< 20)
            var totalProducts = await _context.Thuocs.CountAsync();
            var lowStockProducts = await _context.Thuocs.CountAsync(t => t.Soluongton < 20);

            // 4. Tổng khách hàng (Thay cho Bảo hành vì DB không có bảng Bảo hành)
            var totalCustomers = await _context.Khachhangs.CountAsync();

            // 5. Biểu đồ doanh thu 6 tháng gần nhất
            var monthlyRevenue = new List<double>();
            var monthLabels = new List<string>();

            for (int i = 5; i >= 0; i--)
            {
                var month = today.AddMonths(-i);
                var revenue = await _context.Donhangs
                    .Where(d => d.Trangthai == "Hoàn tất" && d.Ngaydat.HasValue &&
                                d.Ngaydat.Value.Month == month.Month &&
                                d.Ngaydat.Value.Year == month.Year)
                    .SumAsync(d => d.Tongtien);

                monthlyRevenue.Add(revenue);
                monthLabels.Add($"T{month.Month}");
            }

            // 6. Biểu đồ Danh mục (Top 4 danh mục bán chạy nhất)
            // Cần join bảng ChiTietDonHang -> Thuoc -> LoaiThuoc
            var categoryStats = await _context.Chitietdonhangs
                .Include(ct => ct.MaloNavigation.MathuocNavigation.MaloaiNavigation)
                .Where(ct => ct.MaloNavigation.MathuocNavigation.MaloaiNavigation != null)
                .GroupBy(ct => ct.MaloNavigation.MathuocNavigation.MaloaiNavigation.Tenloai)
                .Select(g => new {
                    Category = g.Key,
                    Revenue = g.Sum(x => x.Thanhtien ?? 0)
                })
                .OrderByDescending(x => x.Revenue)
                .Take(4)
                .ToListAsync();

            // 3. Tạo object kết quả (Sử dụng class DTO bên dưới để dễ Serialize)
            var result = new DashboardData
            {
                TotalRevenue = totalRevenue,
                ActiveOrders = activeOrders,
                ProductStats = new ProductStats { Total = totalProducts, LowStock = lowStockProducts },
                TotalCustomers = totalCustomers,
                ChartData = new ChartData
                {
                    Revenue = monthlyRevenue,
                    Labels = monthLabels,
                    Categories = categoryStats.Select(c => c.Category).ToList(),
                    CategoryRevenue = categoryStats.Select(c => c.Revenue).ToList()
                },
                // Thông tin Cache sẽ được gán sau khi lấy ra
                Source = "Database (SQL Server) 🐢",
                ProcessingTime = ""
            };

            // 4. Lưu vào Redis
            var options = new DistributedCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10));
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(result), options);

            stopwatch.Stop();
            result.ProcessingTime = $"{stopwatch.ElapsedMilliseconds} ms"; // Gán thời gian thực tế của lần query DB này

            return Ok(result);
        }
    }
}
