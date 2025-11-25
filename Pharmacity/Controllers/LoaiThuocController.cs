using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacity.Models;

namespace Pharmacity.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoaiThuocController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;

        public LoaiThuocController(DB_QuanLyNhaThuoc2Context context)
        {
            _context = context;
        }

        // GET: api/LoaiThuoc
        // API này lấy tất cả các loại thuốc
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Loaithuoc>>> GetLoaiThuocs()
        {
            // Lấy dữ liệu từ bảng Loaithuocs
            var categories = await _context.Loaithuocs.ToListAsync();

            return Ok(categories);
        }
    }
}
