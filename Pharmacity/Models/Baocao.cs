using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Baocao
{
    public int Mabc { get; set; }

    public string? Loaibaocao { get; set; }

    public DateTime? Ngaylap { get; set; }

    public int? Manv { get; set; }

    public string? Noidung { get; set; }

    public virtual Nhanvien? ManvNavigation { get; set; }
}
