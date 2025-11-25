using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Phieunhaphang
{
    public int Mapn { get; set; }

    public int Mancc { get; set; }

    public int Manv { get; set; }

    public DateTime? Ngaynhap { get; set; }

    public double Tongtien { get; set; }

    public string? Ghichu { get; set; }

    public virtual ICollection<Chitietphieunhap> Chitietphieunhaps { get; set; } = new List<Chitietphieunhap>();

    public virtual Nhacungcap ManccNavigation { get; set; } = null!;

    public virtual Nhanvien ManvNavigation { get; set; } = null!;
}
