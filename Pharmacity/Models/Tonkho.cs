using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Tonkho
{
    public int Malo { get; set; }

    public int Makho { get; set; }

    public int Soluongton { get; set; }

    public virtual Kho MakhoNavigation { get; set; } = null!;

    public virtual Lothuoc MaloNavigation { get; set; } = null!;
}
