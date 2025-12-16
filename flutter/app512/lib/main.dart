import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'data/repositories/cart_repository.dart';
import 'data/repositories/product_repository.dart';
import 'state/cart_provider.dart';
import 'state/product_provider.dart';
import 'presentation/auth/login_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => ProductProvider(ProductRepository()),
        ),
        ChangeNotifierProvider(
          create: (_) => CartProvider(CartRepository()),
        ),
      ],
      child: MaterialApp(
        title: 'Pharmacy Customer App',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorSchemeSeed: Colors.green,
        ),
        home: const LoginScreen(),
      ),
    );
  }
}
