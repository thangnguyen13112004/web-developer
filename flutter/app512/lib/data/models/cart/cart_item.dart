class CartItem {
  final int maLo;       // dùng khi checkout (selectedMalos)
  final int maThuoc;
  final String tenThuoc;
  final int soLuong;
  final double giaBan;  // thực chất là dongia bên server

  CartItem({
    required this.maLo,
    required this.maThuoc,
    required this.tenThuoc,
    required this.soLuong,
    required this.giaBan,
  });

  double get thanhTien => giaBan * soLuong;

  factory CartItem.fromJson(Map<String, dynamic> json) {
    double _toDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      return double.tryParse(value.toString()) ?? 0.0;
    }

    return CartItem(
      maLo: json['malo'] as int,
      maThuoc: json['mathuoc'] as int,
      tenThuoc: json['tenthuoc'] as String,
      soLuong: json['soluong'] as int,
      // Ở đây phải đọc 'dongia', KHÔNG phải 'giaban'
      giaBan: _toDouble(json['dongia']),
    );
  }
}
