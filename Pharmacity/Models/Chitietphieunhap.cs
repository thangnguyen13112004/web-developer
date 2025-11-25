using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Chitietphieunhap
{
    public int Mapn { get; set; }

    public int Mathuoc { get; set; }

    public string Solo { get; set; } = null!;

    public DateTime? Ngaysanxuat { get; set; }

    public DateTime? Hansudung { get; set; }

    public int? Soluong { get; set; }

    public double? Dongia { get; set; }

    public double? Thanhtien { get; set; }

    public virtual Phieunhaphang MapnNavigation { get; set; } = null!;

    public virtual Thuoc MathuocNavigation { get; set; } = null!;
}
