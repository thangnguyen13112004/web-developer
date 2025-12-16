import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../state/cart_provider.dart';
import '../checkout/checkout_screen.dart';
import '../../data/repositories/address_repository.dart';
import '../address/address_form_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<CartProvider>().loadCart());
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Giỏ hàng'),
      ),
      body: Builder(
        builder: (_) {
          if (cart.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (cart.items.isEmpty) {
            return const Center(child: Text('Giỏ hàng trống'));
          }

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: cart.items.length,
                  itemBuilder: (context, index) {
                    final item = cart.items[index];
                    return ListTile(
                      title: Text(item.tenThuoc),
                      subtitle: Text(
                        'SL: ${item.soLuong}  |  ${item.giaBan.toStringAsFixed(0)} đ',
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete),
                        onPressed: () async {
                          await cart.removeItem(item.maLo);
                        },
                      ),
                      onTap: () async {
                        // có thể popup để chỉnh số lượng, ở đây làm đơn giản
                      },
                    );
                  },
                ),
              ),
              Container(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
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
                        onPressed: () async {
                          final addressRepo = AddressRepository();

                          try {
                            final list = await addressRepo.getAddresses();
                            if (!mounted) return;

                            if (list.isEmpty) {
                              // Chưa có địa chỉ -> bắt user nhập
                              final created = await Navigator.of(context).push<bool>(
                                MaterialPageRoute(
                                  builder: (_) => const AddressFormScreen(),
                                ),
                              );

                              // Nếu đã tạo địa chỉ (created == true) thì sang Thanh toán
                              if (created == true) {
                                if (!mounted) return;
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const CheckoutScreen(),
                                  ),
                                );
                              }
                            } else {
                              // Đã có địa chỉ -> sang thẳng Thanh toán
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => const CheckoutScreen(),
                                ),
                              );
                            }
                          } catch (e) {
                            if (!mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Không tải được địa chỉ')),
                            );
                          }
                        },
                        child: const Text('Đặt hàng'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
