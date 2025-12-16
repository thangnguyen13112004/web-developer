class DiaChiCreateDto {
  final String hoTenNhan;
  final String sdtNhan;
  final String tinhThanh;
  final String quanHuyen;
  final String phuongXa;
  final String soNhaDuong;
  final String loaiDc;
  final bool macDinh;
  final String diaChiDayDu;

  DiaChiCreateDto({
    required this.hoTenNhan,
    required this.sdtNhan,
    required this.tinhThanh,
    required this.quanHuyen,
    required this.phuongXa,
    required this.soNhaDuong,
    this.loaiDc = '1',
    this.macDinh = false,
    required this.diaChiDayDu,
  });

  Map<String, dynamic> toJson() => {
    'hotenNhan': hoTenNhan,
    'sdtNhan': sdtNhan,
    'tinhthanh': tinhThanh,
    'quanhuyen': quanHuyen,
    'phuongxa': phuongXa,
    'sonhaDuong': soNhaDuong,
    'loaidc': loaiDc,
    'macdinh': macDinh,
    'diaChiDayDu': diaChiDayDu,
  };
}