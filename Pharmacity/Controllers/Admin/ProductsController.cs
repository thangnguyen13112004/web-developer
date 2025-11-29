using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Pharmacity.Models;
using Pharmacity.DTOs;
using Pharmacity.DTOs.Admin;

using Microsoft.Extensions.Caching.Distributed; // Import thư viện
using System.Text.Json; // Import JSON

namespace Pharmacity.Controllers.Admin
{
    // 1. ĐẶT ROUTE CỐ ĐỊNH: Để không bị trùng với API của user
    [Route("api/admin/products")]
    [ApiController]
    //[Authorize(Roles = "Admin, Quản lý cửa hàng")] // Chỉ Admin mới xem được
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;
        private readonly IDistributedCache _cache; // 1. Inject Cache

        public ProductsController(DB_QuanLyNhaThuoc2Context context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        // 1. GET ALL: Trả về List<ProductReadDto>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ProductReadDto>>> GetAll()
        {
            var products = await _context.Thuocs
                .Include(t => t.MaloaiNavigation)
                .Select(t => new ProductReadDto // Sử dụng DTO cụ thể
                {
                    Mathuoc = t.Mathuoc,
                    Tenthuoc = t.Tenthuoc,
                    Hoatchat = t.Hoatchat,
                    Sodangky = t.Sodangky,
                    Quycachdonggoi = t.Quycachdonggoi,
                    Donvitinh = t.Donvitinh,
                    Giaban = t.Giaban,
                    Giacu = t.Giacu,
                    Soluongton = t.Soluongton,
                    Nhasx = t.Nhasx,
                    LoaithuocText = t.Loaithuoc,
                    Chongchidinh = t.Chongchidinh,
                    Lieudung = t.Lieudung,
                    Hinhanh = t.Hinhanh,
                    Maloai = t.Maloai,
                    Tenloai = t.MaloaiNavigation != null ? t.MaloaiNavigation.Tenloai : "Chưa phân loại"
                })
                .ToListAsync();

            return Ok(products);
        }

        // 2. GET BY ID: Trả về ProductReadDto
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductReadDto>> GetById(int id)
        {
            var t = await _context.Thuocs
                .Include(x => x.MaloaiNavigation)
                .FirstOrDefaultAsync(x => x.Mathuoc == id);

            if (t == null) return NotFound(new { message = "Không tìm thấy thuốc" });

            // Map thủ công sang DTO (hoặc dùng AutoMapper nếu có)
            var productDto = new ProductReadDto
            {
                Mathuoc = t.Mathuoc,
                Tenthuoc = t.Tenthuoc,
                Hoatchat = t.Hoatchat,
                Sodangky = t.Sodangky,
                Quycachdonggoi = t.Quycachdonggoi,
                Donvitinh = t.Donvitinh,
                Giaban = t.Giaban,
                Giacu = t.Giacu,
                Soluongton = t.Soluongton,
                Nhasx = t.Nhasx,
                LoaithuocText = t.Loaithuoc,
                Chongchidinh = t.Chongchidinh,
                Lieudung = t.Lieudung,
                Hinhanh = t.Hinhanh,
                Maloai = t.Maloai,
                Tenloai = t.MaloaiNavigation?.Tenloai ?? "Chưa phân loại"
            };

            return Ok(productDto);
        }

        // 3. CREATE: Nhận vào ProductCreateDto
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Logic tự tăng ID (Nên dùng Identity trong SQL, nhưng đây là giữ logic cũ của bạn)
            int newId = (_context.Thuocs.Max(t => (int?)t.Mathuoc) ?? 0) + 1;

            var thuoc = new Thuoc
            {
                Mathuoc = newId,
                Tenthuoc = model.TenThuoc,
                Hoatchat = model.HoatChat,
                Sodangky = model.SoDangKy,
                Quycachdonggoi = model.QuyCachDongGoi,
                Donvitinh = model.DonViTinh,
                Giaban = model.GiaBan,
                Giacu = model.GiaCu,
                Soluongton = model.SoLuongTon,
                Nhasx = model.NhaSX,
                Loaithuoc = "Thuốc", // Mặc định hoặc logic khác tùy bạn
                Chongchidinh = model.ChongChiDinh,
                Lieudung = model.LieuDung,
                Maloai = model.MaLoai,
                Hinhanh = model.HinhAnhBase64 ?? "" // Lưu chuỗi Base64
            };

            _context.Thuocs.Add(thuoc);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm thành công", id = newId });
        }

