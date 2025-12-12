using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class DotKhuyenMai
{
    public int MaDotKm { get; set; }

    public string TenDotKm { get; set; } = null!;

    public string? LoaiApDung { get; set; }

    public double GiaTriGiam { get; set; }

    public DateTime? NgayBatDau { get; set; }

    public DateTime? NgayKetThuc { get; set; }

    public bool? TrangThai { get; set; }

    public virtual ICollection<ChiTietKhuyenMai> ChiTietKhuyenMais { get; set; } = new List<ChiTietKhuyenMai>();
}
