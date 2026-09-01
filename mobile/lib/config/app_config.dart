/// Centralized application configuration.
class AppConfig {
  /// Default production API base URL.
  static const String defaultProductionUrl =
      'https://betway-assessment.vercel.app';

  /// Default Android emulator host loopback URL for local backend testing.
  static const String defaultAndroidEmulatorUrl = 'http://10.0.2.2:3000';

  /// Default iOS simulator / desktop localhost URL for local backend testing.
  static const String defaultLocalhostUrl = 'http://localhost:3000';

  /// Configured API base URL.
  final String baseUrl;

  /// Network connection timeout.
  final Duration connectTimeout;

  /// Network response receive timeout.
  final Duration receiveTimeout;

  /// Network send timeout.
  final Duration sendTimeout;

  const AppConfig({
    this.baseUrl = const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: defaultProductionUrl,
    ),
    this.connectTimeout = const Duration(seconds: 10),
    this.receiveTimeout = const Duration(seconds: 10),
    this.sendTimeout = const Duration(seconds: 10),
  });

  /// Factory constructor for local development on Android emulator.
  factory AppConfig.androidEmulator() =>
      const AppConfig(baseUrl: defaultAndroidEmulatorUrl);

  /// Factory constructor for local development on iOS Simulator or Web/Desktop.
  factory AppConfig.localhost() =>
      const AppConfig(baseUrl: defaultLocalhostUrl);

  /// Factory constructor for production deployment.
  factory AppConfig.production() =>
      const AppConfig(baseUrl: defaultProductionUrl);
}
