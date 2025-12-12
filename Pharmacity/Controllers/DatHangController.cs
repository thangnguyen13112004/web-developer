using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pharmacity.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Pharmacity.DTOs;
using Neo4j.Driver; // 1. Thêm thư viện Neo4j

namespace Pharmacity.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatHangController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;
        private readonly IDriver _driver; // 2. Inject Driver Neo4j

        public DatHangController(DB_QuanLyNhaThuoc2Context context, IDriver driver)
        {
            _context = context;
            _driver = driver; 
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (claim == null) throw new Exception("Unauthorized");
            return int.Parse(claim.Value);
        }

        [HttpPost]
        public async Task<IActionResult> Checkout([FromBody] CheckoutDto model)
        {
            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    int userId = GetCurrentUserId();

                    // 1. Tìm giỏ hàng hiện tại (Trạng thái GioHang)
                    var cart = await _context.Donhangs
                        .Include(d => d.Chitietdonhangs)
                        .FirstOrDefaultAsync(d => d.Makh == userId && d.Trangthai == "GioHang");

                    if (cart == null || !cart.Chitietdonhangs.Any())
                        return BadRequest(new { message = "Giỏ hàng trống." });

                    // 2. Xác định các item cần thanh toán
                    List<Chitietdonhang> itemsToCheckout = new List<Chitietdonhang>();

                    // Nếu người dùng chọn cụ thể sản phẩm (checkbox)
                    if (model.SelectedMalos != null && model.SelectedMalos.Any())
                    {
                        itemsToCheckout = cart.Chitietdonhangs
                            .Where(ct => model.SelectedMalos.Contains(ct.Malo))
                            .ToList();

                        if (!itemsToCheckout.Any())
                            return BadRequest(new { message = "Vui lòng chọn ít nhất một sản phẩm để thanh toán." });
                    }
                    else
                    {
                        // Nếu không gửi list (hoặc list rỗng) -> Mặc định mua hết (giữ logic cũ nếu cần)
                        itemsToCheckout = cart.Chitietdonhangs.ToList();
                    }

                    // 3. Kiểm tra địa chỉ
                    var address = await _context.SoDiaChis
                        .FirstOrDefaultAsync(a => a.Madc == model.MaDC && a.Makh == userId);
                    if (address == null) return BadRequest(new { message = "Địa chỉ không hợp lệ." });


                    // 4. XỬ LÝ TÁCH ĐƠN HÀNG (QUAN TRỌNG)
                    Donhang finalOrder;

                    // Kiểm tra xem có mua hết giỏ hàng không
                    bool buyingAll = itemsToCheckout.Count == cart.Chitietdonhangs.Count;

                    if (buyingAll)
                    {
                        // Nếu mua hết: Dùng luôn giỏ hàng hiện tại làm đơn hàng
                        finalOrder = cart;
                    }
                    else
                    {
                        // Nếu chỉ mua một phần: TẠO ĐƠN HÀNG MỚI
                        int newOrderId = (_context.Donhangs.Max(d => (int?)d.Madh) ?? 0) + 1;
                        finalOrder = new Donhang
                        {
                            Madh = newOrderId,
                            Makh = userId,
                            Ngaydat = DateTime.Now,
                            Trangthai = "GioHang", // Tạm để vậy, sẽ đổi status ở dưới
                            Tongtien = 0
                        };
                        _context.Donhangs.Add(finalOrder);
                        await _context.SaveChangesAsync(); // Lưu để có ID

                        // CHUYỂN CÁC ITEM ĐƯỢC CHỌN SANG ĐƠN HÀNG MỚI
                        foreach (var item in itemsToCheckout)
                        {
                            // Cập nhật MaDH của item sang đơn hàng mới
                            // Vì EF Core tracking, việc đổi MaDH sẽ tự động update DB khi SaveChanges
                            // Tuy nhiên, vì đây là khóa chính phức hợp (Madh, Malo), ta phải xóa cũ thêm mới
                            // Hoặc thực thi SQL trực tiếp để update cho nhanh và tránh lỗi khóa ngoại

                            _context.Chitietdonhangs.Remove(item); // Xóa khỏi giỏ cũ
                            await _context.SaveChangesAsync();

                            var newItem = new Chitietdonhang
                            {
                                Madh = newOrderId,
                                Malo = item.Malo,
                                Soluong = item.Soluong,
                                Dongia = item.Dongia
                                // Thanhtien là computed column
                            };
                            _context.Chitietdonhangs.Add(newItem);
                        }
                        await _context.SaveChangesAsync();
                    }

                    // 5. Cập nhật thông tin đơn hàng cuối cùng (finalOrder)
                    finalOrder.Trangthai = "Chờ xử lý";
                    finalOrder.Ngaydat = DateTime.Now;
                    finalOrder.Madc = model.MaDC;

                    // Recalculate Total cho đơn hàng chốt
                    // Lưu ý: Phải dùng query mới để lấy giá trị Thanhtien (computed) chính xác
                    var finalItems = await _context.Chitietdonhangs.Where(x => x.Madh == finalOrder.Madh).ToListAsync();
                    finalOrder.Tongtien = finalItems.Sum(ct => ct.Dongia * ct.Soluong);


                    // 6. Tạo thanh toán
                    int nextMatt = (_context.Thanhtoans.Max(t => (int?)t.Matt) ?? 0) + 1;

                    var payment = new Thanhtoan
                    {
                        Matt = nextMatt,
                        Madh = finalOrder.Madh,
                        Manv = null,
                        Phuongthuc = model.PhuongThucTT,
                        Trangthai = model.PhuongThucTT == "cod" ? "Chờ thanh toán" : "Đã thanh toán",
                        Ngaytt = DateTime.Now
                    };
                    _context.Thanhtoans.Add(payment);

                    // 7. Cập nhật lại tổng tiền cho Giỏ hàng cũ (nếu tách đơn)
                    if (!buyingAll)
                    {
                        // Giỏ hàng cũ (cart) đã bị mất item, cần tính lại tổng tiền hiển thị (nếu cần)
                        // Logic update cart header nếu bạn có lưu Tongtien ở header
                    }

                    await _context.SaveChangesAsync();
                    // -----------------------------------------------------------
                    // BẮT ĐẦU ĐOẠN CODE TỰ ĐỘNG ĐỒNG BỘ NEO4J (REAL-TIME)
                    // -----------------------------------------------------------

                    // Lấy thông tin User
                    var user = await _context.Khachhangs.FindAsync(userId);
                    string userName = user != null ? user.Hoten : "Unknown";

                    // Mở session Neo4j (Không await session để tránh block response lâu, hoặc await nếu muốn đảm bảo)
                    await SyncOrderToNeo4j(userId, userName, finalOrder);

                    // -----------------------------------------------------------
                    // KẾT THÚC ĐỒNG BỘ
                    // -----------------------------------------------------------
                    await transaction.CommitAsync();

                    return Ok(new { message = "Đặt hàng thành công!", orderId = finalOrder.Madh });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = "Lỗi: " + ex.Message });
                }
            }
        }
        // Hàm phụ trợ để ghi vào Neo4j

        private async Task SyncOrderToNeo4j(int userId, string userName, Donhang order)
        {
            using var session = _driver.AsyncSession();

            try
            {
                // 1. Lấy dữ liệu chi tiết kèm Include đầy đủ để tránh NullReference
                var items = await _context.Chitietdonhangs
                                    .Where(ct => ct.Madh == order.Madh)
                                    .Include(ct => ct.MaloNavigation)       // Include Lô
                                    .ThenInclude(l => l.MathuocNavigation)  // Include Thuốc từ Lô
                                    .ToListAsync();

                if (!items.Any()) return;

                foreach (var item in items)
                {
                    // Kiểm tra null để tránh lỗi 500 "Object reference..."
                    if (item.MaloNavigation == null || item.MaloNavigation.MathuocNavigation == null)
                    {
                        continue; // Bỏ qua item lỗi
                    }

                    var product = item.MaloNavigation.MathuocNavigation;

                    // 2. Query gộp: Đảm bảo CẢ User VÀ Product đều tồn tại rồi mới tạo quan hệ
                    // Sử dụng MERGE cho User ở đây luôn để chắc chắn nó có mặt
                    var query = @"
                MERGE (u:User {id: $uid})
                ON CREATE SET u.name = $uname
                
                MERGE (p:Product {id: $pid})
                ON CREATE SET p.name = $pname, p.category = $pcat
                
                MERGE (u)-[r:BOUGHT]->(p)
                ON CREATE SET r.orderId = $oid, r.qty = $qty, r.date = datetime($dateStr)
                ON MATCH SET r.qty = r.qty + $qty, r.date = datetime($dateStr)
            ";

                    await session.RunAsync(query, new
                    {
                        uid = userId,
                        uname = userName,
                        pid = product.Mathuoc,
                        pname = product.Tenthuoc,
                        pcat = product.Maloai ?? 0, // Handle null category
                        oid = order.Madh,
                        qty = item.Soluong,
                        dateStr = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss") // Format ISO 8601 cho Neo4j
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Neo4j Sync Error: {ex.Message} - {ex.StackTrace}");
            }
        }
    }
}
