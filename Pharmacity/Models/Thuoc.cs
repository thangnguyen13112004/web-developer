using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Thuoc
{
    public int Mathuoc { get; set; }

    public string Tenthuoc { get; set; } = null!;

    public string? Hoatchat { get; set; }

    public string? Sodangky { get; set; }

    public string? Quycachdonggoi { get; set; }

    public string? Donvitinh { get; set; }

    public double Giaban { get; set; }

    public int Soluongton { get; set; }

    public string? Nhasx { get; set; }

    public string? Loaithuoc { get; set; }

    public string? Chongchidinh { get; set; }

    public string? Lieudung { get; set; }

    public int? Maloai { get; set; }

    public string? Hinhanh { get; set; }

    public double? Giacu { get; set; }

    public virtual ICollection<Chitietdondathang> Chitietdondathangs { get; set; } = new List<Chitietdondathang>();

    public virtual ICollection<Chitietdonthuoc> Chitietdonthuocs { get; set; } = new List<Chitietdonthuoc>();

    public virtual ICollection<Chitietphieunhap> Chitietphieunhaps { get; set; } = new List<Chitietphieunhap>();

    public virtual ICollection<Lothuoc> Lothuocs { get; set; } = new List<Lothuoc>();

    public virtual Loaithuoc? MaloaiNavigation { get; set; }
}
