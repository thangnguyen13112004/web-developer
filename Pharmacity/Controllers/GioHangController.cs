using Microsoft.AspNetCore.Authorization; // <-- Quan trọng
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacity.DTOs;
using Pharmacity.Models;
using System.Security.Claims; // <-- Quan trọng

namespace Pharmacity.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GioHangController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;

        public GioHangController(DB_QuanLyNhaThuoc2Context context)
        {
            _context = context;
        }

        // --- SỬA LỖI 1: Lấy User ID linh hoạt hơn (chấp nhận cả "id" và "NameIdentifier") ---
        private int GetCurrentUserId()
        {
            // Thử lấy theo chuẩn NameIdentifier
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);

            // Nếu không có, thử lấy theo key "id" (do AuthController của bạn dùng key này)
            if (claim == null)
            {
                claim = User.FindFirst("id");
            }

            if (claim == null)
            {
                throw new Exception("Token không hợp lệ: Không tìm thấy User ID.");
            }
            return int.Parse(claim.Value);
        }

        private async Task UpdateCartTotal(int madh)
        {
            var cartHeader = await _context.Donhangs.FindAsync(madh);
            if (cartHeader != null)
            {
                // Tính tổng tiền dựa trên DB (vì Thanhtien là cột Computed)
                cartHeader.Tongtien = await _context.Chitietdonhangs
                                        .Where(cd => cd.Madh == madh)
                                        .SumAsync(cd => cd.Thanhtien ?? 0);
                await _context.SaveChangesAsync();
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCart()
        {
            try
            {
                int makh = GetCurrentUserId();
                var cartHeader = await _context.Donhangs.FirstOrDefaultAsync(d => d.Makh == makh && d.Trangthai == "GioHang");

                if (cartHeader == null) return Ok(new List<object>());

                var cartItems = await _context.Chitietdonhangs
                    .Where(cd => cd.Madh == cartHeader.Madh)
                    .Include(cd => cd.MaloNavigation)
                        .ThenInclude(l => l.MathuocNavigation) // Join để lấy tên, ảnh
                    .Select(cd => new {
                        madh = cd.Madh,
                        malo = cd.Malo,
                        soluong = cd.Soluong,
                        dongia = cd.Dongia,
                        // Kiểm tra null để tránh lỗi nếu thuốc chưa có giá cũ
                        giacu = cd.MaloNavigation.MathuocNavigation.Giacu,
                        thanhtien = cd.Thanhtien, // Lấy giá trị SQL tự tính
                        mathuoc = cd.MaloNavigation.Mathuoc,
                        tenthuoc = cd.MaloNavigation.MathuocNavigation.Tenthuoc,
                        hinhanh = cd.MaloNavigation.MathuocNavigation.Hinhanh,
                        donvitinh = cd.MaloNavigation.MathuocNavigation.Donvitinh
                    })
                    .ToListAsync();

                return Ok(cartItems);
            }
            catch (Exception ex)
            {
                // Log lỗi ra console server để dễ debug
                Console.WriteLine("Lỗi GetCart: " + ex.Message);
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<IEnumerable<object>>> AddToCart(AddToCartDto dto)
        {
            try
            {
                int makh = GetCurrentUserId();

                // 1. Kiểm tra thuốc & Lô
                var thuoc = await _context.Thuocs.FindAsync(dto.MaThuoc);
                if (thuoc == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });

                // --- BỔ SUNG LOGIC NGHIỆP VỤ: KIỂM TRA TỒN KHO TỔNG ---
                // Nếu số lượng tồn trong bảng Thuoc <= 0, báo ngay là "Sắp có"
                if (thuoc.Soluongton <= 0)
                {
                    return BadRequest(new { message = "Sản phẩm hiện đang tạm hết hàng (Sắp có)." });
                }
                // -----------------------------------------------------

                // Tìm lô còn hạn và còn hàng (Ưu tiên lô hết hạn trước - FEFO)
                var lot = await _context.Lothuocs
                    .Include(l => l.Tonkhos)
                    .Where(l => l.Mathuoc == dto.MaThuoc && l.Hansudung > DateTime.Now)
                    .OrderBy(l => l.Hansudung)
                    .FirstOrDefaultAsync();

                // Logic dự phòng: Nếu bảng Thuoc báo có tồn, mà tìm Lô không thấy (do lỗi dữ liệu)
                if (lot == null)
                {
                    return BadRequest(new { message = "Sản phẩm đang được kiểm kê (Vui lòng quay lại sau)." });
                }

                // 2. Tìm hoặc tạo giỏ hàng
                var cartHeader = await _context.Donhangs.FirstOrDefaultAsync(d => d.Makh == makh && d.Trangthai == "GioHang");
                if (cartHeader == null)
                {
                    cartHeader = new Donhang
                    {
                        // Lưu ý: Nên set Identity cho MaDH trong SQL để không cần Max+1
                        Madh = (_context.Donhangs.Max(d => (int?)d.Madh) ?? 0) + 1,
                        Makh = makh,
                        Ngaydat = DateTime.Now,
                        Trangthai = "GioHang",
                        Tongtien = 0
                    };
                    _context.Donhangs.Add(cartHeader);
                    await _context.SaveChangesAsync();
                }

                // 3. Thêm/Cập nhật sản phẩm vào giỏ
                var cartItem = await _context.Chitietdonhangs
                    .FirstOrDefaultAsync(cd => cd.Madh == cartHeader.Madh && cd.Malo == lot.Malo);

                if (cartItem != null)
                {
                    cartItem.Soluong += dto.SoLuong;
                    // --- SỬA LỖI 2: KHÔNG GÁN THANHTIEN VÌ LÀ CỘT COMPUTED ---
                    // cartItem.Thanhtien = ... (Bỏ dòng này)
                }
                else
                {
                    cartItem = new Chitietdonhang
                    {
                        Madh = cartHeader.Madh,
                        Malo = lot.Malo,
                        Soluong = dto.SoLuong,
                        Dongia = thuoc.Giaban
                        // --- SỬA LỖI 2: KHÔNG GÁN THANHTIEN ---
                    };
                    _context.Chitietdonhangs.Add(cartItem);
                }

                await _context.SaveChangesAsync();
                await UpdateCartTotal(cartHeader.Madh); // Cập nhật tổng tiền header

                return await GetCart(); // Trả về giỏ hàng mới nhất
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{malo}")]
        public async Task<IActionResult> UpdateQuantity(int malo, UpdateCartDto dto)
        {
            if (dto.SoLuong <= 0) return await RemoveFromCart(malo);

            try
            {
                int makh = GetCurrentUserId();
                var cartHeader = await _context.Donhangs.FirstOrDefaultAsync(d => d.Makh == makh && d.Trangthai == "GioHang");
                if (cartHeader == null) return NotFound(new { message = "Giỏ hàng trống" });

                var cartItem = await _context.Chitietdonhangs.FirstOrDefaultAsync(cd => cd.Madh == cartHeader.Madh && cd.Malo == malo);
                if (cartItem == null) return NotFound(new { message = "Sản phẩm không có trong giỏ" });

                cartItem.Soluong = dto.SoLuong;
                // --- SỬA LỖI 2: KHÔNG GÁN THANHTIEN ---

                await _context.SaveChangesAsync();
                await UpdateCartTotal(cartHeader.Madh);

                return Ok(new { message = "Cập nhật thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{malo}")]
        public async Task<IActionResult> RemoveFromCart(int malo)
        {
            try
            {
                int makh = GetCurrentUserId();
                var cartHeader = await _context.Donhangs.FirstOrDefaultAsync(d => d.Makh == makh && d.Trangthai == "GioHang");
                if (cartHeader == null) return NotFound();

                var cartItem = await _context.Chitietdonhangs.FirstOrDefaultAsync(cd => cd.Madh == cartHeader.Madh && cd.Malo == malo);
                if (cartItem == null) return NotFound();

                _context.Chitietdonhangs.Remove(cartItem);
                await _context.SaveChangesAsync();
                await UpdateCartTotal(cartHeader.Madh);

                return Ok(new { message = "Đã xóa sản phẩm" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
