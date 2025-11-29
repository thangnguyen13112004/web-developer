using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacity.Models;

namespace Pharmacity.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NhanVienController : ControllerBase
    {
        // Biến để chứa DbContext
        private readonly DB_QuanLyNhaThuoc2Context _context;

        // Dùng constructor để inject DbContext
        public NhanVienController(DB_QuanLyNhaThuoc2Context context)
        {
            _context = context;
        }

        // GET: api/NhanVien
        // Hàm này sẽ lấy tất cả nhân viên từ CSDL
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Nhanvien>>> GetNhanViens()
        {
            // Lấy dữ liệu từ Bảng Nhanviens (tương ứng với table 'nhanvien')
            var nhanViens = await _context.Nhanviens.ToListAsync();

            return Ok(nhanViens);
        }
        
    }
}
