using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Khachhang
{
    public int Makh { get; set; }

    public string Hoten { get; set; } = null!;

    public string Sdt { get; set; } = null!;

    public string? Email { get; set; }

    public string? Matkhau { get; set; }

    public DateTime? Ngaytao { get; set; }

    public DateOnly? NgaySinh { get; set; }

    public string? GioiTinh { get; set; }

    public string? AnhDaiDien { get; set; }

    public virtual ICollection<Donhang> Donhangs { get; set; } = new List<Donhang>();

    public virtual ICollection<Donthuoc> Donthuocs { get; set; } = new List<Donthuoc>();

    public virtual ICollection<SoDiaChi> SoDiaChis { get; set; } = new List<SoDiaChi>();
}
