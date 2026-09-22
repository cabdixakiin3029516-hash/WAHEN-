import 'package:flutter/material.dart';

import '../models/product.dart';

class CartScreen extends StatelessWidget {
  final List<Product> cart;

  const CartScreen({
    super.key,
    required this.cart,
  });

  double get totalPrice {
    return cart.fold(0, (sum, product) => sum + product.price);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cart'),
        backgroundColor: const Color(0xFF4338CA),
        foregroundColor: Colors.white,
      ),
      body: cart.isEmpty
          ? const Center(
              child: Text('Your cart is empty'),
            )
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Expanded(
                    child: ListView.separated(
                      itemCount: cart.length,
                      separatorBuilder: (_, __) => const Divider(),
                      itemBuilder: (context, index) {
                        final product = cart[index];
                        return ListTile(
                          leading: CircleAvatar(
                            radius: 22,
                            backgroundColor: const Color(0xFFEAF0FF),
                            child: Text(product.imageEmoji, style: const TextStyle(fontSize: 26)),
                          ),
                          title: Text(product.name),
                          subtitle: Text(product.seller),
                          trailing: Text('\$${product.price.toStringAsFixed(2)}'),
                        );
                      },
                    ),
                  ),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F6FF),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Payment method',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        const Wrap(
                          spacing: 8,
                          children: [
                            Chip(label: Text('Zaad')),
                            Chip(label: Text('E-Dahab')),
                            Chip(label: Text('Visa')),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Total', style: TextStyle(fontWeight: FontWeight.bold)),
                            Text(
                              '\$${totalPrice.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF4338CA),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Checkout started successfully')),
                              );
                            },
                            child: const Text('Checkout'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
