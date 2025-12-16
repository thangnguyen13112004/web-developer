class ClientOrderItem {
  final String tenThuoc;
  final String? hinhAnh;
  final String? donViTinh;
  final int soLuong;
  final double donGia;
  final double thanhTien;

  ClientOrderItem({
    required this.tenThuoc,
    this.hinhAnh,
    this.donViTinh,
    required this.soLuong,
    required this.donGia,
    required this.thanhTien,
  });

  factory ClientOrderItem.fromJson(Map<String, dynamic> json) {
    double _toDouble(dynamic v) {
      if (v == null) return 0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0;
    }

    return ClientOrderItem(
      tenThuoc: json['tenThuoc'] as String? ?? '',
      hinhAnh: json['hinhAnh'] as String?,
      donViTinh: json['donViTinh'] as String?,
      soLuong: json['soLuong'] as int,
      donGia: _toDouble(json['donGia']),
      thanhTien: _toDouble(json['thanhTien']),
    );
  }
}

class ClientOrderDetail {
  final int maDH;
  final DateTime ngayDat;
  final String trangThai;
  final String nguoiNhan;
  final String sdt;
  final String diaChiGiaoHang;
  final List<ClientOrderItem> chiTiet;
  final double tienHang;
  final double phiVanChuyen;
  final double tongTien;
  final String phuongThucThanhToan;

  ClientOrderDetail({
    required this.maDH,
    required this.ngayDat,
    required this.trangThai,
    required this.nguoiNhan,
    required this.sdt,
    required this.diaChiGiaoHang,
    required this.chiTiet,
    required this.tienHang,
    required this.phiVanChuyen,
    required this.tongTien,
    required this.phuongThucThanhToan,
  });

  factory ClientOrderDetail.fromJson(Map<String, dynamic> json) {
    double _toDouble(dynamic v) {
      if (v == null) return 0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0;
    }

    final list = json['chiTiet'] as List<dynamic>? ?? [];

    return ClientOrderDetail(
      maDH: json['maDH'] as int,
      ngayDat: DateTime.parse(json['ngayDat'] as String),
      trangThai: json['trangThai'] as String? ?? '',
      nguoiNhan: json['nguoiNhan'] as String? ?? '',
      sdt: json['sdt'] as String? ?? '',
      diaChiGiaoHang: json['diaChiGiaoHang'] as String? ?? '',
      chiTiet: list
          .map((e) => ClientOrderItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      tienHang: _toDouble(json['tienHang']),
      phiVanChuyen: _toDouble(json['phiVanChuyen']),
      tongTien: _toDouble(json['tongTien']),
      phuongThucThanhToan:
      json['phuongThucThanhToan'] as String? ?? '',
    );
  }
}
