import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/dio_client.dart';
import '../models/auth/register_dto.dart';
import '../models/auth/login_request_dto.dart';

class AuthRepository {
  final Dio _dio = DioClient.dio;

  Future<void> register(RegisterDto dto) async {
    await _dio.post(
      '/api/Auth/register',
      data: dto.toJson(),
    );
  }

  Future<void> login(LoginRequestDto dto) async {
    try {
      final response = await _dio.post(
        '/api/Auth/login',
        data: dto.toJson(),
      );

      // 🔍 DEBUG: In ra xem server trả về cái gì
      print('LOGIN RESPONSE DATA: ${response.data}');
      print('LOGIN RESPONSE TYPE: ${response.data.runtimeType}');

      String token = '';

      // TRƯỜNG HỢP 1: Server trả về JSON (Map)
      if (response.data is Map<String, dynamic>) {
        final data = response.data as Map<String, dynamic>;

        // Kiểm tra các key phổ biến thường gặp
        if (data.containsKey('token')) {
          token = data['token'];
        } else if (data.containsKey('accessToken')) {
          token = data['accessToken'];
        } else if (data.containsKey('result')) {
          // Đôi khi token nằm trong object con
          // token = data['result']['token'];
          token = data['result'];
        } else {
          // Nếu không tìm thấy key nào quen thuộc
          print('⚠️ Không tìm thấy key token trong response Map');
        }
      }
      // TRƯỜNG HỢP 2: Server trả về chuỗi Token trực tiếp (Text Plain)
      else if (response.data is String) {
        token = response.data;
      }

      if (token.isNotEmpty) {
        final prefs = await SharedPreferences.getInstance();
        // 🔥 LƯU TOKEN: Key này phải khớp với bên dio_client.dart
        await prefs.setString('accessToken', token);
        print('✅ Đã lưu token: $token');
      } else {
        throw Exception('Không lấy được token từ phản hồi đăng nhập');
      }

    } catch (e) {
      print('❌ Lỗi đăng nhập: $e');
      rethrow; // Ném lỗi ra để UI hiển thị thông báo
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('accessToken');
  }
}
