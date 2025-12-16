import 'package:flutter/material.dart';

import '../../data/models/order/client_order_summary.dart';
import '../../data/repositories/order_repository.dart';
import 'order_detail_screen.dart';

class OrderListScreen extends StatefulWidget {
  const OrderListScreen({super.key});

  @override
  State<OrderListScreen> createState() => _OrderListScreenState();
}

class _OrderListScreenState extends State<OrderListScreen> {
  final _repo = OrderRepository();
  List<ClientOrderSummary> _orders = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final list = await _repo.getClientOrders();
      setState(() {
        _orders = list;
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
    return Scaffold(
      appBar: AppBar(title: const Text('Đơn hàng của tôi')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(child: Text('Lỗi: $_error'))
          : _orders.isEmpty
          ? const Center(child: Text('Chưa có đơn hàng nào'))
          : RefreshIndicator(
        onRefresh: _loadOrders,
        child: ListView.builder(
          itemCount: _orders.length,
          itemBuilder: (context, index) {
            final o = _orders[index];
            return ListTile(
              title: Text('Đơn #${o.maDH}'),
              subtitle: Text(
                '${_formatDate(o.ngayDat)} • ${o.trangThai}\n'
                    'Thanh toán: ${o.phuongThucThanhToan}',
              ),
              isThreeLine: true,
              trailing:
              Text('${o.tongTien.toStringAsFixed(0)} đ'),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) =>
                        OrderDetailScreen(maDH: o.maDH),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
