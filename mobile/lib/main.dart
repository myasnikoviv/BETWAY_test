import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'di/injection.dart';
import 'presentation/cubit/slip_cubit.dart';
import 'presentation/screens/slip_viewer_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await configureDependencies();
  runApp(const BetwayMobileApp());
}

/// Root application widget for the Betway Nigeria Booking Code Mobile Client.
class BetwayMobileApp extends StatelessWidget {
  const BetwayMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    const brandGreen = Color(0xFF005A36);

    return MaterialApp(
      title: 'Betway Nigeria Slip Viewer',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: brandGreen,
          primary: brandGreen,
          brightness: Brightness.light,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black87,
          elevation: 0,
          scrolledUnderElevation: 1,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: brandGreen,
          brightness: Brightness.dark,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1E1E1E),
          elevation: 0,
          scrolledUnderElevation: 1,
        ),
      ),
      home: BlocProvider<SlipCubit>(
        create: (_) => sl<SlipCubit>(),
        child: const SlipViewerScreen(),
      ),
    );
  }
}
