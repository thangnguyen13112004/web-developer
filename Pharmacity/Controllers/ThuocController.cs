using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacity.Models;

namespace Pharmacity.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThuocController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;

        public ThuocController(DB_QuanLyNhaThuoc2Context context)
        {
            _context = context;
        }

        // GET: api/Thuoc
        // API này lấy danh sách sản phẩm, có hỗ trợ lọc và sắp xếp
        [HttpGet]
        public async Task<IActionResult> GetThuocs(
            [FromQuery] int? maloai,
            [FromQuery] string? sortBy,
            [FromQuery] string? priceSort,
            [FromQuery] int page = 1,     // Mặc định trang 1
            [FromQuery] int pageSize = 10 // Mặc định 10 sản phẩm/trang
        )
        {
            var query = _context.Thuocs.AsQueryable();

            // 1. Lọc theo danh mục
            if (maloai.HasValue)
            {
                query = query.Where(t => t.Maloai == maloai.Value);
            }

            // 2. Sắp xếp (Logic giữ nguyên)
            if (!string.IsNullOrEmpty(priceSort))
            {
                if (priceSort == "thap-den-cao") query = query.OrderBy(t => t.Giaban);
                else if (priceSort == "cao-den-thap") query = query.OrderByDescending(t => t.Giaban);
            }
            else
            {
                switch (sortBy)
                {
                    case "ban-chay": query = query.OrderBy(t => t.Soluongton); break;
                    case "moi-nhat":
                    default: query = query.OrderByDescending(t => t.Mathuoc); break;
                }
            }

            // 3. PHÂN TRANG (QUAN TRỌNG)
            // Tính tổng số lượng bản ghi trước khi cắt trang
            int totalItems = await query.CountAsync();

            // Tính tổng số trang
            int totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            // Lấy dữ liệu trang hiện tại (Skip & Take)
            var data = await query
                        .Skip((page - 1) * pageSize)
                        .Take(pageSize)
                        .ToListAsync();

            // Trả về Object chứa cả dữ liệu và thông tin phân trang
            return Ok(new
            {
                data = data,
                totalItems = totalItems,
                totalPages = totalPages,
                currentPage = page,
                pageSize = pageSize
            });
        }

        // GET: api/Thuoc/5
        // API này lấy chi tiết 1 sản phẩm theo ID (cho modal)
        [HttpGet("{id}")]
        public async Task<ActionResult<Thuoc>> GetThuoc(int id)
        {
            // Dùng FindAsync là cách nhanh nhất để tìm theo Primary Key
            var thuoc = await _context.Thuocs.FindAsync(id);

            if (thuoc == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm" });
            }

            return Ok(thuoc);
        }
    }
}
