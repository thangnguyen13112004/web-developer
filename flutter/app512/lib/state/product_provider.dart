import 'package:flutter/foundation.dart';

import '../data/models/product/thuoc.dart';
import '../data/repositories/product_repository.dart';

class ProductProvider extends ChangeNotifier {
  final ProductRepository _repository;

  ProductProvider(this._repository);

  List<Thuoc> _products = [];
  bool _isLoading = false;
  String? _error;

  List<Thuoc> get products => _products;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchProducts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _products = await _repository.getProducts();
    } catch (e, stackTrace) { // Thêm stackTrace để biết lỗi dòng nào
      print('❌ LỖI API: $e');
      print('📍 StackTrace: $stackTrace');

      // Tạm thời hiển thị lỗi chi tiết lên UI để dễ nhìn
      _error = 'Lỗi: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
