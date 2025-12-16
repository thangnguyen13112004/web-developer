import 'package:dio/dio.dart';

import '../../core/dio_client.dart';
import '../models/cart/add_to_cart_dto.dart';
import '../models/cart/cart_item.dart';
import '../models/order/checkout_dto.dart';
import '../models/order/client_order_detail.dart';

class CartRepository {
  final Dio _dio = DioClient.dio;

  Future<List<CartItem>> getCart() async {
    try {
      final response = await _dio.get('/api/GioHang');

      // Debug: in ra dữ liệu nhận được
      // ignore: avoid_print
      print('✅ API /api/GioHang trả về: ${response.data}');

      final data = response.data as List<dynamic>;
      return data
          .map((e) => CartItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final data = e.response?.data;
      final message = data is Map<String, dynamic>
          ? (data['message'] as String? ?? 'Không tải được giỏ hàng')
          : 'Không tải được giỏ hàng (mã lỗi ${e.response?.statusCode})';
      throw Exception(message);
    }
  }


  Future<void> addToCart(AddToCartDto dto) async {
    try {
      await _dio.post('/api/GioHang', data: dto.toJson());
    } on DioException catch (e) {
      final data = e.response?.data;
      final msg = data is Map<String, dynamic>
          ? (data['message'] as String? ??
          'Thêm vào giỏ thất bại (mã lỗi ${e.response?.statusCode})')
          : 'Thêm vào giỏ thất bại (mã lỗi ${e.response?.statusCode})';
      // log chi tiết
      // ignore: avoid_print
      print('❌ LỖI API: /api/GioHang');
      // ignore: avoid_print
      print('Status Code: ${e.response?.statusCode}');
      // ignore: avoid_print
      print('Dữ liệu trả về: $data');

      throw Exception(msg);
    }
  }

  Future<void> updateCartItem(int maLo, int soLuong) async {
    await _dio.put('/api/GioHang/$maLo', data: {'soLuong': soLuong});
  }

  Future<void> deleteCartItem(int maLo) async {
    await _dio.delete('/api/GioHang/$maLo');
  }

  Future<int> checkout(CheckoutDto dto) async {
    try {
      final response = await _dio.post('/api/DatHang', data: dto.toJson());

      print('✅ API /api/DatHang trả về: ${response.data}');

      final data = response.data;

      if (data is Map<String, dynamic>) {
        // API của bạn: {message: "Đặt hàng thành công!", orderId: 21}
        dynamic rawId = data['orderId'];

        int? orderId;
        if (rawId is int) {
          orderId = rawId;
        } else if (rawId is String) {
          orderId = int.tryParse(rawId);
        }

        if (orderId == null) {
          throw Exception('Không lấy được mã đơn hàng từ server');
        }

        return orderId;
      } else {
        throw Exception('Dữ liệu trả về không hợp lệ');
      }
    } on DioException catch (e) {
      final data = e.response?.data;
      final status = e.response?.statusCode;

      print('❌ LỖI API: /api/DatHang');
      print('Status Code: $status');
      print('Dữ liệu trả về: $data');

      var msg = 'Đặt hàng thất bại (mã lỗi $status)';
      if (data is Map<String, dynamic>) {
        msg = data['message'] as String? ?? msg;
      } else if (data is String) {
        msg = data;
      }

      throw Exception(msg);
    }
  }
}
