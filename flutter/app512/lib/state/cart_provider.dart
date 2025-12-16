import 'package:flutter/foundation.dart';

import '../data/models/cart/add_to_cart_dto.dart';
import '../data/models/cart/cart_item.dart';
import '../data/models/order/checkout_dto.dart';
import '../data/repositories/cart_repository.dart';
import '../data/models/order/client_order_detail.dart';

class CartProvider extends ChangeNotifier {
  final CartRepository _repository;

  CartProvider(this._repository);

  List<CartItem> _items = [];
  bool _isLoading = false;

  List<CartItem> get items => _items;
  bool get isLoading => _isLoading;

  double get tongTien =>
      _items.fold(0, (sum, item) => sum + item.thanhTien);

  List<int> get selectedMalos => _items.map((e) => e.maLo).toList();

  Future<void> loadCart() async {
    _isLoading = true;
    notifyListeners();
    try {
      _items = await _repository.getCart();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addToCart(int maThuoc, int soLuong) async {
    await _repository.addToCart(AddToCartDto(maThuoc: maThuoc, soLuong: soLuong));
    await loadCart(); // reload từ server
  }

  Future<void> updateItem(int maLo, int soLuong) async {
    await _repository.updateCartItem(maLo, soLuong);
    await loadCart();
  }

  Future<void> removeItem(int maLo) async {
    await _repository.deleteCartItem(maLo);
    await loadCart();
  }

  Future<int> checkout(int maDC, String phuongThucTT) async {
    final dto = CheckoutDto(
      maDC: maDC,
      phuongThucTT: phuongThucTT,
      selectedMalos: selectedMalos,
    );

    final orderId = await _repository.checkout(dto);

    // Clear giỏ sau khi đặt thành công
    _items = [];
    notifyListeners();

    return orderId; // 👈 trả lại mã đơn cho UI
  }
}
