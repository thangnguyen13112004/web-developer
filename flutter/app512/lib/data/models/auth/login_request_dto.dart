class LoginRequestDto {
  final String identifier;
  final String matKhau;

  LoginRequestDto({
    required this.identifier,
    required this.matKhau,
  });

  Map<String, dynamic> toJson() {
    return {
      'identifier': identifier,
      'matKhau': matKhau,
    };
  }
}
