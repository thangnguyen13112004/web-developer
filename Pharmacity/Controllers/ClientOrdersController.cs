using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pharmacity.DTOs;
using Pharmacity.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Pharmacity.Controllers
{
    [Route("api/client/orders")]
    [ApiController]
    [Authorize]
    public class ClientOrdersController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;

        public ClientOrdersController(DB_QuanLyNhaThuoc2Context context)
        {
            _context = context;
        }

        // Hàm lấy ID user từ Token (Reuse logic cũ)
        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (claim == null) throw new Exception("Unauthorized");
            return int.Parse(claim.Value);
        }

        // GET: api/client/orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientOrderDto>>> GetMyOrders()
        {
            try
            {
                int userId = GetCurrentUserId();

                var orders = await _context.Donhangs
                    .Where(d => d.Makh == userId && d.Trangthai != "GioHang") // Lấy đơn đã đặt, ko lấy giỏ
                    .Include(d => d.Chitietdonhangs)
                        .ThenInclude(ct => ct.MaloNavigation)
                            .ThenInclude(l => l.MathuocNavigation) // Join sâu để lấy tên & ảnh thuốc
                    .OrderByDescending(d => d.Ngaydat) // Mới nhất lên đầu
                    .Select(d => new ClientOrderDto
                    {
                        MaDH = d.Madh,
                        NgayDat = d.Ngaydat ?? DateTime.Now,
                        TongTien = d.Tongtien,
                        TrangThai = d.Trangthai ?? "Chờ xử lý",
                        ChiTiet = d.Chitietdonhangs.Select(ct => new ClientOrderItemDto
                        {
                            TenThuoc = ct.MaloNavigation.MathuocNavigation.Tenthuoc,
                            HinhAnh = ct.MaloNavigation.MathuocNavigation.Hinhanh,
                            DonViTinh = ct.MaloNavigation.MathuocNavigation.Donvitinh,
                            SoLuong = ct.Soluong,
                            DonGia = ct.Dongia,
                            ThanhTien = (ct.Dongia * ct.Soluong)
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [HttpGet("{id}")] // API: GET /api/client/orders/5
        public async Task<ActionResult<ClientOrderDetailDto>> GetOrderDetail(int id)
        {
            try
            {
                int userId = GetCurrentUserId();

                var order = await _context.Donhangs
                    .Include(d => d.Chitietdonhangs)
                        .ThenInclude(ct => ct.MaloNavigation)
                            .ThenInclude(l => l.MathuocNavigation)
                    // Giả định bạn đã có quan hệ MadcNavigation trong Models (do DatHangController đã dùng)
                    // Nếu chưa có navigation property, bạn cần join thủ công. Ở đây tôi dùng join thủ công cho chắc chắn.
                    .Where(d => d.Madh == id && d.Makh == userId)
                    .FirstOrDefaultAsync();

                if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng" });

                // Lấy thông tin địa chỉ thủ công (để tránh lỗi nếu chưa config FK trong Context)
                var address = await _context.SoDiaChis.FindAsync(order.Madc);

                // Lấy thông tin thanh toán
                var payment = await _context.Thanhtoans.FirstOrDefaultAsync(t => t.Madh == order.Madh);

                // Map sang DTO
                var result = new ClientOrderDetailDto
                {
                    MaDH = order.Madh,
                    NgayDat = order.Ngaydat ?? DateTime.Now,
                    TrangThai = order.Trangthai,

                    // Map Địa chỉ
                    NguoiNhan = address != null ? address.HotenNhan : "N/A",
                    SDT = address != null ? address.SdtNhan : "N/A",
                    DiaChiGiaoHang = address != null
                        ? $"{address.SonhaDuong}, {address.Phuongxa}, {address.Quanhuyen}, {address.Tinhthanh}"
                        : "Địa chỉ đã bị xóa",

                    // Map Sản phẩm
                    ChiTiet = order.Chitietdonhangs.Select(ct => new ClientOrderItemDto
                    {
                        TenThuoc = ct.MaloNavigation.MathuocNavigation.Tenthuoc,
                        HinhAnh = ct.MaloNavigation.MathuocNavigation.Hinhanh,
                        DonViTinh = ct.MaloNavigation.MathuocNavigation.Donvitinh,
                        SoLuong = ct.Soluong,
                        DonGia = ct.Dongia,
                        ThanhTien = ct.Dongia * ct.Soluong
                    }).ToList(),

                    // Map Thanh toán
                    TienHang = order.Chitietdonhangs.Sum(ct => ct.Dongia * ct.Soluong),
                    PhiVanChuyen = 0, // Logic phí vận chuyển của bạn (hiện tại set cứng 0)
                    TongTien = order.Tongtien,
                    PhuongThucThanhToan = payment != null ? payment.Phuongthuc : "COD"
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            int userId = GetCurrentUserId();

            var order = await _context.Donhangs
                .Include(d => d.Chitietdonhangs)
                .FirstOrDefaultAsync(d => d.Madh == id && d.Makh == userId);

            if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng" });

            // 1. Kiểm tra điều kiện hủy
            if (order.Trangthai != "Chờ xử lý" && order.Trangthai != "Đang xử lý")
            {
                return BadRequest(new { message = "Không thể hủy đơn hàng khi đã đóng gói hoặc đang giao." });
            }

            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    // 2. Thực hiện hoàn kho (Logic giống Admin)
                    foreach (var item in order.Chitietdonhangs)
                    {
                        var tonKho = await _context.Tonkhos.FirstOrDefaultAsync(tk => tk.Malo == item.Malo && tk.Makho == 1);
                        if (tonKho != null) tonKho.Soluongton += item.Soluong;
                    }

                    // 3. Cập nhật trạng thái
                    order.Trangthai = "Đã hủy";

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new { message = "Hủy đơn hàng thành công, đã hoàn lại số lượng tồn kho." });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = ex.Message });
                }
            }
        }
    }
}
