import 'package:flutter/material.dart';

import '../../data/models/address/dia_chi.dart';
import '../../data/repositories/address_repository.dart';
import 'address_form_screen.dart';

class AddressListScreen extends StatefulWidget {
  const AddressListScreen({super.key});

  @override
  State<AddressListScreen> createState() => _AddressListScreenState();
}

class _AddressListScreenState extends State<AddressListScreen> {
  final _repo = AddressRepository();

  List<DiaChi> _addresses = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadAddresses();
  }

  Future<void> _loadAddresses() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final list = await _repo.getAddresses();
      setState(() {
        _addresses = list;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _onAdd() async {
    final updated = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => const AddressFormScreen(),
      ),
    );
    if (updated == true) {
      _loadAddresses();
    }
  }

  Future<void> _onEdit(DiaChi dc) async {
    final updated = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => AddressFormScreen(existing: dc),
      ),
    );
    if (updated == true) {
      _loadAddresses();
    }
  }

  Future<void> _onDelete(DiaChi dc) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Xóa địa chỉ'),
        content: const Text('Bạn có chắc chắn muốn xóa địa chỉ này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await _repo.deleteAddress(dc.maDC);
      _loadAddresses();
    }
  }

  Future<void> _onSetDefault(DiaChi dc) async {
    await _repo.setDefault(dc.maDC);
    _loadAddresses();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Địa chỉ giao hàng'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(child: Text('Lỗi: $_error'))
          : _addresses.isEmpty
          ? const Center(child: Text('Chưa có địa chỉ nào'))
          : ListView.builder(
        itemCount: _addresses.length,
        itemBuilder: (context, index) {
          final dc = _addresses[index];
          return ListTile(
            leading: Icon(
              dc.macDinh
                  ? Icons.star
                  : Icons.location_on_outlined,
              color: dc.macDinh ? Colors.orange : null,
            ),
            title: Text(dc.hoTenNhan),
            subtitle: Text(dc.diaChiDayDu),
            trailing: PopupMenuButton<String>(
              onSelected: (value) {
                switch (value) {
                  case 'edit':
                    _onEdit(dc);
                    break;
                  case 'delete':
                    _onDelete(dc);
                    break;
                  case 'default':
                    _onSetDefault(dc);
                    break;
                }
              },
              itemBuilder: (_) => [
                const PopupMenuItem(
                  value: 'edit',
                  child: Text('Sửa'),
                ),
                const PopupMenuItem(
                  value: 'delete',
                  child: Text('Xóa'),
                ),
                if (!dc.macDinh)
                  const PopupMenuItem(
                    value: 'default',
                    child: Text('Đặt làm mặc định'),
                  ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _onAdd,
        child: const Icon(Icons.add),
      ),
    );
  }
}
