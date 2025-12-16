class RegisterDto {
  final String hoTen;
  final String sdt;
  final String matKhau;

  RegisterDto({
    required this.hoTen,
    required this.sdt,
    required this.matKhau,
  });

  Map<String, dynamic> toJson() {
    return {
      'hoTen': hoTen,
      'sdt': sdt,
      'matKhau': matKhau,
    };
  }
}
