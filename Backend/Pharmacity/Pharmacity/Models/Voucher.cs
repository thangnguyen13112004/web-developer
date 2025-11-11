using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Voucher
{
    public int Mavoucher { get; set; }

    public string Tenvoucher { get; set; } = null!;

    public double Giatri { get; set; }

    public string? Loaigiamgia { get; set; }

    public double Dontoithieu { get; set; }

    public DateTime? Ngaybd { get; set; }

    public DateTime? Ngaykt { get; set; }

    public string? Trangthai { get; set; }

    public virtual ICollection<Donhang> Madhs { get; set; } = new List<Donhang>();
}
