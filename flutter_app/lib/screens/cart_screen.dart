import 'package:flutter/material.dart';
import '../models/product.dart';

class CartScreen extends StatefulWidget {
  final List<Product> cartItems;

  const CartScreen({super.key, required this.cartItems});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  @override
  Widget build(BuildContext context) {
    double total = widget.cartItems.fold(0, (sum, item) => sum + item.price);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text('Basket-kaaga (Cart)', style: TextStyle(color: Colors.white)),
      ),
      body: widget.cartItems.isEmpty
          ? const Center(child: Text('Cart-kaagu waa faaruq!'))
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: widget.cartItems.length,
                    itemBuilder: (context, index) {
                      final item = widget.cartItems[index];
                      return ListTile(
                        leading: Container(
                          width: 50,
                          height: 50,
                          color: Colors.grey[200],
                          child: item.imageUrl.isNotEmpty
                              ? Image.network(item.imageUrl, fit: BoxFit.cover)
                              : const Icon(Icons.shopping_bag),
                        ),
                        title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('\$${item.price.toStringAsFixed(2)}'),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () {
                            setState(() {
                              widget.cartItems.removeAt(index);
                            });
                          },
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(20.0),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Warta Guud (Total):', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          Text('\$${total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF2563EB),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Order-ka waa la gudbiyay!')),
                            );
                            setState(() {
                              widget.cartItems.clear();
                            });
                          },
                          child: const Text('Dhammaystir Iibsiga', style: TextStyle(color: Colors.white, fontSize: 16)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
