import 'package:dio/dio.dart';

import '../../core/dio_client.dart';
import '../models/address/dia_chi.dart';
import '../models/address/dia_chi_create_dto.dart';

class AddressRepository {
  final Dio _dio = DioClient.dio;

  Future<List<DiaChi>> getAddresses() async {
    final response = await _dio.get('/api/SoDiaChi');
    final data = response.data;

    // Debug xem API trả về gì
    // ignore: avoid_print
    print('✅ /api/SoDiaChi data: $data');

    if (data is List) {
      return data
          .map((e) => DiaChi.fromJson(e as Map<String, dynamic>))
          .toList();
    } else if (data is Map<String, dynamic>) {
      // Trường hợp API trả về 1 object
      return [DiaChi.fromJson(data)];
    } else {
      throw Exception('Dữ liệu địa chỉ không hợp lệ');
    }
  }

  Future<DiaChi?> getDefaultAddress() async {
    final response = await _dio.get('/api/SoDiaChi/default');
    final data = response.data;
    if (data == null) return null;
    if (data is Map<String, dynamic>) {
      return DiaChi.fromJson(data);
    }
    throw Exception('Dữ liệu địa chỉ mặc định không hợp lệ');
  }

  Future<DiaChi> createAddress(DiaChiCreateDto dto) async {
    final response = await _dio.post(
      '/api/SoDiaChi',
      data: dto.toJson(),
    );
    return DiaChi.fromJson(response.data as Map<String, dynamic>);
  }
  Future<DiaChi> updateAddress(int maDC, DiaChiCreateDto dto) async {
    final response =
    await _dio.put('/api/SoDiaChi/$maDC', data: dto.toJson());
    return DiaChi.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteAddress(int maDC) async {
    await _dio.delete('/api/SoDiaChi/$maDC');
  }

  Future<void> setDefault(int maDC) async {
    await _dio.put('/api/SoDiaChi/setDefault/$maDC');
  }
}