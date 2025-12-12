using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Neo4j.Driver;
using Pharmacity.Models;

namespace Pharmacity.Controllers.Admin
{
    [Route("api/admin/neo4j")]
    [ApiController]
    public class AdminNeo4jController : ControllerBase
    {
        private readonly DB_QuanLyNhaThuoc2Context _context;
        private readonly IDriver _driver;

        public AdminNeo4jController(DB_QuanLyNhaThuoc2Context context, IDriver driver)
        {
            _context = context;
            _driver = driver;
        }

        [HttpPost("sync")]
        public async Task<IActionResult> SyncAllData()
        {
            // 1. Lấy tất cả đơn hàng ĐÃ HOÀN TẤT hoặc Đã thanh toán
            // Kèm theo thông tin Khách hàng và Chi tiết đơn
            var orders = await _context.Donhangs
                .Where(d => d.Trangthai == "Hoàn tất" || d.Trangthai == "Đã thanh toán" || d.Trangthai == "Chờ xử lý")
                .Include(d => d.MakhNavigation) // Lấy thông tin User
                .Include(d => d.Chitietdonhangs)
                    .ThenInclude(ct => ct.MaloNavigation)
                        .ThenInclude(lo => lo.MathuocNavigation) // Lấy thông tin Thuốc
                .ToListAsync();

            using var session = _driver.AsyncSession();
            int count = 0;

            try
            {
                foreach (var order in orders)
                {
                    // Bỏ qua đơn hàng không có người mua (khách vãng lai nếu null) hoặc không có item
                    if (order.MakhNavigation == null || order.Chitietdonhangs == null) continue;

                    var userId = order.Makh;
                    var userName = order.MakhNavigation.Hoten;

                    foreach (var item in order.Chitietdonhangs)
                    {
                        // QUAN TRỌNG: Kiểm tra null đệ quy để tránh lỗi 500
                        if (item.MaloNavigation == null || item.MaloNavigation.MathuocNavigation == null) continue;

                        var product = item.MaloNavigation.MathuocNavigation;

                        // Query Cypher an toàn
                        var query = @"
                            MERGE (u:User {id: $uid})
                            ON CREATE SET u.name = $uname
                            
                            MERGE (p:Product {id: $pid})
                            ON CREATE SET p.name = $pname, p.category = $pcat
                            
                            MERGE (u)-[r:BOUGHT]->(p)
                            // Nếu đã mua rồi thì cộng dồn số lượng (Optional)
                            ON CREATE SET r.qty = $qty, r.orderId = $oid
                            ON MATCH SET r.qty = r.qty + $qty
                        ";

                        await session.RunAsync(query, new
                        {
                            uid = userId,
                            uname = userName,
                            pid = product.Mathuoc,
                            pname = product.Tenthuoc,
                            pcat = product.Maloai ?? 0,
                            oid = order.Madh,
                            qty = item.Soluong
                        });
                        count++;
                    }
                }

                return Ok(new { message = $"Đã đồng bộ thành công {count} mối quan hệ vào Neo4j." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, trace = ex.StackTrace });
            }
        }

        // API xóa sạch Neo4j để test lại từ đầu
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearNeo4j()
        {
            using var session = _driver.AsyncSession();
            await session.RunAsync("MATCH (n) DETACH DELETE n");
            return Ok("Đã xóa sạch dữ liệu Neo4j");
        }
    }
}
