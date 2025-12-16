import 'package:flutter/material.dart';

import '../address/address_list_screen.dart';
import '../orders/order_list_screen.dart';
import '../profile/profile_screen.dart';
import '../auth/login_screen.dart';
import '../../data/repositories/auth_repository.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tài khoản')),
      body: ListView(
        children: [
          ListTile(
            leading: const Icon(Icons.person),
            title: const Text('Thông tin cá nhân'),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ProfileScreen()),
              );
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.location_on),
            title: const Text('Địa chỉ giao hàng'),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const AddressListScreen()),
              );
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.receipt_long),
            title: const Text('Đơn hàng của tôi'),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const OrderListScreen()),
              );
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Đăng xuất'),
            onTap: () async {
              await AuthRepository().logout();
              // quay về Login, clear stack
              // ignore: use_build_context_synchronously
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (route) => false,
              );
            },
          ),
        ],
      ),
    );
  }
}
