import 'package:flutter/material.dart';

import '../../data/models/address/dia_chi.dart';

class BankTransferScreen extends StatelessWidget {
  final int orderId;
  final DiaChi diaChi;
  final double tongTien;

  const BankTransferScreen({
    super.key,
    required this.orderId,
    required this.diaChi,
    required this.tongTien,
  });

  @override
  Widget build(BuildContext context) {
    final maDonHang = orderId.toString();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Thanh toán chuyển khoản'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Mã đơn + tổng tiền
              Text(
                'Mã đơn hàng: #$maDonHang',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Tổng tiền: ${tongTien.toStringAsFixed(0)} đ',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),

              const SizedBox(height: 16),

              // Thông tin người nhận
              const Text(
                'Thông tin người nhận',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 8),
              Text('Họ tên: ${diaChi.hoTenNhan}'),
              if (diaChi.sdtNhan != null && diaChi.sdtNhan!.isNotEmpty)
                Text('SĐT: ${diaChi.sdtNhan}'),
              Text('Địa chỉ: ${diaChi.diaChiDayDu}'),

              const SizedBox(height: 24),

              // QR
              const Text(
                'Quét mã QR để chuyển khoản',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: Image.asset(
                  'assets/images/qr_bank.jpg',
                  height: 220,
                  fit: BoxFit.contain,
                ),
              ),

              const SizedBox(height: 24),

              // Lưu ý
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.orange.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.orange),
                ),
                child: Text(
                  'Lưu ý:\n'
                      '- Khi chuyển khoản, vui lòng ghi rõ **MÃ ĐƠN HÀNG: #$maDonHang** '
                      'ở phần *nội dung chuyển khoản*.\n'
                      '- Ví dụ nội dung: "Thanh toan don hang #$maDonHang".\n'
                      '- Nếu không ghi mã đơn hàng, hệ thống có thể xử lý chậm hoặc '
                      'không thể đối soát thanh toán.',
                  style: const TextStyle(fontSize: 14),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
