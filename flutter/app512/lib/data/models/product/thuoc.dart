class Thuoc {
  final int maThuoc;
  final String tenThuoc;
  final double giaBan;
  final double? giaCu;
  final String? hinhAnh;
  final String? hoatChat;
  final String? lieuDung;
  final String? chongChiDinh;
  final int soLuongTon;
  final int maLoai;

  Thuoc({
    required this.maThuoc,
    required this.tenThuoc,
    required this.giaBan,
    this.giaCu,
    this.hinhAnh,
    this.hoatChat,
    this.lieuDung,
    this.chongChiDinh,
    required this.soLuongTon,
    required this.maLoai,
  });

  factory Thuoc.fromJson(Map<String, dynamic> json) {
    return Thuoc(
      // SỬA 1: Đổi hết key sang chữ thường theo Swagger
      maThuoc: json['mathuoc'] as int,

      // SỬA 2: Thêm check null cho chuỗi (vì swagger nói tenthuoc có thể null)
      tenThuoc: json['tenthuoc'] as String? ?? 'Chưa cập nhật tên',

      // SỬA 3: Cast an toàn cho số thực
      giaBan: (json['giaban'] as num?)?.toDouble() ?? 0.0,

      // Các trường nullable khác cũng phải dùng key chữ thường
      giaCu: json['giacu'] != null ? (json['giacu'] as num).toDouble() : null,
      hinhAnh: json['hinhanh'] as String?,
      hoatChat: json['hoatchat'] as String?,
      lieuDung: json['lieudung'] as String?,
      chongChiDinh: json['chongchidinh'] as String?,
      soLuongTon: json['soluongton'] as int,
      maLoai: (json['maLoai'] ?? json['maloai']) as int,
    );
  }
}