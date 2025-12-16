import 'package:dio/dio.dart';

import '../../core/dio_client.dart';
import '../models/product/thuoc.dart';

class ProductRepository {
  final Dio _dio = DioClient.dio;

  Future<List<Thuoc>> getProducts({
    int? maLoai,
    String? sortBy,
    String? priceSort,
  }) async {
    final response = await _dio.get(
      '/api/Thuoc',
      queryParameters: {
        if (maLoai != null) 'maloai': maLoai,
        if (sortBy != null) 'sortBy': sortBy,
        if (priceSort != null) 'priceSort': priceSort,
      },
    );

    final data = response.data as List<dynamic>;
    return data.map((e) => Thuoc.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Thuoc> getProductDetail(int id) async {
    final response = await _dio.get('/api/Thuoc/$id');
    return Thuoc.fromJson(response.data as Map<String, dynamic>);
  }
}
