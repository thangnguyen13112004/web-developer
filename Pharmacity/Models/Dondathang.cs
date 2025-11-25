using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Dondathang
{
    public int Maddh { get; set; }

    public int Mancc { get; set; }

    public int Manv { get; set; }

    public DateTime? Ngaydat { get; set; }

    public double? Tongtien { get; set; }

    public string? Trangthai { get; set; }

    public virtual ICollection<Chitietdondathang> Chitietdondathangs { get; set; } = new List<Chitietdondathang>();

    public virtual Nhacungcap ManccNavigation { get; set; } = null!;

    public virtual Nhanvien ManvNavigation { get; set; } = null!;
}
