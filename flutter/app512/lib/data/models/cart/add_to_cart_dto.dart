class AddToCartDto {
  final int maThuoc;
  final int soLuong;

  AddToCartDto({required this.maThuoc, required this.soLuong});

  Map<String, dynamic> toJson() => {
    'maThuoc': maThuoc,
    'soLuong': soLuong,
  };
}
