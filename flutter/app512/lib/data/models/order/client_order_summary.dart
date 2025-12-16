class ClientOrderSummary {
  final int maDH;
  final String trangThai;
  final DateTime ngayDat;
  final double tongTien;
  final String phuongThucThanhToan;

  ClientOrderSummary({
    required this.maDH,
    required this.trangThai,
    required this.ngayDat,
    required this.tongTien,
    required this.phuongThucThanhToan,
  });

  factory ClientOrderSummary.fromJson(Map<String, dynamic> json) {
    double _toDouble(dynamic v) {
      if (v == null) return 0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0;
    }

    return ClientOrderSummary(
      maDH: json['maDH'] as int,
      trangThai: json['trangThai'] as String? ?? '',
      ngayDat: DateTime.parse(json['ngayDat'] as String),
      // phòng trường hợp /orders chỉ trả tongTien hoặc chỉ tienHang:
      tongTien: _toDouble(json['tongTien'] ?? json['tienHang']),
      phuongThucThanhToan:
      json['phuongThucThanhToan'] as String? ?? '',
    );
  }
}
