import 'package:flutter/material.dart';

import '../../data/models/address/dia_chi.dart';
import '../../data/models/address/dia_chi_create_dto.dart';
import '../../data/repositories/address_repository.dart';

class AddressFormScreen extends StatefulWidget {
  final DiaChi? existing;

  const AddressFormScreen({super.key, this.existing});

  @override
  State<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends State<AddressFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _cityController;
  late TextEditingController _districtController;
  late TextEditingController _wardController;
  late TextEditingController _streetController;
  bool _macDinh = true;
  bool _isLoading = false;

  final _repo = AddressRepository();

  bool get isEditing => widget.existing != null;

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    _nameController = TextEditingController(text: e?.hoTenNhan ?? '');
    _phoneController = TextEditingController(text: e?.sdtNhan ?? '');
    _cityController = TextEditingController(text: e?.tinhThanh ?? '');
    _districtController = TextEditingController(text: e?.quanHuyen ?? '');
    _wardController = TextEditingController(text: e?.phuongXa ?? '');
    _streetController = TextEditingController(text: e?.soNhaDuong ?? '');
    _macDinh = e?.macDinh ?? true;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _cityController.dispose();
    _districtController.dispose();
    _wardController.dispose();
    _streetController.dispose();
    super.dispose();
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
    final t = v.trim();
    final reg = RegExp(r'^[0-9]{9,11}$');
    if (!reg.hasMatch(t)) {
      return 'Số điện thoại không hợp lệ';
    }
    return null;
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      final hoTenNhan = _nameController.text.trim();
      final sdtNhan = _phoneController.text.trim();
      final tinhThanh = _cityController.text.trim();
      final quanHuyen = _districtController.text.trim();
      final phuongXa = _wardController.text.trim();
      final soNhaDuong = _streetController.text.trim();

      // 👇 Tự build full địa chỉ
      final fullAddress = [
        soNhaDuong,
        phuongXa,
        quanHuyen,
        tinhThanh,
      ].where((e) => e.isNotEmpty).join(', ');

      final dto = DiaChiCreateDto(
        hoTenNhan: hoTenNhan,
        sdtNhan: sdtNhan,
        tinhThanh: tinhThanh,
        quanHuyen: quanHuyen,
        phuongXa: phuongXa,
        soNhaDuong: soNhaDuong,
        macDinh: _macDinh,
        diaChiDayDu: fullAddress, // 👈 thêm dòng này
      );

      if (isEditing) {
        await _repo.updateAddress(widget.existing!.maDC, dto);
      } else {
        await _repo.createAddress(dto);
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isEditing
              ? 'Đã cập nhật địa chỉ'
              : 'Đã thêm địa chỉ'),
        ),
      );
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lưu địa chỉ thất bại')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ====== HÀM XÓA ĐỊA CHỈ ======
  Future<void> _delete() async {
    // chỉ gọi khi isEditing == true
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xóa địa chỉ'),
        content: const Text('Bạn có chắc muốn xóa địa chỉ này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isLoading = true);
    try {
      await _repo.deleteAddress(widget.existing!.maDC);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã xóa địa chỉ')),
      );
      // trả true để màn list biết cần reload
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Xóa địa chỉ thất bại')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'),
        actions: [
          if (isEditing)
            IconButton(
              icon: const Icon(Icons.delete),
              onPressed: _isLoading ? null : _delete,
            ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _nameController,
                decoration:
                const InputDecoration(labelText: 'Họ tên người nhận'),
                validator: _validateRequired,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _phoneController,
                decoration:
                const InputDecoration(labelText: 'Số điện thoại'),
                keyboardType: TextInputType.phone,
                validator: _validatePhone,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _cityController,
                decoration:
                const InputDecoration(labelText: 'Tỉnh/Thành phố'),
                validator: _validateRequired,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _districtController,
                decoration:
                const InputDecoration(labelText: 'Quận/Huyện'),
                validator: _validateRequired,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _wardController,
                decoration: const InputDecoration(labelText: 'Phường/Xã'),
                validator: _validateRequired,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _streetController,
                decoration:
                const InputDecoration(labelText: 'Số nhà, đường'),
                textInputAction: TextInputAction.done,
              ),
              const SizedBox(height: 8),
              CheckboxListTile(
                value: _macDinh,
                onChanged: (v) => setState(() {
                  _macDinh = v ?? true;
                }),
                title: const Text('Đặt làm địa chỉ mặc định'),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _save,
                  child: _isLoading
                      ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                      : Text(isEditing ? 'Lưu thay đổi' : 'Thêm địa chỉ'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
