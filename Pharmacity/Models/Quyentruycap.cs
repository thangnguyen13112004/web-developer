using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Quyentruycap
{
    public int Maquyen { get; set; }

    public string Tenquyen { get; set; } = null!;

    public string? Mota { get; set; }

    public virtual ICollection<Nhanvien> Manvs { get; set; } = new List<Nhanvien>();
}
