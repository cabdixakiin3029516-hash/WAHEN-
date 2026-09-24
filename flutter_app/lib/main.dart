import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://hkmtlyknwsqxuxmvfaqv.supabase.co',
    // Halkan ku dhex paste-gareey key-ga aad ka soo koobiyaysay Supabase
    anonKey: 'sb_publishable_0JW5GQQnLPwmyRRbNQOBHg_QoBdH01S',
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
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
