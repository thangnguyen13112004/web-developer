import 'package:dio/dio.dart';

import '../../core/dio_client.dart';
import '../models/profile/client_profile.dart';

class ProfileRepository {
  final Dio _dio = DioClient.dio;

  Future<ClientProfile> getProfile() async {
    final response = await _dio.get('/api/client/profile');
    return ClientProfile.fromJson(
        response.data as Map<String, dynamic>);
  }

  Future<void> updateProfile(ClientProfileUpdateDto dto) async {
    await _dio.put('/api/client/profile', data: dto.toJson());
  }
}
