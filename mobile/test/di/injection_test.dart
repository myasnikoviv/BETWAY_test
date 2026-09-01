import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile/config/app_config.dart';
import 'package:mobile/di/injection.dart';
import 'package:mobile/domain/gateways/slip_gateway.dart';
import 'package:mobile/infrastructure/api/slip_rest_client.dart';
import 'package:mobile/infrastructure/gateways/slip_remote_gateway.dart';

class MockSlipGateway extends Mock implements SlipGateway {}

class MockDio extends Mock implements Dio {}

void main() {
  setUp(() async {
    await resetDependencies();
  });

  tearDown(() async {
    await resetDependencies();
  });

  group('Dependency Injection (GetIt composition root)', () {
    test(
      'registers default instances of AppConfig, Dio, SlipRestClient, and SlipGateway',
      () async {
        await configureDependencies();

        expect(getIt.isRegistered<AppConfig>(), isTrue);
        expect(getIt.isRegistered<Dio>(), isTrue);
        expect(getIt.isRegistered<SlipRestClient>(), isTrue);
        expect(getIt.isRegistered<SlipGateway>(), isTrue);

        final appConfig = getIt<AppConfig>();
        final dio = getIt<Dio>();
        final restClient = getIt<SlipRestClient>();
        final gateway = getIt<SlipGateway>();

        expect(appConfig.baseUrl, AppConfig.defaultProductionUrl);
        expect(dio.options.baseUrl, AppConfig.defaultProductionUrl);
        expect(restClient, isA<SlipRestClient>());
        expect(gateway, isA<SlipRemoteGateway>());
      },
    );

    test('supports baseUrl parameter override', () async {
      const customUrl = 'https://custom-api.betway.test';
      await configureDependencies(baseUrl: customUrl);

      final appConfig = getIt<AppConfig>();
      final dio = getIt<Dio>();

      expect(appConfig.baseUrl, customUrl);
      expect(dio.options.baseUrl, customUrl);
    });

    test('supports custom Dio and SlipGateway overrides for testing', () async {
      final mockGateway = MockSlipGateway();
      final mockDio = MockDio();

      await configureDependencies(dio: mockDio, gateway: mockGateway);

      expect(getIt<Dio>(), same(mockDio));
      expect(getIt<SlipGateway>(), same(mockGateway));
    });

    test('resetDependencies cleans up all registrations', () async {
      await configureDependencies();
      expect(getIt.isRegistered<SlipGateway>(), isTrue);

      await resetDependencies();
      expect(getIt.isRegistered<AppConfig>(), isFalse);
      expect(getIt.isRegistered<Dio>(), isFalse);
      expect(getIt.isRegistered<SlipRestClient>(), isFalse);
      expect(getIt.isRegistered<SlipGateway>(), isFalse);
    });
  });
}
