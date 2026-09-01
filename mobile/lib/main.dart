import 'package:flutter/material.dart';
import 'di/injection.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await configureDependencies();
  runApp(const BetwayMobileApp());
}

/// Root widget for Betway Nigeria Booking Code Mobile Client.
class BetwayMobileApp extends StatelessWidget {
  const BetwayMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Betway Booking Code',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF005A36), // Betway Green accent
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: const Scaffold(
        body: Center(child: Text('Betway Nigeria Booking Code Product')),
      ),
    );
  }
}
