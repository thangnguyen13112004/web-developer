import 'package:flutter/material.dart';

import '../../data/models/profile/client_profile.dart';
import '../../data/repositories/profile_repository.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _repo = ProfileRepository();

  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  late TextEditingController _dobController; // ngày sinh text

  String _gioiTinh = 'Nam';
  bool _isLoading = true;
  bool _isSaving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _phoneController = TextEditingController();
    _emailController = TextEditingController();
    _dobController = TextEditingController();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _dobController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final profile = await _repo.getProfile();
      _nameController.text = profile.hoTen;
      _phoneController.text = profile.sdt;
      _emailController.text = profile.email;

      // Nếu backend trả dạng "2000-01-01T00:00:00"
      // thì bạn có thể xử lý cắt chuỗi trong ClientProfile.fromJson
      _dobController.text = profile.ngaySinh ?? '';

      _gioiTinh = profile.gioiTinh.isEmpty ? 'Khác' : profile.gioiTinh;
    } catch (e) {
      _error = e.toString();
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String? _validateRequired(String? v) {
    if (v == null || v.trim().isEmpty) {
      return 'Không được để trống';
    }
    return null;
  }

  String? _validatePhone(String? v) {
    if (v == null || v.trim().isEmpty) {
      return 'Không được để trống';
    }
    final text = v.trim();
    final reg = RegExp(r'^[0-9]{9,11}$');
    if (!reg.hasMatch(text)) {
      return 'Số điện thoại không hợp lệ';
    }
    return null;
  }

  String? _validateEmail(String? v) {
    if (v == null || v.trim().isEmpty) return null; // cho phép bỏ trống
    final text = v.trim();
    final reg = RegExp(
      r'^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$',
    );
    if (!reg.hasMatch(text)) {
      return 'Email không hợp lệ';
    }
    return null;
  }

  String? _validateDob(String? v) {
    if (v == null || v.trim().isEmpty) return null;
    final text = v.trim();
    final parsed = DateTime.tryParse(text);
    if (parsed == null) {
      return 'Ngày sinh không hợp lệ (vd: 2000-01-01)';
    }
    return null;
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    try {
      final dto = ClientProfileUpdateDto(
        hoTen: _nameController.text.trim(),
        sdt: _phoneController.text.trim(),
        email: _emailController.text.trim(),
        ngaySinh: _dobController.text.trim().isEmpty
            ? null
            : _dobController.text.trim(),
        gioiTinh: _gioiTinh,
        anhDaiDien: null,
      );

      await _repo.updateProfile(dto);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã cập nhật thông tin')),
      );

      // Option: reload lại từ server để chắc chắn hiển thị giá trị mới
      await _loadProfile();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cập nhật thất bại')),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thông tin cá nhân')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(child: Text('Lỗi: $_error'))
          : Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _nameController,
                decoration:
                const InputDecoration(labelText: 'Họ tên'),
                validator: _validateRequired,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(
                  labelText: 'Số điện thoại',
                ),
                keyboardType: TextInputType.phone,
                validator: _validatePhone,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _emailController,
                decoration:
                const InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
                validator: _validateEmail,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _dobController,
                decoration: const InputDecoration(
                  labelText: 'Ngày sinh (vd: 2000-01-01)',
                ),
                keyboardType: TextInputType.datetime,
                validator: _validateDob,
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _gioiTinh,
                decoration: const InputDecoration(
                  labelText: 'Giới tính',
                ),
                items: const [
                  DropdownMenuItem(
                    value: 'Nam',
                    child: Text('Nam'),
                  ),
                  DropdownMenuItem(
                    value: 'Nữ',
                    child: Text('Nữ'),
                  ),
                  DropdownMenuItem(
                    value: 'Khác',
                    child: Text('Khác'),
                  ),
                ],
                onChanged: (v) {
                  setState(() {
                    _gioiTinh = v ?? 'Khác';
                  });
                },
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _save,
                  child: _isSaving
                      ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                    ),
                  )
                      : const Text('Lưu thay đổi'),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
