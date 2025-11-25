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

        // Hàm helper để lấy Mã Khách Hàng (makh) từ JWT Token
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                throw new Exception("Không tìm thấy User ID từ Token.");
            }
            return int.Parse(userIdClaim.Value);
        }

        // Hàm helper để cập nhật tổng tiền
        private async Task UpdateCartTotal(int madh)
        {
            var cartHeader = await _context.Donhangs.FindAsync(madh);
            if (cartHeader != null)
            {
                cartHeader.Tongtien = await _context.Chitietdonhangs
                                        .Where(cd => cd.Madh == madh)
                                        .SumAsync(cd => cd.Thanhtien ?? 0);
                await _context.SaveChangesAsync();
            }
        }

        // GET: api/GioHang
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCart()
        {
            int makh = GetCurrentUserId();
            var cartHeader = await _context.Donhangs.FirstOrDefaultAsync(d => d.Makh == makh && d.Trangthai == "GioHang");

            if (cartHeader == null)
            {
                return Ok(new List<object>()); // Giỏ hàng rỗng
            }

            var cartItems = await _context.Chitietdonhangs
                .Where(cd => cd.Madh == cartHeader.Madh)
                .Include(cd => cd.MaloNavigation)
                .ThenInclude(l => l.MathuocNavigation)
                .Select(cd => new {
                    madh = cd.Madh,
                    malo = cd.Malo,
                    soluong = cd.Soluong,
                    dongia = cd.Dongia, // Đây là giaban
                    giacu = cd.MaloNavigation.MathuocNavigation.Giacu, // <-- SỬA 1: THÊM GIÁ CŨ
                    thanhtien = cd.Thanhtien,
                    mathuoc = cd.MaloNavigation.Mathuoc,
                    tenthuoc = cd.MaloNavigation.MathuocNavigation.Tenthuoc,
                    hinhanh = cd.MaloNavigation.MathuocNavigation.Hinhanh,
                    donvitinh = cd.MaloNavigation.MathuocNavigation.Donvitinh
                })
                .ToListAsync();

            return Ok(cartItems);
        }

        // POST: api/GioHang (Hàm thêm vào giỏ - Giữ nguyên)
        [HttpPost]
        public async Task<ActionResult<IEnumerable<object>>> AddToCart(AddToCartDto dto)
        {
            // ... (Giữ nguyên code hàm AddToCart của bạn)
            // ... (Nhớ đảm bảo nó gọi UpdateCartTotal ở cuối)
            // ... (Code của bạn ở các file trước đã đúng)
            int makh = GetCurrentUserId();
            var thuoc = await _context.Thuocs.FindAsync(dto.MaThuoc);
            if (thuoc == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });
            var lot = await _context.Lothuocs
                .Where(l => l.Mathuoc == dto.MaThuoc && l.Hansudung > DateTime.Now && l.Soluongnhap > 0)
                .FirstOrDefaultAsync();
            if (lot == null) return BadRequest(new { message = "Sản phẩm đã hết hàng hoặc không tìm thấy lô." });
            var cartHeader = await _context.Donhangs.FirstOrDefaultAsync(d => d.Makh == makh && d.Trangthai == "GioHang");
            if (cartHeader == null)
            {
                cartHeader = new Donhang
                {
                    Madh = (_context.Donhangs.Max(d => (int?)d.Madh) ?? 0) + 1,
                    Makh = makh,
                    Ngaydat = DateTime.Now,
                    Trangthai = "GioHang",
                    Tongtien = 0
                };
                _context.Donhangs.Add(cartHeader);
                await _context.SaveChangesAsync();
            }
            var cartItem = await _context.Chitietdonhangs
                .FirstOrDefaultAsync(cd => cd.Madh == cartHeader.Madh && cd.Malo == lot.Malo);
            if (cartItem != null)
            {
                cartItem.Soluong += dto.SoLuong;
                cartItem.Thanhtien = cartItem.Soluong * cartItem.Dongia;
            }
            else
            {
                cartItem = new Chitietdonhang
                {
                    Madh = cartHeader.Madh,
                    Malo = lot.Malo,
                    Soluong = dto.SoLuong,
                    Dongia = thuoc.Giaban,
                    Thanhtien = dto.SoLuong * thuoc.Giaban
                };
                _context.Chitietdonhangs.Add(cartItem);
            }
            await _context.SaveChangesAsync();
            await UpdateCartTotal(cartHeader.Madh);
            return await GetCart();
        }

        // SỬA 2: THÊM HÀM CẬP NHẬT SỐ LƯỢNG
        [HttpPut("{malo}")]
        public async Task<IActionResult> UpdateQuantity(int malo, UpdateCartDto dto)
        {
            if (dto.SoLuong <= 0)
            {
                // Nếu số lượng <= 0, gọi hàm Xóa
                return await RemoveFromCart(malo);
            }

            int makh = GetCurrentUserId();
            var cartHeader = await _context.Donhangs.FirstOrDefaultAsync(d => d.Makh == makh && d.Trangthai == "GioHang");
            if (cartHeader == null) return NotFound(new { message = "Không tìm thấy giỏ hàng" });

            var cartItem = await _context.Chitietdonhangs.FirstOrDefaultAsync(cd => cd.Madh == cartHeader.Madh && cd.Malo == malo);
            if (cartItem == null) return NotFound(new { message = "Không tìm thấy sản phẩm trong giỏ" });

            cartItem.Soluong = dto.SoLuong;
            cartItem.Thanhtien = cartItem.Dongia * cartItem.Soluong;

            await _context.SaveChangesAsync();
            await UpdateCartTotal(cartHeader.Madh);

            return Ok(new { message = "Cập nhật thành công" });
        }

        // SỬA 3: THÊM HÀM XÓA SẢN PHẨM
        [HttpDelete("{malo}")]
        public async Task<IActionResult> RemoveFromCart(int malo)
        {
            int makh = GetCurrentUserId();
            var cartHeader = await _context.Donhangs.FirstOrDefaultAsync(d => d.Makh == makh && d.Trangthai == "GioHang");
            if (cartHeader == null) return NotFound(new { message = "Không tìm thấy giỏ hàng" });

            var cartItem = await _context.Chitietdonhangs.FirstOrDefaultAsync(cd => cd.Madh == cartHeader.Madh && cd.Malo == malo);
            if (cartItem == null) return NotFound(new { message = "Không tìm thấy sản phẩm trong giỏ" });

            _context.Chitietdonhangs.Remove(cartItem);

            await _context.SaveChangesAsync();
            await UpdateCartTotal(cartHeader.Madh);

            return Ok(new { message = "Xóa thành công" });
        }
    }
}
