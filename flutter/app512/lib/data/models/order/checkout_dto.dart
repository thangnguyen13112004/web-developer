class CheckoutDto {
  final int maDC;
  final String phuongThucTT;
  final List<int> selectedMalos;

  CheckoutDto({
    required this.maDC,
    required this.phuongThucTT,
    required this.selectedMalos,
  });

  Map<String, dynamic> toJson() => {
    'maDC': maDC,
    'phuongThucTT': phuongThucTT,
    'selectedMalos': selectedMalos,
  };
}
