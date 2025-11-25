using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Lothuoc
{
    public int Malo { get; set; }

    public int Mathuoc { get; set; }

    public string Solo { get; set; } = null!;

    public DateTime? Ngaysanxuat { get; set; }

    public DateTime? Hansudung { get; set; }

    public int Soluongnhap { get; set; }

    public double Dongianhap { get; set; }

    public int? Mancc { get; set; }

    public int? Manv { get; set; }

    public DateTime? Ngaynhap { get; set; }

    public virtual ICollection<Chitietdonhang> Chitietdonhangs { get; set; } = new List<Chitietdonhang>();

    public virtual Nhacungcap? ManccNavigation { get; set; }

    public virtual Nhanvien? ManvNavigation { get; set; }

    public virtual Thuoc MathuocNavigation { get; set; } = null!;

    public virtual ICollection<Tonkho> Tonkhos { get; set; } = new List<Tonkho>();
}
