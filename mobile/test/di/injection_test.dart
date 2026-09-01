import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile/config/app_config.dart';
import 'package:mobile/di/injection.dart';
import 'package:mobile/domain/gateways/slip_gateway.dart';
import 'package:mobile/infrastructure/api/slip_rest_client.dart';
import 'package:mobile/infrastructure/gateways/slip_remote_gateway.dart';
import 'package:mobile/presentation/cubit/slip_cubit.dart';
import 'package:mobile/presentation/cubit/slip_state.dart';

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
      'registers default instances of AppConfig, Dio, SlipRestClient, SlipGateway, and SlipCubit',
      () async {
        await configureDependencies();

        expect(getIt.isRegistered<AppConfig>(), isTrue);
        expect(getIt.isRegistered<Dio>(), isTrue);
        expect(getIt.isRegistered<SlipRestClient>(), isTrue);
        expect(getIt.isRegistered<SlipGateway>(), isTrue);
        expect(getIt.isRegistered<SlipCubit>(), isTrue);

        final appConfig = getIt<AppConfig>();
        final dio = getIt<Dio>();
        final restClient = getIt<SlipRestClient>();
        final gateway = getIt<SlipGateway>();
        final cubit1 = getIt<SlipCubit>();
        final cubit2 = getIt<SlipCubit>();

        expect(appConfig.baseUrl, AppConfig.defaultProductionUrl);
        expect(dio.options.baseUrl, AppConfig.defaultProductionUrl);
        expect(restClient, isA<SlipRestClient>());
        expect(gateway, isA<SlipRemoteGateway>());
        expect(cubit1, isA<SlipCubit>());
        expect(cubit1.state, isA<SlipInitial>());
        // Factory registration produces new instances
        expect(identical(cubit1, cubit2), isFalse);
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

    test(
      'supports custom Dio, SlipGateway, and cubitFactory overrides for testing',
      () async {
        final mockGateway = MockSlipGateway();
        final mockDio = MockDio();
        final customCubit = SlipCubit(mockGateway);

        await configureDependencies(
          dio: mockDio,
          gateway: mockGateway,
          cubitFactory: () => customCubit,
        );

        expect(getIt<Dio>(), same(mockDio));
        expect(getIt<SlipGateway>(), same(mockGateway));
        expect(getIt<SlipCubit>(), same(customCubit));
      },
    );

    test('resetDependencies cleans up all registrations', () async {
      await configureDependencies();
      expect(getIt.isRegistered<SlipGateway>(), isTrue);
      expect(getIt.isRegistered<SlipCubit>(), isTrue);

      await resetDependencies();
      expect(getIt.isRegistered<AppConfig>(), isFalse);
      expect(getIt.isRegistered<Dio>(), isFalse);
      expect(getIt.isRegistered<SlipRestClient>(), isFalse);
      expect(getIt.isRegistered<SlipGateway>(), isFalse);
      expect(getIt.isRegistered<SlipCubit>(), isFalse);
    });
  });
}
