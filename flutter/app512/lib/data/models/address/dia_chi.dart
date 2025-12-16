class DiaChi {
  final int maDC;             // madc
  final String hoTenNhan;     // hotenNhan
  final String sdtNhan;       // sdtNhan
  final String tinhThanh;     // tinhthanh
  final String quanHuyen;     // quanhuyen
  final String phuongXa;      // phuongxa
  final String soNhaDuong;    // sonhaDuong
  final String loaiDc;        // loaidc (1: nhà, 2: công ty... tuỳ bạn)
  final bool macDinh;         // macdinh

  DiaChi({
    required this.maDC,
    required this.hoTenNhan,
    required this.sdtNhan,
    required this.tinhThanh,
    required this.quanHuyen,
    required this.phuongXa,
    required this.soNhaDuong,
    required this.loaiDc,
    required this.macDinh,
  });

  /// Ghép thành 1 chuỗi địa chỉ đầy đủ để hiển thị
  String get diaChiDayDu {
    final parts = <String>[
      soNhaDuong,
      phuongXa,
      quanHuyen,
      tinhThanh,
    ].where((e) => e.isNotEmpty).toList();
    return parts.join(', ');
  }

  factory DiaChi.fromJson(Map<String, dynamic> json) {
    return DiaChi(
      maDC: json['madc'] as int,
      hoTenNhan: json['hotenNhan'] as String? ?? '',
      sdtNhan: json['sdtNhan'] as String? ?? '',
      tinhThanh: json['tinhthanh'] as String? ?? '',
      quanHuyen: json['quanhuyen'] as String? ?? '',
      phuongXa: json['phuongxa'] as String? ?? '',
      soNhaDuong: json['sonhaDuong'] as String? ?? '',
      loaiDc: json['loaidc']?.toString() ?? '',
      macDinh: json['macdinh'] as bool? ?? false,
    );
  }
}
