namespace Pharmacity.DTOs.Admin
{
    public class EmployeeReadDto
    {
        public int MaNV { get; set; }
        public string HoTen { get; set; }
        public string ChucVu { get; set; }
        public string TaiKhoan { get; set; }
        public bool TrangThai { get; set; } // True: Hoạt động, False: Khóa
        public DateTime NgayTao { get; set; }
    }

    public class EmployeeCreateDto
    {
        public string HoTen { get; set; }
        public string ChucVu { get; set; } // Admin, Quản lý cửa hàng, Nhân viên
        public string TaiKhoan { get; set; }
        public string MatKhau { get; set; }
    }
}
