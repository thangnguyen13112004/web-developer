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
        public async Task<ActionResult<IEnumerable<Thuoc>>> GetThuocs(
            [FromQuery] int? maloai,      // Lọc theo loại (từ sidebar)
            [FromQuery] string? sortBy,   // Sắp xếp (moi-nhat, ban-chay...)
            [FromQuery] string? priceSort // Sắp xếp giá (thap-den-cao, cao-den-thap)
        )
        {
            // Bắt đầu 1 câu query, chưa thực thi
            var query = _context.Thuocs.AsQueryable();

            // 1. Lọc theo danh mục (nếu có)
            if (maloai.HasValue)
            {
                query = query.Where(t => t.Maloai == maloai.Value);
            }

            // 2. Sắp xếp theo giá (ưu tiên)
            if (!string.IsNullOrEmpty(priceSort))
            {
                if (priceSort == "thap-den-cao")
                {
                    query = query.OrderBy(t => t.Giaban);
                }
                else if (priceSort == "cao-den-thap")
                {
                    query = query.OrderByDescending(t => t.Giaban);
                }
            }
            else
            {
                // 3. Sắp xếp mặc định (nếu không sắp xếp theo giá)
                switch (sortBy)
                {
                    case "ban-chay":
                        // (Nâng cao): Bạn sẽ cần join với bảng Chitietdonhang
                        // Tạm thời, chúng ta sắp xếp theo số lượng tồn kho (giả định)
                        query = query.OrderBy(t => t.Soluongton);
                        break;

                    case "moi-nhat":
                    default:
                        // Sắp xếp theo mathuoc giảm dần (giả định ID cao là mới nhất)
                        query = query.OrderByDescending(t => t.Mathuoc);
                        break;
                }
            }

            // Thực thi câu query và trả về kết quả
            var thuocs = await query.ToListAsync();
            return Ok(thuocs);
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
