using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Chitietdonhang
{
    public int Madh { get; set; }

    public int Malo { get; set; }

    public int Soluong { get; set; }

    public double Dongia { get; set; }

    public double? Thanhtien { get; set; }

    public virtual Donhang MadhNavigation { get; set; } = null!;

    public virtual Lothuoc MaloNavigation { get; set; } = null!;
}
