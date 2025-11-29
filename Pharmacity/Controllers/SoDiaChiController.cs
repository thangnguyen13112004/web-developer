using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pharmacity.DTOs;
using Pharmacity.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Pharmacity.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SoDiaChiController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;

        public SoDiaChiController(DB_QuanLyNhaThuoc2Context context)
        {
            _context = context;
        }

        // --- SỬA LỖI QUAN TRỌNG: Logic lấy User ID linh hoạt ---
        private int GetCurrentUserId()
        {
            // 1. Thử lấy theo chuẩn NameIdentifier (Mặc định)
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);

            // 2. Nếu không có, thử lấy theo key "id" (do AuthController của bạn dùng key này)
            if (claim == null)
            {
                claim = User.FindFirst("id");
            }

            // 3. Nếu vẫn không có -> Lỗi Token
            if (claim == null)
            {
                throw new Exception("Token không hợp lệ: Không tìm thấy User ID.");
            }
            return int.Parse(claim.Value);
        }

        // Hàm helper: Hủy tất cả mặc định cũ
        private async Task UnsetAllDefaults(int makh)
        {
            var oldDefaults = await _context.SoDiaChis
                .Where(dc => dc.Makh == makh && dc.Macdinh == true)
                .ToListAsync();

            foreach (var old in oldDefaults)
            {
                old.Macdinh = false;
            }
        }

        // GET: api/SoDiaChi (Lấy tất cả địa chỉ)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SoDiaChi>>> GetDiaChis()
        {
            try
            {
                int makh = GetCurrentUserId();
                var diaChis = await _context.SoDiaChis
                    .Where(dc => dc.Makh == makh)
                    .OrderByDescending(dc => dc.Macdinh) // Đưa mặc định lên đầu
                    .ToListAsync();
                return Ok(diaChis);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET: api/SoDiaChi/default (Lấy địa chỉ cho trang Đặt Hàng)
        [HttpGet("default")]
        public async Task<ActionResult<SoDiaChi>> GetDefaultDiaChi()
        {
            try
            {
                int makh = GetCurrentUserId();
                var diaChi = await _context.SoDiaChis
                    .FirstOrDefaultAsync(dc => dc.Makh == makh && dc.Macdinh == true);

                if (diaChi == null)
                {
                    // Nếu không có mặc định, lấy cái đầu tiên
                    diaChi = await _context.SoDiaChis
                        .FirstOrDefaultAsync(dc => dc.Makh == makh);
                }

                if (diaChi == null)
                {
                    return NotFound(new { message = "Khách hàng chưa có địa chỉ." });
                }

                return Ok(diaChi);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST: api/SoDiaChi (Thêm địa chỉ mới)
        [HttpPost]
        public async Task<ActionResult<SoDiaChi>> AddDiaChi([FromBody] DiaChiDto dto) // Thêm [FromBody] cho chắc chắn
        {
            try
            {
                int makh = GetCurrentUserId();

                // Nếu địa chỉ mới là mặc định, bỏ mặc định các cái cũ
                if (dto.Macdinh)
                {
                    await UnsetAllDefaults(makh);
                }
                // Nếu đây là địa chỉ đầu tiên, tự động set mặc định
                else
                {
                    bool hasAddress = await _context.SoDiaChis.AnyAsync(d => d.Makh == makh);
                    if (!hasAddress) dto.Macdinh = true;
                }

                var newDiaChi = new SoDiaChi
                {
                    Makh = makh,
                    HotenNhan = dto.HotenNhan,
                    SdtNhan = dto.SdtNhan,
                    Tinhthanh = dto.Tinhthanh,
                    Quanhuyen = dto.Quanhuyen,
                    Phuongxa = dto.Phuongxa,
                    SonhaDuong = dto.SonhaDuong,
                    Loaidc = dto.Loaidc,
                    Macdinh = dto.Macdinh
                };

                _context.SoDiaChis.Add(newDiaChi);
                await _context.SaveChangesAsync();

                return Ok(newDiaChi);
            }
            catch (Exception ex)
            {
                // Log lỗi ra console để debug nếu cần
                Console.WriteLine(ex.ToString());
                return StatusCode(500, new { message = "Lỗi thêm địa chỉ: " + ex.Message });
            }
        }

        // PUT: api/SoDiaChi/setDefault/{id} (Chọn mặc định)
        [HttpPut("setDefault/{id}")]
        public async Task<IActionResult> SetDefault(int id)
        {
            try
            {
                int makh = GetCurrentUserId();
                var diaChiToSet = await _context.SoDiaChis
                    .FirstOrDefaultAsync(dc => dc.Madc == id && dc.Makh == makh);

                if (diaChiToSet == null) return NotFound();

                await UnsetAllDefaults(makh);
                diaChiToSet.Macdinh = true;
                await _context.SaveChangesAsync();

                return Ok(diaChiToSet);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // PUT: api/SoDiaChi/{id} (Cập nhật thông tin)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDiaChi(int id, [FromBody] DiaChiDto dto)
        {
            try
            {
                int makh = GetCurrentUserId();
                var diaChiToUpdate = await _context.SoDiaChis
                    .FirstOrDefaultAsync(dc => dc.Madc == id && dc.Makh == makh);

                if (diaChiToUpdate == null) return NotFound();

                if (dto.Macdinh)
                {
                    await UnsetAllDefaults(makh);
                }

                // Cập nhật các trường
                diaChiToUpdate.HotenNhan = dto.HotenNhan;
                diaChiToUpdate.SdtNhan = dto.SdtNhan;
                diaChiToUpdate.Tinhthanh = dto.Tinhthanh;
                diaChiToUpdate.Quanhuyen = dto.Quanhuyen;
                diaChiToUpdate.Phuongxa = dto.Phuongxa;
                diaChiToUpdate.SonhaDuong = dto.SonhaDuong;
                diaChiToUpdate.Loaidc = dto.Loaidc;
                diaChiToUpdate.Macdinh = dto.Macdinh;

                await _context.SaveChangesAsync();
                return Ok(diaChiToUpdate);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // DELETE: api/SoDiaChi/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDiaChi(int id)
        {
            try
            {
                int makh = GetCurrentUserId();
                var diaChiToDelete = await _context.SoDiaChis
                    .FirstOrDefaultAsync(dc => dc.Madc == id && dc.Makh == makh);

                if (diaChiToDelete == null) return NotFound();

                // Không thể xóa địa chỉ mặc định (trừ khi nó là cái cuối cùng)
                if (diaChiToDelete.Macdinh)
                {
                    // Kiểm tra xem còn địa chỉ nào khác không
                    bool hasOther = await _context.SoDiaChis.AnyAsync(d => d.Makh == makh && d.Madc != id);
                    if (hasOther)
                    {
                        return BadRequest(new { message = "Không thể xóa địa chỉ mặc định. Vui lòng chọn địa chỉ khác làm mặc định trước." });
                    }
                }

                _context.SoDiaChis.Remove(diaChiToDelete);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
