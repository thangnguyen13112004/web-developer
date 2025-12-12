using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacity.DTOs.Admin;
using Pharmacity.Models;

namespace Pharmacity.Controllers.Admin
{
    [Route("api/admin/Warehouse")]
    [ApiController]
    [Authorize]
    public class WarehouseController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;

        public WarehouseController(DB_QuanLyNhaThuoc2Context context)
        {
            _context = context;
        }

        // GET: Lấy danh sách NCC
        [HttpGet("suppliers")]
        public async Task<ActionResult<IEnumerable<SupplierDto>>> GetSuppliers()
        {
            var sups = await _context.Nhacungcaps
                .Select(n => new SupplierDto
                {
                    MaNCC = n.Mancc,
                    TenNCC = n.Tenncc,
                    // --- BỔ SUNG LẤY DỮ LIỆU ---
                    DiaChi = n.Diachi,
                    SDT = n.Sdt
                })
                .ToListAsync();
            return Ok(sups);
        }

        // POST: Tạo phiếu nhập
        [HttpPost("import")]
        public async Task<IActionResult> CreateImportReceipt([FromBody] ImportReceiptDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // --- XỬ LÝ MÃ NHÂN VIÊN ---
            // Cách 1: Lấy từ Token (nếu đã đăng nhập)
            var userIdClaim = User.FindFirst("id")?.Value;
            int maNv = userIdClaim != null ? int.Parse(userIdClaim) : 1;

            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    // --- BƯỚC 1: TẠO HEADER PHIẾU NHẬP ---
                    int newMaPN = (_context.Phieunhaphangs.Max(p => (int?)p.Mapn) ?? 0) + 1;

                    var phieuNhap = new Phieunhaphang
                    {
                        Mapn = newMaPN,
                        Mancc = model.MaNCC,
                        Manv = maNv, // Đã được tính ở trên
                        Ngaynhap = DateTime.Now, // Ngày giờ hiện tại
                        Ghichu = model.GhiChu,
                        Tongtien = model.ChiTiet.Sum(x => x.SoLuong * x.DonGiaNhap)
                    };

                    _context.Phieunhaphangs.Add(phieuNhap);
                    await _context.SaveChangesAsync();

                    // --- BƯỚC 2: GỌI PROCEDURE CHO TỪNG DÒNG ---
                    foreach (var item in model.ChiTiet)
                    {
                        // Validate cơ bản
                        if (item.HanSuDung <= item.NgaySanXuat)
                            throw new Exception($"Sản phẩm {item.MaThuoc}: Hạn sử dụng phải lớn hơn ngày sản xuất");

                        var sql = "EXEC sp_ThemChiTietPhieuNhap @p0, @p1, @p2, @p3, @p4, @p5, @p6";

                        // Gọi SQL -> Nếu vi phạm logic (trùng lô khác date), SQL sẽ throw error
                        await _context.Database.ExecuteSqlRawAsync(sql,
                            newMaPN,            // p0
                            item.MaThuoc,       // p1
                            item.SoLo.ToUpper(),// p2 (Chuẩn hóa chữ hoa)
                            item.NgaySanXuat,   // p3
                            item.HanSuDung,     // p4
                            item.SoLuong,       // p5
                            item.DonGiaNhap     // p6
                        );
                    }

                    await transaction.CommitAsync();
                    return Ok(new { message = "Nhập hàng thành công!", mapn = newMaPN });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    // Trả về đúng thông báo lỗi từ SQL (vd: Lô đã tồn tại...)
                    // InnerException thường chứa message từ RAISERROR của SQL
                    var msg = ex.InnerException?.Message ?? ex.Message;
                    return BadRequest(new { message = msg });
                }
            }
        }

        // --- API MỚI: LẤY DANH SÁCH LÔ THUỐC ---
        [HttpGet("lots")]
        public async Task<ActionResult<IEnumerable<LotReadDto>>> GetAllLots()
        {
            var lots = await _context.Lothuocs
                .Include(l => l.MathuocNavigation) // Join bảng Thuốc
                .Include(l => l.ManccNavigation)   // Join bảng NCC
                .Include(l => l.Tonkhos)           // Join bảng Tồn kho để lấy số lượng còn lại
                .Select(l => new LotReadDto
                {
                    MaLo = l.Malo,
                    TenThuoc = l.MathuocNavigation.Tenthuoc,
                    SoLo = l.Solo,
                    NSX = l.Ngaysanxuat,
                    HSD = l.Hansudung,
                    SoLuongNhap = l.Soluongnhap,
                    // Tính tổng tồn kho của lô này (nếu có nhiều kho thì sum lại)
                    TonKhoHienTai = l.Tonkhos.Sum(tk => tk.Soluongton),
                    DonGiaNhap = l.Dongianhap,
                    TenNCC = l.ManccNavigation.Tenncc,
                    NgayNhap = l.Ngaynhap
                })
                .OrderByDescending(l => l.NgayNhap) // Lô mới nhập hiện lên đầu
                .ToListAsync();

            return Ok(lots);
        }


        // --- API MỚI: XÓA LÔ THUỐC ---
        // --- API XÓA LÔ (ĐÃ CẬP NHẬT) ---
        [HttpDelete("lots/{id}")]
        public async Task<IActionResult> DeleteLot(int id)
        {
            var lot = await _context.Lothuocs.FindAsync(id);
            if (lot == null) return NotFound(new { message = "Không tìm thấy lô thuốc" });

            // Kiểm tra ràng buộc bán hàng
            bool hasSold = await _context.Chitietdonhangs.AnyAsync(ct => ct.Malo == id);
            if (hasSold)
            {
                return BadRequest(new { message = "Không thể xóa: Lô thuốc này đã phát sinh đơn hàng bán ra." });
            }

            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    // 1. Xóa Tồn Kho (Trigger sẽ chạy tại đây)
                    // Lưu ý: Trigger đã được fix lỗi NULL ở bước trên
                    var tonKhos = _context.Tonkhos.Where(tk => tk.Malo == id);
                    _context.Tonkhos.RemoveRange(tonKhos);
                    await _context.SaveChangesAsync(); // Lưu để kích hoạt trigger cập nhật bảng Thuoc

                    // 2. Xóa Lịch sử nhập (chitietphieunhap)
                    // Cần tìm chính xác mathuoc + solo vì bảng này không có malo
                    var chiTietNhaps = _context.Chitietphieunhaps
                        .Where(ct => ct.Mathuoc == lot.Mathuoc && ct.Solo == lot.Solo);
                    _context.Chitietphieunhaps.RemoveRange(chiTietNhaps);
                    await _context.SaveChangesAsync();

                    // 3. Xóa Lô
                    _context.Lothuocs.Remove(lot);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return Ok(new { message = "Đã xóa lô thuốc thành công" });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    // Lấy lỗi chi tiết nhất từ SQL để hiển thị
                    var errorMsg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                    return StatusCode(500, new { message = "Lỗi server: " + errorMsg });
                }
            }
        }

        // --- API MỚI: Lấy danh sách phiếu nhập ---
        [HttpGet("receipts")]
        public async Task<ActionResult<IEnumerable<dynamic>>> GetImportReceipts()
        {
            var receipts = await _context.Phieunhaphangs
                .Include(p => p.ManccNavigation)
                .Include(p => p.ManvNavigation)
                .OrderByDescending(p => p.Ngaynhap)
                .Select(p => new
                {
                    p.Mapn,
                    TenNCC = p.ManccNavigation.Tenncc,
                    NguoiNhap = p.ManvNavigation.Hoten,
                    p.Ngaynhap,
                    p.Tongtien,
                    p.Ghichu
                })
                .ToListAsync();

            return Ok(receipts);
        }

        // --- API MỚI: Lấy chi tiết phiếu nhập (để in) ---
        [HttpGet("receipts/{id}")]
        public async Task<ActionResult<dynamic>> GetImportReceiptDetail(int id)
        {
            var receipt = await _context.Phieunhaphangs
                .Include(p => p.ManccNavigation)
                .Include(p => p.ManvNavigation)
                .Include(p => p.Chitietphieunhaps) // Join bảng chi tiết
                    .ThenInclude(ct => ct.MathuocNavigation) // Join thuốc để lấy tên
                .FirstOrDefaultAsync(p => p.Mapn == id);

            if (receipt == null) return NotFound(new { message = "Không tìm thấy phiếu nhập" });

            var result = new
            {
                receipt.Mapn,       // Sửa p.Mapn -> receipt.Mapn
                receipt.Ngaynhap,   // Sửa p.Ngaynhap -> receipt.Ngaynhap
                receipt.Ghichu,     // Sửa p.Ghichu -> receipt.Ghichu
                MaNCC = receipt.Mancc,
                TenNCC = receipt.ManccNavigation.Tenncc,
                NguoiNhap = receipt.ManvNavigation.Hoten,
                TongTien = receipt.Tongtien,
                ChiTiet = receipt.Chitietphieunhaps.Select(ct => new
                {
                    MaThuoc = ct.Mathuoc,
                    TenThuoc = ct.MathuocNavigation.Tenthuoc,
                    DVT = ct.MathuocNavigation.Donvitinh,
                    SoLo = ct.Solo,
                    NgaySanXuat = ct.Ngaysanxuat,
                    HanSuDung = ct.Hansudung,
                    SoLuong = ct.Soluong,
                    DonGiaNhap = ct.Dongia,
                    ThanhTien = ct.Soluong * ct.Dongia
                }).ToList()
            };

            return Ok(result);
        }

        // [DELETE] Xóa phiếu nhập
        [HttpDelete("receipts/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteImportReceipt(int id)
        {
            var phieuNhap = await _context.Phieunhaphangs
                .Include(p => p.Chitietphieunhaps)
                .FirstOrDefaultAsync(p => p.Mapn == id);

            if (phieuNhap == null) return NotFound(new { message = "Phiếu nhập không tồn tại" });

            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    foreach (var ct in phieuNhap.Chitietphieunhaps)
                    {
                        // Tìm lô thuốc (dựa trên MaThuoc + SoLo)
                        var loThuoc = await _context.Lothuocs
                            .Include(l => l.Tonkhos)
                            .FirstOrDefaultAsync(l => l.Mathuoc == ct.Mathuoc && l.Solo == ct.Solo);

                        if (loThuoc != null)
                        {
                            // CHECK 1: Đã bán chưa? (Kiểm tra trong chi tiết đơn hàng)
                            bool daBan = await _context.Chitietdonhangs.AnyAsync(cd => cd.Malo == loThuoc.Malo);
                            if (daBan)
                            {
                                return BadRequest(new { message = $"Không thể xóa: Thuốc '{ct.Mathuoc}' (Lô {ct.Solo}) đã phát sinh giao dịch bán hàng." });
                            }

                            // CHECK 2: Tồn kho có đủ để trừ không?
                            int currentStock = loThuoc.Tonkhos.Sum(t => t.Soluongton);
                            if (currentStock < ct.Soluong)
                            {
                                return BadRequest(new { message = $"Lỗi dữ liệu: Tồn kho hiện tại ({currentStock}) nhỏ hơn số lượng nhập ban đầu ({ct.Soluong})." });
                            }

                            // Xóa tồn kho
                            _context.Tonkhos.RemoveRange(loThuoc.Tonkhos);

                            // Xóa lô thuốc (Chỉ xóa được vì đã check daBan == false ở trên)
                            _context.Lothuocs.Remove(loThuoc);
                        }
                    }

                    // Xóa chi tiết phiếu nhập
                    _context.Chitietphieunhaps.RemoveRange(phieuNhap.Chitietphieunhaps);

                    // Xóa phiếu nhập
                    _context.Phieunhaphangs.Remove(phieuNhap);

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new { message = "Đã xóa phiếu nhập thành công." });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = "Lỗi: " + ex.Message });
                }
            }
        }
    }
}

