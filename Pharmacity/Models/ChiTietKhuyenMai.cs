using System;
using System.Collections.Generic;

namespace Pharmacity.Models;

public partial class ChiTietKhuyenMai
{
    public int MaCtkm { get; set; }

    public int? MaDotKm { get; set; }

    public int? MaThuoc { get; set; }

    public double? GiaGoc { get; set; }

    public double? GiaDaGiam { get; set; }

    public virtual DotKhuyenMai? MaDotKmNavigation { get; set; }

    public virtual Thuoc? MaThuocNavigation { get; set; }
}
