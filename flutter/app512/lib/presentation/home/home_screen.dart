import 'package:flutter/material.dart';

import '../cart/cart_screen.dart';
import '../product/product_list_screen.dart';
import '../account/account_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  // Tab 0 giờ là _HomeTab (màn trang chủ với danh mục)
  final List<Widget> _pages = const [
    _HomeTab(),
    CartScreen(),
    AccountScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.local_pharmacy),
            label: 'Trang chủ', // hoặc 'Thuốc' tùy bạn
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: 'Giỏ hàng',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Tài khoản',
          ),
        ],
        onTap: (index) {
          setState(() => _currentIndex = index);
        },
      ),
    );
  }
}

// ======= Màn tab 0: Trang chủ có danh mục =======

class _HomeTab extends StatelessWidget {
  const _HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    // Map đúng với cột maloai trong DB
    final categories = <_Category>[
      _Category(maLoai: 1, name: 'Thuốc', icon: Icons.medication),
      _Category(
        maLoai: 3,
        name: 'Thực phẩm bảo vệ sức khỏe',
        icon: Icons.health_and_safety,
      ),
      _Category(
        maLoai: 4,
        name: 'Chăm sóc cá nhân',
        icon: Icons.spa,
      ),
      _Category(
        maLoai: 5,
        name: 'Mẹ và Bé',
        icon: Icons.child_friendly,
      ),
      _Category(
        maLoai: 6,
        name: 'Chăm sóc sắc đẹp',
        icon: Icons.brush,
      ),
      _Category(
        maLoai: 7,
        name: 'Thiết bị y tế',
        icon: Icons.monitor_heart,
      ),
      _Category(
        maLoai: 8,
        name: 'Sản phẩm tiện lợi',
        icon: Icons.local_grocery_store,
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nhà thuốc online'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Danh mục',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),

            // Lưới danh mục
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: categories.length,
              gridDelegate:
              const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.9,
              ),
              itemBuilder: (context, index) {
                final c = categories[index];
                return InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => ProductListScreen(
                          maLoai: c.maLoai,
                          categoryTitle: c.name,
                        ),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: Colors.green.withOpacity(0.05),
                      border: Border.all(
                        color: Colors.green.withOpacity(0.3),
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          c.icon,
                          size: 32,
                          color: Colors.green[700],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          c.name,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 13),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),

            const SizedBox(height: 24),

            // Nút xem tất cả sản phẩm
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const ProductListScreen(),
                    ),
                  );
                },
                child: const Text('Xem tất cả sản phẩm'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Model nhỏ cho danh mục
class _Category {
  final int maLoai;
  final String name;
  final IconData icon;

  _Category({
    required this.maLoai,
    required this.name,
    required this.icon,
  });
}
