class ClientProfile {
  final String hoTen;
  final String sdt;
  final String email;
  final String? ngaySinh;      // để dạng String cho đơn giản
  final String gioiTinh;
  final String? anhDaiDien;

  ClientProfile({
    required this.hoTen,
    required this.sdt,
    required this.email,
    this.ngaySinh,
    required this.gioiTinh,
    this.anhDaiDien,
  });

  factory ClientProfile.fromJson(Map<String, dynamic> json) {
    return ClientProfile(
      hoTen: json['hoTen'] as String? ?? '',
      sdt: json['sdt'] as String? ?? '',
      email: json['email'] as String? ?? '',
      ngaySinh: json['ngaySinh'] as String?, // có thể null
      gioiTinh: json['gioiTinh'] as String? ?? '',
      anhDaiDien: json['anhDaiDien'] as String?,
    );
  }
}

class ClientProfileUpdateDto {
  final String hoTen;
  final String sdt;
  final String email;
  final String? ngaySinh;
  final String gioiTinh;
  final String? anhDaiDien;

  ClientProfileUpdateDto({
    required this.hoTen,
    required this.sdt,
    required this.email,
    this.ngaySinh,
    required this.gioiTinh,
    this.anhDaiDien,
  });

  Map<String, dynamic> toJson() => {
    'hoTen': hoTen,
    'sdt': sdt,
    'email': email,
    'ngaySinh': ngaySinh,
    'gioiTinh': gioiTinh,
    'anhDaiDien':
    anhDaiDien ?? 'default-avatar',
    // không đổi mật khẩu ở màn này
    'matKhauCu': null,
    'matKhauMoi': null,
  };
}
