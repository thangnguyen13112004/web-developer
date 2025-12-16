import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../data/models/product/thuoc.dart';
import '../../data/repositories/product_repository.dart';
import '../../state/cart_provider.dart';

class ProductDetailScreen extends StatefulWidget {
  final int maThuoc;

  const ProductDetailScreen({super.key, required this.maThuoc});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final _repository = ProductRepository();
  Thuoc? _thuoc;
  bool _isLoading = true;
  int _quantity = 1;

  @override
  void initState() {
    super.initState();
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    try {
      final result = await _repository.getProductDetail(widget.maThuoc);
      setState(() {
        _thuoc = result;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không tải được chi tiết thuốc')),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _addToCart() async {
    if (_thuoc == null) return;
    try {
      await context
          .read<CartProvider>()
          .addToCart(_thuoc!.maThuoc, _quantity);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã thêm vào giỏ hàng')),
      );
    } catch (e) {
      if (!mounted) return;
      final msg = e.toString().replaceFirst('Exception: ', '');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg)),
      );
    }
  }


  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_thuoc == null) {
      return const Scaffold(
        body: Center(child: Text('Không tìm thấy thuốc')),
      );
    }

    final t = _thuoc!;
    final outOfStock = t.soLuongTon <= 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(t.tenThuoc),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ========= ẢNH THUỐC =========
            if (t.hinhAnh != null && t.hinhAnh!.isNotEmpty) ...[
              Center(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    t.hinhAnh!,               // dùng đúng field trong model
                    height: 200,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) =>
                    const Icon(Icons.broken_image, size: 80),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
            // ========= HẾT PHẦN ẢNH =========

            Text('Tồn kho: ${t.soLuongTon}'),
            const SizedBox(height: 8),
            if (outOfStock)
              const Text(
                'Sản phẩm hiện đang tạm hết hàng (Sắp có).',
                style: TextStyle(color: Colors.red),
              ),
            const SizedBox(height: 8),
            Text('Giá: ${t.giaBan.toStringAsFixed(0)} đ'),
            const SizedBox(height: 16),
            if (t.hoatChat != null) Text('Hoạt chất: ${t.hoatChat}'),
            if (t.lieuDung != null) ...[
              const SizedBox(height: 8),
              Text('Liều dùng: ${t.lieuDung}'),
            ],
            const Spacer(),
            Row(
              children: [
                IconButton(
                  onPressed: outOfStock
                      ? null
                      : () {
                    setState(() {
                      if (_quantity > 1) _quantity--;
                    });
                  },
                  icon: const Icon(Icons.remove),
                ),
                Text('$_quantity'),
                IconButton(
                  onPressed: outOfStock
                      ? null
                      : () {
                    setState(() {
                      _quantity++;
                    });
                  },
                  icon: const Icon(Icons.add),
                ),
                const Spacer(),
                ElevatedButton.icon(
                  onPressed: outOfStock ? null : _addToCart,
                  icon: const Icon(Icons.add_shopping_cart),
                  label: Text(outOfStock ? 'Sắp có' : 'Thêm vào giỏ'),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
