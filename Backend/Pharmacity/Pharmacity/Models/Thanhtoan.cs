using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Thanhtoan
{
    public int Matt { get; set; }

    public int Madh { get; set; }

    public int Manv { get; set; }

    public string? Phuongthuc { get; set; }

    public string? Trangthai { get; set; }

    public DateTime? Ngaytt { get; set; }

    public virtual Donhang MadhNavigation { get; set; } = null!;

    public virtual Nhanvien ManvNavigation { get; set; } = null!;
}
