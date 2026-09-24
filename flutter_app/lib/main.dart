import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Geli Anon Key-gaaga dhabta ah ee Supabase
  await Supabase.initialize(
    url: 'https://hkmtlyknwsqxuxmvfaqv.supabase.co',
    anonKey: 'GELI_SUPABASE_ANON_KEY_GAAGA_HALKAN',
  );

  runApp(const WahenApp());
}

final supabase = Supabase.instance.client;

class WahenApp extends StatelessWidget {
  const WahenApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WaHeN Marketplace',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2563EB),
          primary: const Color(0xFF0F172A),
          secondary: const Color(0xFF2563EB),
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
