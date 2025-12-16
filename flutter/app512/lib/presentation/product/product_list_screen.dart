import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../state/product_provider.dart';
import 'product_detail_screen.dart';

class ProductListScreen extends StatefulWidget {
  /// Mã loại để lọc (maloai trong DB). Nếu null -> hiển thị tất cả.
  final int? maLoai;

  /// Tiêu đề cho AppBar khi lọc theo loại (ví dụ: "Thuốc", "Mẹ và Bé"...)
  final String? categoryTitle;

  const ProductListScreen({
    super.key,
    this.maLoai,
    this.categoryTitle,
  });

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
          () => context.read<ProductProvider>().fetchProducts(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ProductProvider>();

    // Lấy list sản phẩm từ provider
    final allProducts = provider.products;

    // Lọc theo maLoai nếu có
    final products = widget.maLoai == null
        ? allProducts
        : allProducts.where((p) => p.maLoai == widget.maLoai).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.categoryTitle == null
              ? 'Danh sách thuốc'
              : 'Danh mục: ${widget.categoryTitle}',
        ),
      ),
      body: Builder(
        builder: (_) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (provider.error != null) {
            return Center(child: Text(provider.error!));
          }
          if (products.isEmpty) {
            return const Center(child: Text('Không có sản phẩm'));
          }

          return ListView.builder(
            itemCount: products.length,
            itemBuilder: (context, index) {
              final p = products[index];
              final outOfStock = p.soLuongTon <= 0;

              return ListTile(
                leading: Builder(
                  builder: (context) {
                    final url = p.hinhAnh?.trim();
                    if (url != null && url.isNotEmpty) {
                      return ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: Image.network(
                          url,
                          width: 48,
                          height: 48,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            // ignore: avoid_print
                            print(
                                '! Lỗi load hình cho ${p.tenThuoc}: $error');
                            return const Icon(Icons.medication);
                          },
                        ),
                      );
                    }
                    return const Icon(Icons.medication);
                  },
                ),
                title: Text(p.tenThuoc),
                subtitle: Text(
                  outOfStock
                      ? 'Sắp có'
                      : '${p.giaBan.toStringAsFixed(0)} đ (Còn ${p.soLuongTon})',
                ),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) =>
                          ProductDetailScreen(maThuoc: p.maThuoc),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}
