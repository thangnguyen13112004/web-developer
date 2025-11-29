namespace Pharmacity.DTOs
{
    public class CheckoutDto
    {
        public int MaDC { get; set; } // ID địa chỉ người dùng chọn
        public string PhuongThucTT { get; set; } // "cod", "momo", ...

        public List<int>? SelectedMalos { get; set; } // Thêm dòng này
    }
}
