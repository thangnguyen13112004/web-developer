using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Donthuoc
{
    public int Madonthuoc { get; set; }

    public int Makh { get; set; }

    public string? Tenbacsi { get; set; }

    public string? Benhvien { get; set; }

    public string? Chuandoan { get; set; }

    public DateTime? Ngaykethuoc { get; set; }

    public string? Hinhanhdonthuoc { get; set; }

    public virtual ICollection<Chitietdonthuoc> Chitietdonthuocs { get; set; } = new List<Chitietdonthuoc>();

    public virtual ICollection<Donhang> Donhangs { get; set; } = new List<Donhang>();

    public virtual Khachhang MakhNavigation { get; set; } = null!;
}
