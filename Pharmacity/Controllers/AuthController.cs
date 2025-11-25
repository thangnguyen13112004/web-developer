using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Pharmacity.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Pharmacity.Controllers
{
    // DTO dùng chung cho đăng nhập
    public class LoginRequestDto
    {
        public string Identifier { get; set; } // Chứa SĐT hoặc Tài khoản
        public string MatKhau { get; set; }
    }

    // DTO cho đăng ký (chỉ dành cho khách hàng)
    public class RegisterDto
    {
        public string HoTen { get; set; }
        public string Sdt { get; set; }
        public string MatKhau { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;
        private readonly IConfiguration _configuration;

        public AuthController(DB_QuanLyNhaThuoc2Context context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/Auth/register
        // Giữ nguyên logic: Đăng ký chỉ dành cho Khách Hàng
        [HttpPost("register")]
        public async Task<ActionResult<Khachhang>> Register(RegisterDto registerDto)
        {
            if (await _context.Khachhangs.AnyAsync(k => k.Sdt == registerDto.Sdt))
            {
                return BadRequest(new { message = "Số điện thoại đã được đăng ký." });
            }

            var khachHang = new Khachhang
            {
                // Lưu ý: Nên dùng Identity(1,1) trong SQL thay vì Max + 1
                Makh = (_context.Khachhangs.Max(k => (int?)k.Makh) ?? 0) + 1,
                Hoten = registerDto.HoTen,
                Sdt = registerDto.Sdt,
                Matkhau = registerDto.MatKhau,
                Ngaytao = DateTime.Now
            };

            _context.Khachhangs.Add(khachHang);
            await _context.SaveChangesAsync();

            khachHang.Matkhau = null;
            return Ok(khachHang);
        }

        // POST: api/Auth/login
        // Sửa logic: Kiểm tra cả 2 bảng
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login(LoginRequestDto loginDto)
        {
            // 1. ƯU TIÊN KIỂM TRA KHÁCH HÀNG (Dùng SĐT)
            var kh = await _context.Khachhangs
                .FirstOrDefaultAsync(k => k.Sdt == loginDto.Identifier && k.Matkhau == loginDto.MatKhau);

            if (kh != null)
            {
                // Tìm thấy khách hàng -> Role là Customer
                string token = CreateToken(kh.Hoten, "Customer", kh.Makh.ToString());
                return Ok(new
                {
                    token = token,
                    user = new { id = kh.Makh, name = kh.Hoten, role = "Customer" }
                });
            }

            // 2. NẾU KHÔNG PHẢI KHÁCH, KIỂM TRA NHÂN VIÊN (Dùng Tài Khoản)
            var nv = await _context.Nhanviens
                .FirstOrDefaultAsync(n => n.Taikhoan == loginDto.Identifier && n.Matkhau == loginDto.MatKhau);

            if (nv != null)
            {
                if (nv.Trangthai == false) return BadRequest(new { message = "Tài khoản đã bị khóa." });

                // Mapping chức vụ DB sang Role hệ thống
                string role = (nv.Chucvu == "Admin" || nv.Chucvu == "Quản lý cửa hàng") ? "Admin" : "Staff";

                string token = CreateToken(nv.Hoten, role, nv.Manv.ToString());
                return Ok(new
                {
                    token = token,
                    user = new { id = nv.Manv, name = nv.Hoten, role = role, chucvu = nv.Chucvu }
                });
            }

            // 3. KHÔNG TÌM THẤY Ở CẢ 2 BẢNG
            return Unauthorized(new { message = "Tài khoản/SĐT hoặc mật khẩu không đúng." });
        }

        // HÀM HELPER TẠO TOKEN (Đã tổng quát hóa)
        // Thay vì nhận object Khachhang, ta nhận các thông tin cơ bản
        private string CreateToken(string name, string role, string id)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, name),
                new Claim(ClaimTypes.Role, role), // Quan trọng để phân quyền
                new Claim("id", id)               // ID chung cho cả NV và KH
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}