namespace Pharmacity.DTOs.Admin
{
    public class EmployeeBackupWrapper
    {
        public DateTime BackupDate { get; set; }
        public List<EmployeeBackupItem> Employees { get; set; }
    }

    public class EmployeeBackupItem
    {
        public int Manv { get; set; }
        public string Hoten { get; set; }
        public string Chucvu { get; set; }
        public string Taikhoan { get; set; }
        public bool? Trangthai { get; set; }
        public DateTime? Ngaytao { get; set; }
    }
}
