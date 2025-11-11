using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
// Thêm các using này
using Microsoft.IdentityModel.Tokens;
using Pharmacity.DTOs; // <-- Thêm DTOs
using Pharmacity.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Pharmacity.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;
        private readonly IConfiguration _configuration; // 1. Inject IConfiguration

        public AuthController(DB_QuanLyNhaThuoc2Context context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration; // 2. Khởi tạo
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult<Khachhang>> Register(RegisterDto registerDto)
        {
            // 1. Kiểm tra xem SĐT đã tồn tại chưa
            if (await _context.Khachhangs.AnyAsync(k => k.Sdt == registerDto.Sdt))
            {
                return BadRequest(new { message = "Số điện thoại đã được đăng ký." });
            }

            // 2. Tạo khách hàng mới
            // LƯU Ý BẢO MẬT: Trong thực tế, bạn PHẢI băm (hash) mật khẩu trước khi lưu.
            // Ví dụ: var hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.MatKhau);
            // Ở đây chúng ta lưu thẳng để đơn giản hóa.
            var khachHang = new Khachhang
            {
                Makh = (_context.Khachhangs.Max(k => (int?)k.Makh) ?? 0) + 1, // Tạo ID mới (Không khuyến khích)
                Hoten = registerDto.HoTen,
                Sdt = registerDto.Sdt,
                Matkhau = registerDto.MatKhau, // <-- PHẢI HASH MẬT KHẨU Ở ĐÂY
                Ngaytao = DateTime.Now
            };

            // 3. Lưu vào CSDL
            _context.Khachhangs.Add(khachHang);
            await _context.SaveChangesAsync();

            // Trả về thông tin khách hàng (trừ mật khẩu)
            khachHang.Matkhau = null;
            return Ok(khachHang);
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login(LoginDto loginDto) // 3. Sửa kiểu trả về
        {
            var khachHang = await _context.Khachhangs.FirstOrDefaultAsync(k => k.Sdt == loginDto.Sdt);

            if (khachHang == null || khachHang.Matkhau != loginDto.MatKhau)
            {
                return Unauthorized(new { message = "Số điện thoại hoặc mật khẩu không đúng." });
            }

            // 4. Đăng nhập thành công -> Tạo Token
            string jwtToken = CreateToken(khachHang);

            // 5. Trả về cả Token và User
            khachHang.Matkhau = null;
            return Ok(new
            {
                token = jwtToken,
                user = khachHang
            });
        }

        // 6. HÀM HELPER ĐỂ TẠO TOKEN
        private string CreateToken(Khachhang kh)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, kh.Hoten),
                new Claim(ClaimTypes.MobilePhone, kh.Sdt),
                new Claim(ClaimTypes.NameIdentifier, kh.Makh.ToString()) // <-- Rất quan trọng (dùng để lấy ID trong GioHangController)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1), // Token hết hạn sau 1 ngày
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
