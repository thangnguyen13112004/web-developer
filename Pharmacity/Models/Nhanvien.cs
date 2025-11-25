using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class Nhanvien
{
    public int Manv { get; set; }

    public string Hoten { get; set; } = null!;

    public string? Chucvu { get; set; }

    public string Taikhoan { get; set; } = null!;

    public string Matkhau { get; set; } = null!;

    public bool? Trangthai { get; set; }

    public DateTime? Ngaytao { get; set; }

    public virtual ICollection<Baocao> Baocaos { get; set; } = new List<Baocao>();

    public virtual ICollection<Dondathang> Dondathangs { get; set; } = new List<Dondathang>();

    public virtual ICollection<Lothuoc> Lothuocs { get; set; } = new List<Lothuoc>();

    public virtual ICollection<Phieunhaphang> Phieunhaphangs { get; set; } = new List<Phieunhaphang>();

    public virtual ICollection<Thanhtoan> Thanhtoans { get; set; } = new List<Thanhtoan>();

    public virtual ICollection<Quyentruycap> Maquyens { get; set; } = new List<Quyentruycap>();
}
