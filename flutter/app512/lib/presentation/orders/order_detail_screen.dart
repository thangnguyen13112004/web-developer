import 'package:flutter/material.dart';

import '../../data/models/order/client_order_detail.dart';
import '../../data/repositories/order_repository.dart';

class OrderDetailScreen extends StatefulWidget {
  final int maDH;

  const OrderDetailScreen({super.key, required this.maDH});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  final _repo = OrderRepository();
  ClientOrderDetail? _detail;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final d = await _repo.getOrderDetail(widget.maDH);
      setState(() {
        _detail = d;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatDate(DateTime dt) {
    return '${dt.day.toString().padLeft(2, '0')}/'
        '${dt.month.toString().padLeft(2, '0')}/'
        '${dt.year}';
  }

  @override
  Widget build(BuildContext context) {
    final d = _detail;

    return Scaffold(
      appBar: AppBar(
        title: Text('Đơn #${widget.maDH}'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(child: Text('Lỗi: $_error'))
          : d == null
          ? const Center(child: Text('Không tìm thấy đơn hàng'))
          : Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ListTile(
            title: Text('Trạng thái: ${d.trangThai}'),
            subtitle: Text(
              'Ngày đặt: ${_formatDate(d.ngayDat)}\n'
                  'Thanh toán: ${d.phuongThucThanhToan}',
            ),
          ),
          const Divider(),
          ListTile(
            title: const Text('Người nhận'),
            subtitle: Text(
              '${d.nguoiNhan} • ${d.sdt}\n${d.diaChiGiaoHang}',
            ),
          ),
          const Divider(),
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'Sản phẩm',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: d.chiTiet.length,
              itemBuilder: (context, index) {
                final item = d.chiTiet[index];
                return ListTile(
                  leading: item.hinhAnh != null
                      ? Image.network(
                    item.hinhAnh!,
                    width: 40,
                    height: 40,
                    fit: BoxFit.cover,
                  )
                      : const Icon(Icons.medication),
                  title: Text(item.tenThuoc),
                  subtitle: Text(
                    'SL: ${item.soLuong} ${item.donViTinh ?? ''}\n'
                        '${item.donGia.toStringAsFixed(0)} đ / đơn vị',
                  ),
                  trailing: Text(
                    '${item.thanhTien.toStringAsFixed(0)} đ',
                  ),
                );
              },
            ),
          ),
          const Divider(),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment:
                  MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Tiền hàng:'),
                    Text(
                        '${d.tienHang.toStringAsFixed(0)} đ'),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment:
                  MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Phí vận chuyển:'),
                    Text(
                        '${d.phiVanChuyen.toStringAsFixed(0)} đ'),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment:
                  MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Tổng thanh toán:',
                      style:
                      TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '${d.tongTien.toStringAsFixed(0)} đ',
                      style: const TextStyle(
                          fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
