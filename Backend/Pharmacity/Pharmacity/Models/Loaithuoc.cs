using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Loaithuoc
{
    public int Maloai { get; set; }

    public string Tenloai { get; set; } = null!;

    public virtual ICollection<Thuoc> Thuocs { get; set; } = new List<Thuoc>();
}
