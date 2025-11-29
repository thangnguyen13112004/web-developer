using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacity.DTOs.Admin;
using Pharmacity.Models;

namespace Pharmacity.Controllers.Admin
{
    [Route("api/admin/orders")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;

        public OrdersController(DB_QuanLyNhaThuoc2Context context)
        {
            _context = context;
        }

        // 1. LẤY DANH SÁCH ĐƠN HÀNG
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderReadDto>>> GetAllOrders()
        {
            var orders = await _context.Donhangs
                .Include(d => d.MakhNavigation)
                .Include(d => d.Thanhtoans) // Include bảng thanh toán
                .ThenInclude(tt => tt.ManvNavigation) 
                .OrderByDescending(d => d.Ngaydat)
                .Select(d => new OrderReadDto
                {
                    MaDH = d.Madh,
                    TenKhachHang = d.MakhNavigation.Hoten,
                    SDT = d.MakhNavigation.Sdt,
                    NgayDat = d.Ngaydat ?? DateTime.Now,
                    TongTien = d.Tongtien,
                    TrangThaiDH = d.Trangthai ?? "Chờ xử lý",

                    // Lấy trạng thái thanh toán mới nhất (nếu có)
                    TrangThaiTT = d.Thanhtoans.Any() ? d.Thanhtoans.OrderByDescending(t => t.Ngaytt).First().Trangthai : "Chưa thanh toán",
                    PhuongThucTT = d.Thanhtoans.Any() ? d.Thanhtoans.OrderByDescending(t => t.Ngaytt).First().Phuongthuc : "-",

                    // Giả sử lấy tên người thu ngân từ bảng thanh toán
                    NhanVienXuLy = d.Thanhtoans.Any() ? d.Thanhtoans.First().ManvNavigation.Hoten : "Chưa phân công"
                })
                .ToListAsync();

            return Ok(orders);
        }

        // 2. CẬP NHẬT TRẠNG THÁI (LOGIC NGHIỆP VỤ MỚI)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto model)
        {
            var order = await _context.Donhangs
                .Include(d => d.Chitietdonhangs) // Include để hoàn kho
                .Include(d => d.Thanhtoans)      // Include để update thanh toán
                .FirstOrDefaultAsync(d => d.Madh == id);

            if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng" });

            string oldStatus = order.Trangthai;
            string newStatus = model.TrangThaiMoi;

            // --- VALIDATE ---
            if (oldStatus == "Đã hủy") return BadRequest(new { message = "Đơn hàng đã hủy không thể thay đổi." });
            if (oldStatus == "Hoàn tất") return BadRequest(new { message = "Đơn hàng đã hoàn tất không thể thay đổi." });

            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    // --- LOGIC 1: HOÀN TẤT ĐƠN HÀNG ---
                    if (newStatus == "Hoàn tất")
                    {
                        // Nếu là COD và chưa thanh toán -> Cập nhật thành Đã thanh toán
                        var payment = order.Thanhtoans.OrderByDescending(t => t.Ngaytt).FirstOrDefault();
                        if (payment != null && payment.Phuongthuc == "cod" && payment.Trangthai != "Đã thanh toán")
                        {
                            payment.Trangthai = "Đã thanh toán";
                            // payment.Ngaytt = DateTime.Now; // Cập nhật ngày thực thu tiền
                        }
                    }

                    // --- LOGIC 2: HỦY ĐƠN HÀNG (HOÀN KHO) ---
                    if (newStatus == "Đã hủy")
                    {
                        // Duyệt qua chi tiết đơn hàng để cộng lại tồn kho
                        foreach (var item in order.Chitietdonhangs)
                        {
                            // 1. Cộng lại tồn kho (Giả định kho mặc định là 1 hoặc logic theo lô)
                            var tonKho = await _context.Tonkhos
                                .FirstOrDefaultAsync(tk => tk.Malo == item.Malo && tk.Makho == 1);
                            // Lưu ý: Cần đảm bảo logic Makho đúng với lúc xuất kho

                            if (tonKho != null)
                            {
                                tonKho.Soluongton += item.Soluong;
                            }
                            else
                            {
                                // Nếu chưa có dòng tồn kho (hiếm), tạo mới
                                _context.Tonkhos.Add(new Tonkho { Malo = item.Malo, Makho = 1, Soluongton = item.Soluong });
                            }

                            // 2. Trigger trong SQL sẽ tự động cập nhật lại tổng tồn bảng 'Thuoc'
                            // Nếu không dùng Trigger, phải code tay cập nhật bảng Thuoc ở đây.
                        }
                    }

                    // Cập nhật trạng thái đơn
                    order.Trangthai = newStatus;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new { message = $"Đã cập nhật đơn hàng sang '{newStatus}'" });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = "Lỗi xử lý: " + ex.Message });
                }
            }
        }

        // [DELETE] Xóa đơn hàng (Đã sửa logic Apdungvoucher)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Donhangs
                .Include(d => d.Chitietdonhangs)
                .Include(d => d.Thanhtoans)
                .Include(d => d.Mavouchers) // <--- QUAN TRỌNG: Load danh sách Voucher liên quan
                .FirstOrDefaultAsync(d => d.Madh == id);

            if (order == null) return NotFound(new { message = "Đơn hàng không tồn tại" });

            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    // 1. Hoàn kho (như cũ)
                    if (order.Trangthai != "Đã hủy" && order.Trangthai != "GioHang")
                    {
                        foreach (var item in order.Chitietdonhangs)
                        {
                            var tonKho = await _context.Tonkhos
                                .FirstOrDefaultAsync(tk => tk.Malo == item.Malo && tk.Makho == 1);
                            if (tonKho != null) tonKho.Soluongton += item.Soluong;
                        }
                    }

                    // 2. Xóa các bảng phụ thuộc

                    // A. XÓA LIÊN KẾT VOUCHER (Cách mới)
                    // Vì không có bảng Apdungvoucher, ta chỉ cần Clear list Voucher trong đơn hàng
                    // EF Core sẽ tự động xóa dòng trong bảng trung gian SQL khi SaveChanges
                    order.Mavouchers.Clear();

                    // B. Xóa thanh toán
                    if (order.Thanhtoans != null)
                        _context.Thanhtoans.RemoveRange(order.Thanhtoans);

                    // C. Xóa chi tiết đơn hàng
                    if (order.Chitietdonhangs != null)
                        _context.Chitietdonhangs.RemoveRange(order.Chitietdonhangs);

                    // 3. Xóa đơn hàng
                    _context.Donhangs.Remove(order);

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new { message = "Đã xóa đơn hàng vĩnh viễn." });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = "Lỗi xóa đơn: " + ex.Message });
                }
            }
        }
    }
}
