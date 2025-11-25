using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Pharmacity.Models;
using Pharmacity.DTOs;
using Pharmacity.DTOs.Admin;

namespace Pharmacity.Controllers.Admin
{
    // 1. ĐẶT ROUTE CỐ ĐỊNH: Để không bị trùng với API của user
    [Route("api/admin/products")]
    [ApiController]
    [Authorize(Roles = "Admin, Quản lý cửa hàng")] // Chỉ Admin mới xem được
    public class ProductsController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;
        private readonly IWebHostEnvironment _env;

        public ProductsController(DB_QuanLyNhaThuoc2Context context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/admin/products
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _context.Thuocs
                .Include(t => t.MaloaiNavigation)
                // 2. ÉP KIỂU JSON CHỮ THƯỜNG: Để React chắc chắn đọc được
                .Select(t => new {
                    mathuoc = t.Mathuoc,       // Cố tình viết thường tên biến
                    tenthuoc = t.Tenthuoc,
                    categoryName = t.MaloaiNavigation.Tenloai,
                    price = t.Giaban,
                    stock = t.Soluongton,
                    image = t.Hinhanh
                })
                .ToListAsync();
            return Ok(products);
        }

        // POST: api/admin/products
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var thuoc = new Thuoc
            {
                Tenthuoc = model.TenThuoc,
                Giaban = model.GiaBan,
                Soluongton = model.SoLuongTon,
                Maloai = model.MaLoai,
                Hoatchat = model.HoatChat,
                Hinhanh = model.HinhAnhBase64 ?? "default.png" // Lưu tạm
            };

            _context.Thuocs.Add(thuoc);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm thuốc thành công", id = thuoc.Mathuoc });
        }
    }
}
