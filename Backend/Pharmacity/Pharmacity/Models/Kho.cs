using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Kho
{
    public int Makho { get; set; }

    public string Tenkho { get; set; } = null!;

    public string? Diachi { get; set; }

    public virtual ICollection<Tonkho> Tonkhos { get; set; } = new List<Tonkho>();
}
