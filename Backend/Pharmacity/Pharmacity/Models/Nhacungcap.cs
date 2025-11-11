using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Nhacungcap
{
    public int Mancc { get; set; }

    public string Tenncc { get; set; } = null!;

    public string? Sdt { get; set; }

    public string? Diachi { get; set; }

    public virtual ICollection<Dondathang> Dondathangs { get; set; } = new List<Dondathang>();

    public virtual ICollection<Lothuoc> Lothuocs { get; set; } = new List<Lothuoc>();

    public virtual ICollection<Phieunhaphang> Phieunhaphangs { get; set; } = new List<Phieunhaphang>();
}
