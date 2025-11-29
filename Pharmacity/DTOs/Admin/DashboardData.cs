namespace Pharmacity.DTOs.Admin
{
    // Class DTO để định dạng dữ liệu (Đặt bên dưới hoặc file riêng)
    public class DashboardData
    {
        public double TotalRevenue { get; set; }
        public int ActiveOrders { get; set; }
        public ProductStats ProductStats { get; set; }
        public int TotalCustomers { get; set; }
        public ChartData ChartData { get; set; }

        // Thêm 2 trường này để debug
        public string Source { get; set; }
        public string ProcessingTime { get; set; }
    }

    public class ProductStats { public int Total { get; set; } public int LowStock { get; set; } }
    public class ChartData { public List<double> Revenue { get; set; } public List<string> Labels { get; set; } public List<string> Categories { get; set; } public List<double> CategoryRevenue { get; set; } }
}