        // --- HÀM MỚI: CẬP NHẬT (FIX LỖI 405) ---
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductCreateDto model)
        {
            var thuoc = await _context.Thuocs.FindAsync(id);
            if (thuoc == null) return NotFound(new { message = "Không tìm thấy thuốc để sửa" });

            // Cập nhật thông tin
            thuoc.Tenthuoc = model.TenThuoc;
            thuoc.Hoatchat = model.HoatChat;
            thuoc.Sodangky = model.SoDangKy;
            thuoc.Quycachdonggoi = model.QuyCachDongGoi;
            thuoc.Donvitinh = model.DonViTinh;
            thuoc.Giaban = model.GiaBan;
            thuoc.Giacu = model.GiaCu;
            thuoc.Soluongton = model.SoLuongTon;
            thuoc.Nhasx = model.NhaSX;
            thuoc.Chongchidinh = model.ChongChiDinh;
            thuoc.Lieudung = model.LieuDung;
            thuoc.Maloai = model.MaLoai;

            // Logic ảnh: Chỉ cập nhật nếu người dùng gửi ảnh mới (Base64)
            // Nếu người dùng gửi chuỗi URL cũ thì giữ nguyên, nếu gửi Base64 thì lưu mới
            if (!string.IsNullOrEmpty(model.HinhAnhBase64))
            {
                // Nếu chuỗi bắt đầu bằng http -> Là link cũ, giữ nguyên
                if (!model.HinhAnhBase64.StartsWith("http"))
                {
                    thuoc.Hinhanh = model.HinhAnhBase64;
                }
                // Nếu rỗng thì không làm gì (giữ ảnh cũ)
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công" });
        }

        // [DELETE] Xóa thuốc
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var thuoc = await _context.Thuocs.FindAsync(id);
            if (thuoc == null) return NotFound();

            // Kiểm tra đã bán chưa
            bool hasSold = await _context.Chitietdonhangs.AnyAsync(ct => ct.MaloNavigation.Mathuoc == id);
            // Kiểm tra đã nhập kho chưa
            bool hasImport = await _context.Chitietphieunhaps.AnyAsync(ct => ct.Mathuoc == id);

            if (hasSold || hasImport)
            {
                // Có thể thêm cột 'IsDeleted' (Soft delete) vào bảng Thuoc nếu muốn ẩn đi
                return BadRequest(new { message = "Không thể xóa: Thuốc này đã có phát sinh giao dịch." });
            }

            // Trong hàm Delete của ProductsController
            bool hasLots = await _context.Lothuocs.AnyAsync(l => l.Mathuoc == id);

            if (hasSold || hasImport || hasLots) // Thêm hasLots
            {
                return BadRequest(new { message = "Không thể xóa: Thuốc này đang được sử dụng trong hệ thống (Lô/Đơn hàng/Phiếu nhập)." });
            }

            _context.Thuocs.Remove(thuoc);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa thuốc." });
        }

        // 4. GET CATEGORIES: Trả về List<CategoryDto>
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            string cacheKey = "ref_categories";

            // 1. Kiểm tra Redis
            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedData))
            {
                return Ok(JsonSerializer.Deserialize<IEnumerable<CategoryDto>>(cachedData));
            }

            // 2. Query DB nếu không có trong Redis
            var categories = await _context.Loaithuocs
                .Select(l => new CategoryDto { MaLoai = l.Maloai, TenLoai = l.Tenloai })
                .ToListAsync();

            // 3. Lưu vào Redis (Lưu lâu dài: 1 ngày hoặc 1 tuần)
            var options = new DistributedCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromDays(1)); // Dữ liệu ít đổi lưu lâu

            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(categories), options);

            return Ok(categories);
        }
    }
}
