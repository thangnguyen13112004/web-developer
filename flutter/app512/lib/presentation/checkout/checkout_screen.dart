import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../data/models/address/dia_chi.dart';
import '../../data/repositories/address_repository.dart';
import '../../state/cart_provider.dart';
import '../checkout/bank_transfer_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _addressRepository = AddressRepository();

  List<DiaChi> _addresses = [];
  DiaChi? _selectedAddress;
  String _phuongThucTT = 'COD';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAddresses();
  }

  Future<void> _loadAddresses() async {
    try {
      final list = await _addressRepository.getAddresses();

      if (!mounted) return;

      if (list.isEmpty) {
        // Không có địa chỉ nào
        setState(() {
          _addresses = [];
          _selectedAddress = null;
        });
      } else {
        // Có ít nhất 1 địa chỉ
        setState(() {
          _addresses = list;
          _selectedAddress =
              list.firstWhere((e) => e.macDinh, orElse: () => list.first);
        });
      }
    } catch (e) {
      if (!mounted) return;
      // ignore: avoid_print
      print('❌ Lỗi load địa chỉ: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không tải được địa chỉ')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _onConfirmOrder() async {
    if (_selectedAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn địa chỉ')),
      );
      return;
    }

    final cart = context.read<CartProvider>();
    final tongTien = cart.tongTien; // 👈 lưu lại trước khi clear giỏ

    try {
      // giờ checkout trả về orderId (int)
      final orderId = await cart.checkout(
        _selectedAddress!.maDC,
        _phuongThucTT,
      );

      if (!mounted) return;

      if (_phuongThucTT == 'BANK') {
        // Nếu thanh toán chuyển khoản → sang màn QR
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => BankTransferScreen(
              orderId: orderId,
              diaChi: _selectedAddress!,
              tongTien: tongTien,
            ),
          ),
        );
      } else {
        // COD: giữ behavior cũ
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đặt hàng thành công')),
        );
        Navigator.of(context).pop(); // quay lại giỏ
      }
    } catch (e) {
      if (!mounted) return;

      // Debug lỗi ra console cho dễ tra
      // ignore: avoid_print
      print('❌ Lỗi khi đặt hàng: $e');

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e.toString().replaceFirst('Exception: ', 'Đặt hàng thất bại: '),
          ),
        ),
      );
    }
  }
  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Thanh toán'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : (_addresses.isEmpty
          ? const Center(child: Text('Chưa có địa chỉ giao hàng'))
          : Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Địa chỉ giao hàng',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            DropdownButton<DiaChi>(
              isExpanded: true,
              value: _selectedAddress,
              items: _addresses
                  .map(
                    (dc) => DropdownMenuItem(
                  value: dc,
                  child: Text('${dc.hoTenNhan} - ${dc.diaChiDayDu}'),
                ),
              )
                  .toList(),
              onChanged: (value) {
                setState(() {
                  _selectedAddress = value;
                });
              },
            ),
            const SizedBox(height: 16),
            const Text(
              'Phương thức thanh toán',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            RadioListTile<String>(
              title: const Text('Thanh toán khi nhận hàng'),
              value: 'COD',
              groupValue: _phuongThucTT,
              onChanged: (value) {
                setState(() => _phuongThucTT = value!);
              },
            ),
            RadioListTile<String>(
              title: const Text('Chuyển khoản'),
              value: 'BANK',
              groupValue: _phuongThucTT,
              onChanged: (value) {
                setState(() => _phuongThucTT = value!);
              },
            ),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Tổng tiền:'),
                Text('${cart.tongTien.toStringAsFixed(0)} đ'),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _onConfirmOrder,
                child: const Text('Xác nhận đặt hàng'),
              ),
            ),
          ],
        ),
      )),
    );
  }
}
