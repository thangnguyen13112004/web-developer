import 'package:dio/dio.dart';

import '../../core/dio_client.dart';
import '../models/order/client_order_summary.dart';
import '../models/order/client_order_detail.dart';

class OrderRepository {
  final Dio _dio = DioClient.dio;

  Future<List<ClientOrderSummary>> getClientOrders() async {
    final response = await _dio.get('/api/client/orders');
    final data = response.data;

    if (data is List) {
      return data
          .map((e) =>
          ClientOrderSummary.fromJson(e as Map<String, dynamic>))
          .toList();
    } else {
      throw Exception('Dữ liệu /api/client/orders không hợp lệ');
    }
  }

  Future<ClientOrderDetail> getOrderDetail(int maDH) async {
    final response = await _dio.get('/api/client/orders/$maDH');
    return ClientOrderDetail.fromJson(
        response.data as Map<String, dynamic>);
  }

// Nếu sau này backend có API hủy đơn thì thêm hàm cancelOrder vào đây.
}
