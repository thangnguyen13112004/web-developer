using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Chitietdondathang
{
    public int Maddh { get; set; }

    public int Mathuoc { get; set; }

    public int? Soluong { get; set; }

    public double? Dongia { get; set; }

    public double? Thanhtien { get; set; }

    public virtual Dondathang MaddhNavigation { get; set; } = null!;

    public virtual Thuoc MathuocNavigation { get; set; } = null!;
}
