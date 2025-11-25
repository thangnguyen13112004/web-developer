using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class SoDiaChi
{
    public int Madc { get; set; }

    public int Makh { get; set; }

    public string HotenNhan { get; set; } = null!;

    public string SdtNhan { get; set; } = null!;

    public string? Tinhthanh { get; set; }

    public string? Quanhuyen { get; set; }

    public string? Phuongxa { get; set; }

    public string? SonhaDuong { get; set; }

    public string? Loaidc { get; set; }

    public bool Macdinh { get; set; }

    public virtual Khachhang MakhNavigation { get; set; } = null!;
}
