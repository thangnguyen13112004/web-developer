using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Donhang
{
    public int Madh { get; set; }

    public int Makh { get; set; }

    public int? Madonthuoc { get; set; }

    public DateTime? Ngaydat { get; set; }

    public string? Trangthai { get; set; }

    public double Tongtien { get; set; }

    public int? Madc { get; set; }

    public virtual ICollection<Chitietdonhang> Chitietdonhangs { get; set; } = new List<Chitietdonhang>();

    public virtual SoDiaChi? MadcNavigation { get; set; }

    public virtual Donthuoc? MadonthuocNavigation { get; set; }

    public virtual Khachhang MakhNavigation { get; set; } = null!;

    public virtual ICollection<Thanhtoan> Thanhtoans { get; set; } = new List<Thanhtoan>();

    public virtual ICollection<Voucher> Mavouchers { get; set; } = new List<Voucher>();
}
