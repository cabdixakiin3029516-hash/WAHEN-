import 'package:flutter/material.dart';

import 'cart_screen.dart';
import 'home_screen.dart';
import '../data/mock_data.dart';
import '../models/product.dart';

class WaHenApp extends StatelessWidget {
  const WaHenApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WaHeN Marketplace',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF4338CA)),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          centerTitle: false,
        ),
      ),
      home: const MainShell(),
    );
  }
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _selectedIndex = 0;
  final List<Product> _cart = [];
  final Set<String> _favorites = <String>{};

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(
        favorites: _favorites,
        cart: _cart,
        onAddToCart: _addToCart,
        onToggleFavorite: _toggleFavorite,
      ),
      CartScreen(cart: _cart),
      const OrdersScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) => setState(() => _selectedIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.shopping_cart_outlined), selectedIcon: Icon(Icons.shopping_cart), label: 'Cart'),
          NavigationDestination(icon: Icon(Icons.local_shipping_outlined), selectedIcon: Icon(Icons.local_shipping), label: 'Orders'),
        ],
      ),
    );
  }

  void _addToCart(Product product) {
    setState(() {
      _cart.add(product);
    });
  }

  void _toggleFavorite(Product product) {
    setState(() {
      if (_favorites.contains(product.id)) {
        _favorites.remove(product.id);
      } else {
        _favorites.add(product.id);
      }
    });
  }
}

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final trackingSteps = [
      {'title': 'Processing', 'status': 'Confirmed'},
      {'title': 'Shipped', 'status': 'In transit'},
      {'title': 'Out for Delivery', 'status': 'Driver assigned'},
      {'title': 'Delivered', 'status': 'Pending'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Orders'),
        backgroundColor: const Color(0xFF4338CA),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F6FF),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Order WH-2026-001',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  Text('Delivery: Hargeisa · ETA: 2-3 days'),
                  Text('Payment: Zaad Wallet'),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Tracking',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.separated(
                itemCount: trackingSteps.length,
                separatorBuilder: (_, __) => const Divider(),
                itemBuilder: (context, index) {
                  final step = trackingSteps[index];
                  return ListTile(
                    leading: CircleAvatar(
                      child: Text('${index + 1}'),
                    ),
                    title: Text(step['title'] as String),
                    subtitle: Text(step['status'] as String),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

void main() {
  runApp(const WaHenApp());
}
