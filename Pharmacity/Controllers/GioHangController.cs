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
            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    int makh = GetCurrentUserId();

                    // 1. Kiểm tra tổng tồn kho của thuốc
                    var thuoc = await _context.Thuocs.FindAsync(dto.MaThuoc);
                    if (thuoc == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });

                    // Lấy tổng tồn thực tế từ bảng TonKho (chính xác hơn bảng Thuoc)
                    var totalStock = await _context.Tonkhos
                        .Include(tk => tk.MaloNavigation)
                        .Where(tk => tk.MaloNavigation.Mathuoc == dto.MaThuoc && tk.MaloNavigation.Hansudung > DateTime.Now)
                        .SumAsync(tk => tk.Soluongton);

                    if (totalStock < dto.SoLuong)
                    {
                        return BadRequest(new { message = $"Sản phẩm chỉ còn {totalStock} {thuoc.Donvitinh} (Yêu cầu: {dto.SoLuong})" });
                    }

                    // 2. Tìm hoặc tạo giỏ hàng
                    var cartHeader = await _context.Donhangs.FirstOrDefaultAsync(d => d.Makh == makh && d.Trangthai == "GioHang");
                    if (cartHeader == null)
                    {
                        cartHeader = new Donhang
                        {
                            // Tốt nhất nên set Identity trong SQL, ở đây giữ logic cũ của bạn
                            Madh = (_context.Donhangs.Max(d => (int?)d.Madh) ?? 0) + 1,
                            Makh = makh,
                            Ngaydat = DateTime.Now,
                            Trangthai = "GioHang",
                            Tongtien = 0
                        };
                        _context.Donhangs.Add(cartHeader);
                        await _context.SaveChangesAsync();
                    }

                    // =================================================================================
                    // TRƯỜNG HỢP 1: NHÂN VIÊN CHỌN LÔ CỤ THỂ (dto.MaLo có giá trị)
                    // =================================================================================
                    if (dto.MaLo.HasValue)
                    {
                        // Tìm đúng cái lô đó trong kho
                        var specificLot = await _context.Tonkhos
                            .Include(tk => tk.MaloNavigation)
                            .FirstOrDefaultAsync(tk => tk.Malo == dto.MaLo && tk.MaloNavigation.Mathuoc == dto.MaThuoc);

                        // Kiểm tra lô có tồn tại và đủ hàng không
                        if (specificLot == null)
                            return BadRequest(new { message = "Lô thuốc không tồn tại trong kho này." });

                        if (specificLot.Soluongton < dto.SoLuong)
                            return BadRequest(new { message = $"Lô {specificLot.MaloNavigation.Solo} chỉ còn {specificLot.Soluongton} (Yêu cầu: {dto.SoLuong})" });

                        // Thêm vào giỏ
                        var cartItem = await _context.Chitietdonhangs
                            .FirstOrDefaultAsync(cd => cd.Madh == cartHeader.Madh && cd.Malo == dto.MaLo);

                        if (cartItem != null)
                        {
                            cartItem.Soluong += dto.SoLuong;
                        }
                        else
                        {
                            _context.Chitietdonhangs.Add(new Chitietdonhang
                            {
                                Madh = cartHeader.Madh,
                                Malo = dto.MaLo.Value,
                                Soluong = dto.SoLuong,
                                Dongia = thuoc.Giaban
                            });
                        }
                    }

                    // =================================================================================
                    // TRƯỜNG HỢP 2: KHÁCH HÀNG / TỰ ĐỘNG (FEFO - Hết hạn trước xuất trước)
                    // =================================================================================
                    else
                    {
                        // Lấy danh sách lô (sắp xếp Hạn sử dụng tăng dần)
                        var availableLots = await _context.Tonkhos
                            .Include(tk => tk.MaloNavigation)
                            .Where(tk => tk.MaloNavigation.Mathuoc == dto.MaThuoc
                                         && tk.MaloNavigation.Hansudung > DateTime.Now
                                         && tk.Soluongton > 0)
                            .OrderBy(tk => tk.MaloNavigation.Hansudung) // Quan trọng: Date gần bán trước
                            .ToListAsync();

                        int remainingQtyNeeded = dto.SoLuong;

                        foreach (var lotInfo in availableLots)
                        {
                            if (remainingQtyNeeded <= 0) break;

                            // Lấy số lượng thực tế có thể bán từ lô này
                            // (Lưu ý: Logic này chưa tính số lượng ĐANG nằm trong giỏ nhưng chưa thanh toán của người khác
                            // để đơn giản hóa. Nếu cần chặt chẽ, phải trừ đi số lượng đang hold trong các giỏ hàng khác)
                            int availableInLot = lotInfo.Soluongton;

                            int qtyToTake = Math.Min(remainingQtyNeeded, availableInLot);

                            if (qtyToTake > 0)
                            {
                                var existingCartItem = await _context.Chitietdonhangs
                                    .FirstOrDefaultAsync(cd => cd.Madh == cartHeader.Madh && cd.Malo == lotInfo.Malo);

                                if (existingCartItem != null)
                                {
                                    existingCartItem.Soluong += qtyToTake;
                                }
                                else
                                {
                                    _context.Chitietdonhangs.Add(new Chitietdonhang
                                    {
                                        Madh = cartHeader.Madh,
                                        Malo = lotInfo.Malo,
                                        Soluong = qtyToTake,
                                        Dongia = thuoc.Giaban
                                    });
                                }
                                remainingQtyNeeded -= qtyToTake;
                            }
                        }
                    }

                    await _context.SaveChangesAsync();
                    await UpdateCartTotal(cartHeader.Madh);
                    await transaction.CommitAsync();

                    return await GetCart();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = ex.Message });
                }
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
