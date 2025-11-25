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

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new Exception("Token không hợp lệ");
            return int.Parse(userIdClaim.Value);
        }

        // Hàm helper: Hủy tất cả mặc định cũ
        private async Task UnsetAllDefaults(int makh)
        {
            // SỬA LỖI: Dùng đúng tên cột 'Macdinh'
            var oldDefaults = await _context.SoDiaChis
                .Where(dc => dc.Makh == makh && dc.Macdinh == true)
                .ToListAsync(); // <-- Lỗi ToListAsync() được sửa bằng import

            foreach (var old in oldDefaults)
            {
                old.Macdinh = false; // SỬA LỖI: Dùng 'Macdinh'
            }
        }

        // GET: api/SoDiaChi (Lấy tất cả địa chỉ)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SoDiaChi>>> GetDiaChis()
        {
            int makh = GetCurrentUserId();
            var diaChis = await _context.SoDiaChis
                .Where(dc => dc.Makh == makh)
                .OrderByDescending(dc => dc.Macdinh) // Sắp xếp theo 'Macdinh'
                .ToListAsync();
            return Ok(diaChis);
        }

        // GET: api/SoDiaChi/default (Lấy địa chỉ cho trang Đặt Hàng)
        [HttpGet("default")]
        public async Task<ActionResult<SoDiaChi>> GetDefaultDiaChi()
        {
            int makh = GetCurrentUserId();
            var diaChi = await _context.SoDiaChis
                .FirstOrDefaultAsync(dc => dc.Makh == makh && dc.Macdinh == true); // Dùng 'Macdinh'

            if (diaChi == null)
            {
                diaChi = await _context.SoDiaChis
                    .FirstOrDefaultAsync(dc => dc.Makh == makh);
            }

            if (diaChi == null)
            {
                return NotFound(new { message = "Khách hàng chưa có địa chỉ." });
            }

            return Ok(diaChi);
        }

        // POST: api/SoDiaChi (Thêm địa chỉ mới)
        [HttpPost]
        public async Task<ActionResult<SoDiaChi>> AddDiaChi(DiaChiDto dto) // Dùng DTO đã sửa
        {
            int makh = GetCurrentUserId();

            if (dto.Macdinh) // Dùng tên DTO
            {
                await UnsetAllDefaults(makh);
            }

            // Đồng bộ DTO với Model
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

        // PUT: api/SoDiaChi/setDefault/{id} (Chọn mặc định)
        [HttpPut("setDefault/{id}")]
        public async Task<IActionResult> SetDefault(int id)
        {
            int makh = GetCurrentUserId();
            var diaChiToSet = await _context.SoDiaChis
                .FirstOrDefaultAsync(dc => dc.Madc == id && dc.Makh == makh);

            if (diaChiToSet == null) return NotFound();

            await UnsetAllDefaults(makh);
            diaChiToSet.Macdinh = true; // Dùng 'Macdinh'
            await _context.SaveChangesAsync();

            return Ok(diaChiToSet);
        }

        // MỚI: CẬP NHẬT ĐỊA CHỈ (Sửa)
        // PUT: api/SoDiaChi/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDiaChi(int id, DiaChiDto dto)
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

        // DELETE: api/SoDiaChi/{id}
        // ==========================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDiaChi(int id)
        {
            int makh = GetCurrentUserId();
            var diaChiToDelete = await _context.SoDiaChis
                .FirstOrDefaultAsync(dc => dc.Madc == id && dc.Makh == makh);

            if (diaChiToDelete == null) return NotFound();

            // Không thể xóa địa chỉ mặc định (trừ khi nó là cái cuối cùng)
            if (diaChiToDelete.Macdinh)
            {
                return BadRequest(new { message = "Không thể xóa địa chỉ mặc định. Vui lòng chọn địa chỉ khác làm mặc định trước." });
            }

            _context.SoDiaChis.Remove(diaChiToDelete);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa thành công" });
        }
    }
}
