using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Neo4j.Driver;
using Microsoft.EntityFrameworkCore;
using Pharmacity.Models;
using Pharmacity.DTOs.Admin; // Tận dụng DTO sản phẩm

namespace Pharmacity.Controllers
{
    [Route("api/recommendation")]
    [ApiController]
    public class RecommendationController : ControllerBase
    {
        private readonly IDriver _driver;
        private readonly DB_QuanLyNhaThuoc2Context _context;

        public RecommendationController(IDriver driver, DB_QuanLyNhaThuoc2Context context)
        {
            _driver = driver;
            _context = context;
        }

        // Helper: Lấy thông tin chi tiết thuốc từ SQL dựa trên List ID từ Neo4j
        private async Task<List<ProductReadDto>> GetProductsFromSql(List<int> ids)
        {
            var products = await _context.Thuocs
                .Where(t => ids.Contains(t.Mathuoc))
                .Select(t => new ProductReadDto
                {
                    Mathuoc = t.Mathuoc,
                    Tenthuoc = t.Tenthuoc,
                    Giaban = t.Giaban,
                    Giacu = t.Giacu,
                    Hinhanh = t.Hinhanh,
                    // ... các trường khác
                }).ToListAsync();

            // Sắp xếp lại theo đúng thứ tự gợi ý
            return ids.Select(id => products.FirstOrDefault(p => p.Mathuoc == id)).Where(p => p != null).ToList();
        }

        // =================================================================================
        // QUESTION 1: GỢI Ý RIÊNG CHO BẠN (Collaborative Filtering)
        // Logic: Tìm những sản phẩm nào của bạn được mua nhiều nhất -> Gợi ý cho bạn.
        // =================================================================================
        [HttpGet("personal/{userId}")]
        public async Task<IActionResult> GetPersonalRecommendations(int userId)
        {
            using var session = _driver.AsyncSession();

            // Query mới: Tìm sản phẩm User này đã mua, sắp xếp theo tổng số lượng giảm dần
            var query = @"
                MATCH (u:User {id: $userId})-[r:BOUGHT]->(p:Product)
                RETURN p.id AS id, sum(r.qty) AS totalQty
                ORDER BY totalQty DESC
                LIMIT 6
            ";

            try
            {
                var cursor = await session.RunAsync(query, new { userId });
                var productIds = await cursor.ToListAsync(record => record["id"].As<int>());

                // Nếu user chưa từng mua gì, fallback về Top bán chạy toàn quốc (Question 3)
                if (!productIds.Any()) return await GetTrendingProducts();

                var result = await GetProductsFromSql(productIds);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Log lỗi nếu cần
                return StatusCode(500, ex.Message);
            }
        }

        // =================================================================================
        // QUESTION 2: GỢI Ý TRONG GIỎ HÀNG (Association Rules / Item-to-Item)
        // Logic: Bạn đang định mua A. Tìm B thường xuyên được mua cùng A trong cùng 1 đơn hàng (hoặc bởi cùng 1 người).
        // =================================================================================
        [HttpPost("cart-related")]
        public async Task<IActionResult> GetCartRecommendations([FromBody] List<int> cartProductIds)
        {
            if (cartProductIds == null || !cartProductIds.Any()) return Ok(new List<object>());

            using var session = _driver.AsyncSession();
            // Tìm sản phẩm thường được mua cùng với các sản phẩm trong giỏ
            var query = @"
                MATCH (p:Product)<-[:BOUGHT]-(u:User)-[:BOUGHT]->(rec:Product)
                WHERE p.id IN $cartIds AND NOT rec.id IN $cartIds
                RETURN rec.id AS id, count(u) AS weight
                ORDER BY weight DESC
                LIMIT 4
            ";

            var cursor = await session.RunAsync(query, new { cartIds = cartProductIds });
            var productIds = await cursor.ToListAsync(record => record["id"].As<int>());

            var result = await GetProductsFromSql(productIds);
            return Ok(result);
        }

        // =================================================================================
        // QUESTION 3: TOP BÁN CHẠY TOÀN QUỐC (Global Popularity)
        // Logic: Sản phẩm nào có nhiều quan hệ BOUGHT nhất.
        // =================================================================================
        [HttpGet("trending")]
        public async Task<IActionResult> GetTrendingProducts()
        {
            using var session = _driver.AsyncSession();
            var query = @"
                MATCH (u:User)-[:BOUGHT]->(p:Product)
                RETURN p.id AS id, count(u) AS sales
                ORDER BY sales DESC
                LIMIT 8
            ";

            var cursor = await session.RunAsync(query);
            var productIds = await cursor.ToListAsync(record => record["id"].As<int>());

            var result = await GetProductsFromSql(productIds);
            return Ok(result);
        }
    }
}
