using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Threading.Tasks;
using Pharmacity.Models;
using Pharmacity.DTOs.Admin;

namespace Pharmacity.Controllers.Admin
{
    [Route("api/admin/database")]
    [ApiController]
    [Authorize(Roles = "Admin")] // ← XÓA [AllowAnonymous]
    public class DatabaseController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;
        private readonly string _backupFolder = @"D:\KLTN\PharmacityBackups\";

        public DatabaseController(DB_QuanLyNhaThuoc2Context context)
        {
            _context = context;
        }

        [HttpPost("backup")]
        public async Task<IActionResult> BackupDatabase()
        {
            try
            {
                if (!Directory.Exists(_backupFolder))
                    Directory.CreateDirectory(_backupFolder);

                string dbName = "DB_QuanLyNhaThuoc2";
                string fileName = $"{dbName}_{DateTime.Now:yyyyMMdd_HHmmss}.bak";
                string fullPath = Path.Combine(_backupFolder, fileName);

                string sql = $"BACKUP DATABASE [{dbName}] TO DISK = '{fullPath}' WITH FORMAT, MEDIANAME = 'Z_SQLServerBackups', NAME = 'Full Backup of {dbName}';";

                await _context.Database.ExecuteSqlRawAsync(sql);

                return Ok(new { message = "Sao lưu thành công!", path = fullPath, fileName = fileName });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { message = "Lỗi sao lưu: " + ex.Message });
            }
        }

        [HttpPost("restore")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> RestoreDatabase(IFormFile file) // ← XÓA [FromForm]
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn file .bak" });

            string dbName = "DB_QuanLyNhaThuoc2";

            if (!Directory.Exists(_backupFolder))
                Directory.CreateDirectory(_backupFolder);

            string tempPath = Path.Combine(_backupFolder, "Restore_Temp.bak");

            try
            {
                using (var stream = new FileStream(tempPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                string sql = $@"
                    USE master;
                    ALTER DATABASE [{dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                    RESTORE DATABASE [{dbName}] FROM DISK = '{tempPath}' WITH REPLACE;
                    ALTER DATABASE [{dbName}] SET MULTI_USER;
                ";

                await _context.Database.ExecuteSqlRawAsync(sql);

                return Ok(new { message = "Phục hồi dữ liệu thành công! Vui lòng đăng nhập lại." });
            }
            catch (Exception ex)
            {
                try
                {
                    await _context.Database.ExecuteSqlRawAsync($"ALTER DATABASE [{dbName}] SET MULTI_USER;");
                }
                catch { }

                return StatusCode(500, new { message = "Lỗi phục hồi: " + ex.Message });
            }
        }

        // 1. BACKUP DỮ LIỆU ĐƠN HÀNG (Quan trọng nhất - Liên quan tiền)
        [HttpPost("backup/orders")]
        public async Task<IActionResult> BackupOrders([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                if (!Directory.Exists(_backupFolder)) Directory.CreateDirectory(_backupFolder);

                var orders = await _context.Donhangs
                    .Include(d => d.Chitietdonhangs)
                    .Include(d => d.Thanhtoans)
                    .Include(d => d.MakhNavigation)
                    .Include(d => d.MadcNavigation) // <--- QUAN TRỌNG: Include bảng địa chỉ
                    .Where(d => (!fromDate.HasValue || d.Ngaydat >= fromDate) &&
                                (!toDate.HasValue || d.Ngaydat <= toDate))
                    .ToListAsync();

                string fileName = $"Orders_{DateTime.Now:yyyyMMdd_HHmmss}.json";
                string fullPath = Path.Combine(_backupFolder, fileName);

                var data = new
                {
                    BackupDate = DateTime.Now,
                    Range = new { From = fromDate, To = toDate },
                    TotalOrders = orders.Count,
                    Orders = orders.Select(d => new {
                        d.Madh,
                        KhachHang = d.MakhNavigation?.Hoten,
                        d.Ngaydat,
                        d.Tongtien,
                        d.Trangthai,
                        // --- SỬA LỖI Ở ĐÂY: Ghép chuỗi địa chỉ từ bảng SoDiaChi ---
                        DiaChiGiaoHang = d.MadcNavigation != null
                            ? $"{d.MadcNavigation.SonhaDuong}, {d.MadcNavigation.Phuongxa}, {d.MadcNavigation.Quanhuyen}, {d.MadcNavigation.Tinhthanh} (Người nhận: {d.MadcNavigation.HotenNhan} - {d.MadcNavigation.SdtNhan})"
                            : "Tại quầy / Không có địa chỉ",

                        ChiTiet = d.Chitietdonhangs.Select(ct => new {
                            ct.Malo,
                            ct.Soluong,
                            ct.Dongia,
                            ct.Thanhtien
                        }),
                        ThanhToan = d.Thanhtoans.Select(tt => new {
                            tt.Phuongthuc,
                            tt.Trangthai,
                            tt.Ngaytt
                        })
                    })
                };

                await SaveJsonToFile(data, fullPath);
                return Ok(new { message = $"Đã sao lưu {orders.Count} đơn hàng", path = fullPath });
            }
            catch (Exception ex) { return StatusCode(500, new { message = "Lỗi: " + ex.Message }); }
        }

        // 2. BACKUP PHIẾU NHẬP (GIỮ NGUYÊN - ĐÚNG)
        [HttpPost("backup/import-receipts")]
        public async Task<IActionResult> BackupImportReceipts([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                if (!Directory.Exists(_backupFolder)) Directory.CreateDirectory(_backupFolder);

                var receipts = await _context.Phieunhaphangs
                    .Include(p => p.Chitietphieunhaps)
                    .Include(p => p.ManccNavigation)
                    .Include(p => p.ManvNavigation)
                    .Where(p => (!fromDate.HasValue || p.Ngaynhap >= fromDate) &&
                                (!toDate.HasValue || p.Ngaynhap <= toDate))
                    .ToListAsync();

                string fileName = $"ImportReceipts_{DateTime.Now:yyyyMMdd_HHmmss}.json";
                string fullPath = Path.Combine(_backupFolder, fileName);

                var data = new
                {
                    BackupDate = DateTime.Now,
                    TotalReceipts = receipts.Count,
                    Receipts = receipts.Select(p => new {
                        p.Mapn,
                        NhaCungCap = p.ManccNavigation?.Tenncc,
                        NguoiNhap = p.ManvNavigation?.Hoten,
                        p.Ngaynhap,
                        p.Tongtien,
                        p.Ghichu,
                        ChiTiet = p.Chitietphieunhaps.Select(ct => new {
                            ct.Mathuoc,
                            ct.Solo,
                            ct.Ngaysanxuat,
                            ct.Hansudung,
                            ct.Soluong,
                            ct.Dongia
                        })
                    })
                };

                await SaveJsonToFile(data, fullPath);
                return Ok(new { message = $"Đã sao lưu {receipts.Count} phiếu nhập", path = fullPath });
            }
            catch (Exception ex) { return StatusCode(500, new { message = "Lỗi: " + ex.Message }); }
        }

        // 3. BACKUP SẢN PHẨM (SỬA LỖI TÊN THUỘC TÍNH)
        [HttpPost("backup/products")]
        public async Task<IActionResult> BackupProducts()
        {
            try
            {
                if (!Directory.Exists(_backupFolder)) Directory.CreateDirectory(_backupFolder);

                var products = await _context.Thuocs
                    .Include(t => t.MaloaiNavigation)
                    .ToListAsync();

                string fileName = $"Products_{DateTime.Now:yyyyMMdd_HHmmss}.json";
                string fullPath = Path.Combine(_backupFolder, fileName);

                var data = new
                {
                    BackupDate = DateTime.Now,
                    TotalProducts = products.Count,
                    Products = products.Select(t => new {
                        t.Mathuoc,
                        t.Tenthuoc,
                        t.Hoatchat,
                        t.Sodangky,
                        QuyCach = t.Quycachdonggoi, // <--- SỬA LỖI Ở ĐÂY (t.Quycach -> t.Quycachdonggoi)
                        t.Donvitinh,
                        t.Giaban,
                        t.Soluongton,
                        t.Nhasx,
                        DanhMuc = t.MaloaiNavigation?.Tenloai
                    })
                };

                await SaveJsonToFile(data, fullPath);
                return Ok(new { message = $"Đã sao lưu {products.Count} sản phẩm", path = fullPath });
            }
            catch (Exception ex) { return StatusCode(500, new { message = "Lỗi: " + ex.Message }); }
        }

        // 4. BACKUP NHÂN VIÊN (ĐÚNG)
        [HttpPost("backup/employees")]
        public async Task<IActionResult> BackupEmployees()
        {
            try
            {
                if (!Directory.Exists(_backupFolder)) Directory.CreateDirectory(_backupFolder);
                var employees = await _context.Nhanviens.ToListAsync();
                string fileName = $"Employees_{DateTime.Now:yyyyMMdd_HHmmss}.json";
                string fullPath = Path.Combine(_backupFolder, fileName);

                var data = new
                {
                    BackupDate = DateTime.Now,
                    TotalEmployees = employees.Count,
                    Employees = employees.Select(nv => new {
                        nv.Manv,
                        nv.Hoten,
                        nv.Chucvu,
                        nv.Taikhoan,
                        nv.Trangthai,
                        nv.Ngaytao
                    })
                };
                await SaveJsonToFile(data, fullPath);
                return Ok(new { message = $"Đã sao lưu {employees.Count} nhân viên", path = fullPath });
            }
            catch (Exception ex) { return StatusCode(500, new { message = "Lỗi: " + ex.Message }); }
        }

        // Helper function để ghi file
        private async Task SaveJsonToFile(object data, string path)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(data, new System.Text.Json.JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });
            await System.IO.File.WriteAllTextAsync(path, json);
        }


        [HttpPost("restore/employees")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> RestoreEmployeesFromJson(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn file .json" });

            try
            {
                // 1. Đọc nội dung file JSON
                string jsonContent;
                using (var reader = new StreamReader(file.OpenReadStream()))
                {
                    jsonContent = await reader.ReadToEndAsync();
                }

                // 2. Deserialize JSON thành Objects
                // Lưu ý: Cấu trúc class này phải khớp với cấu trúc lúc Backup
                var dataWrapper = System.Text.Json.JsonSerializer.Deserialize<EmployeeBackupWrapper>(jsonContent, new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (dataWrapper?.Employees == null)
                    return BadRequest(new { message = "File JSON không đúng định dạng hoặc không có dữ liệu nhân viên." });

                int updatedCount = 0;
                int newCount = 0;

                using (var transaction = _context.Database.BeginTransaction())
                {
                    try
                    {
                        foreach (var empDto in dataWrapper.Employees)
                        {
                            // Kiểm tra nhân viên đã tồn tại chưa
                            var existingEmp = await _context.Nhanviens.FindAsync(empDto.Manv);

                            if (existingEmp != null)
                            {
                                // UPDATE: Nếu đã có thì cập nhật thông tin
                                existingEmp.Hoten = empDto.Hoten;
                                existingEmp.Chucvu = empDto.Chucvu;
                                existingEmp.Taikhoan = empDto.Taikhoan;
                                existingEmp.Trangthai = empDto.Trangthai;
                                // Lưu ý: Không update mật khẩu vì file backup JSON đã che mật khẩu ("***")
                                updatedCount++;
                            }
                            else
                            {
                                // INSERT: Nếu chưa có thì thêm mới
                                var newEmp = new Nhanvien
                                {
                                    Manv = empDto.Manv,
                                    Hoten = empDto.Hoten,
                                    Chucvu = empDto.Chucvu,
                                    Taikhoan = empDto.Taikhoan,
                                    Matkhau = "123456", // Mật khẩu mặc định khi restore
                                    Trangthai = empDto.Trangthai,
                                    Ngaytao = empDto.Ngaytao ?? DateTime.Now
                                };
                                _context.Nhanviens.Add(newEmp);
                                // Cần bật Identity Insert nếu Manv là tự tăng, nhưng ở đây ta giả định Manv nhập tay hoặc set cứng
                                // Nếu Manv là Identity, bạn phải dùng: _context.Database.ExecuteSqlRaw("SET IDENTITY_INSERT nhanvien ON");
                                newCount++;
                            }
                        }

                        // Nếu cột Manv là Identity (Tự tăng), cần xử lý đặc biệt. 
                        // Ở đây ta dùng EF Core lưu bình thường (giả sử Manv không phải Identity hoặc EF tự xử lý key)
                        //if (newCount > 0)
                        //{
                        //    // Bật cho phép chèn ID thủ công (nếu SQL Server chặn)
                        //    await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT nhanvien ON");
                        //    await _context.SaveChangesAsync();
                        //    await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT nhanvien OFF");
                        //}
                        //else
                        //{
                        //    await _context.SaveChangesAsync();
                        //}
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                    }
                    catch (Exception)
                    {
                        await transaction.RollbackAsync();
                        throw; // Ném ra để catch bên ngoài
                    }
                }

                return Ok(new { message = $"Phục hồi thành công! Cập nhật: {updatedCount}, Thêm mới: {newCount}. (Mật khẩu nhân viên mới là 123456)" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi đọc file JSON: " + ex.Message });
            }
        }
    }
}