using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pharmacity.DTOs;
using Pharmacity.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Pharmacity.Controllers
{
    [Route("api/client/profile")]
    [ApiController]
    [Authorize]
    public class ClientProfileController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;

        public ClientProfileController(DB_QuanLyNhaThuoc2Context context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (claim == null) throw new Exception("Unauthorized");
            return int.Parse(claim.Value);
        }

        // GET: Lấy thông tin cá nhân
        [HttpGet]
        public async Task<ActionResult<ClientProfileDto>> GetProfile()
        {
            int userId = GetCurrentUserId();
            var user = await _context.Khachhangs.FindAsync(userId);
            if (user == null) return NotFound();

            return Ok(new ClientProfileDto
            {
                HoTen = user.Hoten,
                Sdt = user.Sdt,
                Email = user.Email,
                // Chuyển từ DateOnly (DB) sang DateTime (DTO)
                NgaySinh = user.NgaySinh.HasValue
                    ? user.NgaySinh.Value.ToDateTime(TimeOnly.MinValue)
                    : null,
                GioiTinh = user.GioiTinh ?? "Nam",
                AnhDaiDien = user.AnhDaiDien
            });
        }

        // PUT: Cập nhật thông tin
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] ClientProfileDto model)
        {
            int userId = GetCurrentUserId();
            var user = await _context.Khachhangs.FindAsync(userId);
            if (user == null) return NotFound();

            // Cập nhật thông tin cơ bản
            user.Hoten = model.HoTen;
            user.Email = model.Email;
            // Chuyển từ DateTime (DTO) sang DateOnly (DB)
            user.NgaySinh = model.NgaySinh.HasValue
                ? DateOnly.FromDateTime(model.NgaySinh.Value)
                : null;
            user.GioiTinh = model.GioiTinh;

            // Cập nhật ảnh (nếu có gửi lên)
            if (!string.IsNullOrEmpty(model.AnhDaiDien))
            {
                user.AnhDaiDien = model.AnhDaiDien;
            }

            // Logic đổi mật khẩu (Nếu người dùng nhập mật khẩu cũ)
            if (!string.IsNullOrEmpty(model.MatKhauCu) && !string.IsNullOrEmpty(model.MatKhauMoi))
            {
                if (user.Matkhau != model.MatKhauCu)
                {
                    return BadRequest(new { message = "Mật khẩu cũ không đúng." });
                }
                user.Matkhau = model.MatKhauMoi;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thông tin thành công!" });
        }
    }
}
