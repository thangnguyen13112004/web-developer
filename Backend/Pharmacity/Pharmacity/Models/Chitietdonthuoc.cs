using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Chitietdonthuoc
{
    public int Madonthuoc { get; set; }

    public int Mathuoc { get; set; }

    public int Soluong { get; set; }

    public string? Lieudung { get; set; }

    public double? Dongia { get; set; }

    public double? Thanhtien { get; set; }

    public virtual Donthuoc MadonthuocNavigation { get; set; } = null!;

    public virtual Thuoc MathuocNavigation { get; set; } = null!;
}
