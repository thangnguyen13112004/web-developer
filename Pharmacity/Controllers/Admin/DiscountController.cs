using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacity.Models;
using System.Transactions; // Dùng Transaction để an toàn dữ liệu
using Pharmacity.DTOs.Admin;


namespace Pharmacity.Controllers.Admin
{
    [Route("api/admin/discount")]
    [ApiController]
    [Authorize]
    public class DiscountController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;

        public DiscountController(DB_QuanLyNhaThuoc2Context context)
        {
            _context = context;
        }

        // 1. API: Áp dụng khuyến mãi
        [HttpPost("apply")]
        public async Task<IActionResult> ApplyDiscount([FromBody] DiscountRequestDto dto)
        {
            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    // A. Tạo đợt khuyến mãi mới
                    var campaign = new DotKhuyenMai
                    {
                        TenDotKm = dto.TenDotKM,
                        LoaiApDung = dto.LoaiApDung,
                        GiaTriGiam = dto.PhanTramGiam,
                        NgayBatDau = DateTime.Now,
                        NgayKetThuc = dto.NgayKetThuc,
                        TrangThai = true
                    };
                    _context.DotKhuyenMais.Add(campaign);
                    await _context.SaveChangesAsync();

                    // B. Lấy danh sách thuốc cần giảm giá
                    List<Thuoc> targetProducts = new List<Thuoc>();

                    if (dto.LoaiApDung == "Category")
                    {
                        // Lấy theo danh mục
                        targetProducts = await _context.Thuocs
                            .Where(t => t.Maloai == dto.TargetId).ToListAsync();
                    }
                    else if (dto.LoaiApDung == "CustomGroup")
                    {
                        // Lấy theo danh sách ID sản phẩm gửi lên
                        if (dto.ProductIds == null || !dto.ProductIds.Any())
                            return BadRequest("Chưa chọn sản phẩm nào.");

                        targetProducts = await _context.Thuocs
                            .Where(t => dto.ProductIds.Contains(t.Mathuoc)).ToListAsync();
                    }

                    if (!targetProducts.Any()) return BadRequest("Không tìm thấy sản phẩm phù hợp.");

                    // C. Thực hiện giảm giá và lưu lịch sử
                    foreach (var p in targetProducts)
                    {
                        // 1. Lưu lịch sử
                        var history = new ChiTietKhuyenMai
                        {
                            MaDotKm = campaign.MaDotKm,
                            MaThuoc = p.Mathuoc,
                            GiaGoc = p.Giaban,
                            GiaDaGiam = p.Giaban * (1 - dto.PhanTramGiam / 100.0)
                        };
                        _context.ChiTietKhuyenMais.Add(history);

                        // 2. Cập nhật giá sản phẩm
                        // Logic: Lưu giá cũ vào cột GiaCu (để hiển thị gạch ngang ở FE)
                        // Nếu sản phẩm chưa có giá cũ thì lấy giá bán hiện tại làm giá cũ
                        if (p.Giacu == null || p.Giacu == 0) p.Giacu = p.Giaban;

                        p.Giaban = history.GiaDaGiam.Value;
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new { message = $"Đã áp dụng giảm {dto.PhanTramGiam}% cho {targetProducts.Count} sản phẩm." });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, ex.Message);
                }
            }
        }

        // 2. API: Lấy lịch sử khuyến mãi
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            var data = await _context.DotKhuyenMais
                .OrderByDescending(d => d.NgayBatDau)
                .Select(d => new
                {
                    d.MaDotKm,
                    d.TenDotKm,
                    d.LoaiApDung,
                    d.GiaTriGiam,
                    d.NgayBatDau,
                    SoLuongSanPham = d.ChiTietKhuyenMais.Count
                })
                .ToListAsync();
            return Ok(data);
        }
    }
}
