using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pharmacity.DTOs.Admin;
using Pharmacity.Models;
using Microsoft.EntityFrameworkCore;

namespace Pharmacity.Controllers.Admin
{
    [Route("api/admin/employees")]
    [ApiController]
    [Authorize(Roles = "Admin, Manager")]
    public class EmployeesController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;

        public EmployeesController(DB_QuanLyNhaThuoc2Context context)
        {
            _context = context;
        }

        // 1. LẤY DANH SÁCH
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeReadDto>>> GetAll()
        {
            var list = await _context.Nhanviens
                .Select(n => new EmployeeReadDto
                {
                    MaNV = n.Manv,
                    HoTen = n.Hoten,
                    ChucVu = n.Chucvu,
                    TaiKhoan = n.Taikhoan,
                    TrangThai = n.Trangthai ?? true,
                    NgayTao = n.Ngaytao ?? DateTime.Now
                })
                .ToListAsync();
            return Ok(list);
        }

        // 2. THÊM NHÂN VIÊN
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmployeeCreateDto model)
        {
            if (await _context.Nhanviens.AnyAsync(n => n.Taikhoan == model.TaiKhoan))
                return BadRequest(new { message = "Tài khoản đã tồn tại" });

            int newId = (_context.Nhanviens.Max(n => (int?)n.Manv) ?? 0) + 1;

            var nv = new Nhanvien
            {
                Manv = newId,
                Hoten = model.HoTen,
                Chucvu = model.ChucVu,
                Taikhoan = model.TaiKhoan,
                Matkhau = model.MatKhau,
                Trangthai = true,
                Ngaytao = DateTime.Now
            };

            _context.Nhanviens.Add(nv);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm nhân viên thành công", id = newId });
        }

        // 3. KHÓA/MỞ KHÓA TÀI KHOẢN
        [HttpPut("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var nv = await _context.Nhanviens.FindAsync(id);
            if (nv == null) return NotFound();

            // Không cho phép tự khóa chính mình
            var currentUserId = int.Parse(User.FindFirst("id").Value);
            if (nv.Manv == currentUserId) return BadRequest(new { message = "Không thể khóa chính mình" });

            nv.Trangthai = !(nv.Trangthai ?? true);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var nv = await _context.Nhanviens.FindAsync(id);
            if (nv == null) return NotFound();

            // Kiểm tra ràng buộc dữ liệu (Tham chiếu đến nhân viên)
            bool hasImports = await _context.Phieunhaphangs.AnyAsync(p => p.Manv == id);
            bool hasPayments = await _context.Thanhtoans.AnyAsync(t => t.Manv == id);
            bool hasOrders = await _context.Dondathangs.AnyAsync(d => d.Manv == id); // Lưu ý: Dondathang khác Donhang
            bool hasReports = await _context.Baocaos.AnyAsync(b => b.Manv == id);

            if (hasImports || hasPayments || hasOrders || hasReports)
            {
                return BadRequest(new { message = "Không thể xóa: Nhân viên đã có dữ liệu nghiệp vụ. Hãy khóa tài khoản thay vì xóa." });
            }

            // Xóa phân quyền trước (bảng phanquyen)
            var quyens = await _context.Quyentruycaps.Where(pq => pq.Maquyen == id).ToListAsync();
            _context.Quyentruycaps.RemoveRange(quyens);

            // Xóa nhân viên
            _context.Nhanviens.Remove(nv);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa nhân viên vĩnh viễn." });
        }
    }
}
