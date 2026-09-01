import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import '../config/app_config.dart';
import '../domain/gateways/slip_gateway.dart';
import '../infrastructure/api/slip_rest_client.dart';
import '../infrastructure/gateways/slip_remote_gateway.dart';
import '../presentation/cubit/slip_cubit.dart';

/// Global service locator instance.
final GetIt getIt = GetIt.instance;

/// Short alias for [getIt].
GetIt get sl => getIt;

/// Configures and registers all application dependencies in the GetIt composition root.
///
/// Supports optional test overrides for [baseUrl], [dio], [gateway], [config], and [cubitFactory].
Future<void> configureDependencies({
  String? baseUrl,
  Dio? dio,
  SlipGateway? gateway,
  AppConfig? config,
  SlipCubit Function()? cubitFactory,
}) async {
  // 1. AppConfig Registration
  final appConfig =
      config ??
      (baseUrl != null ? AppConfig(baseUrl: baseUrl) : const AppConfig());

  if (!getIt.isRegistered<AppConfig>()) {
    getIt.registerLazySingleton<AppConfig>(() => appConfig);
  }

  // 2. Dio Client Registration
  final configuredDio =
      dio ??
      Dio(
        BaseOptions(
          baseUrl: appConfig.baseUrl,
          connectTimeout: appConfig.connectTimeout,
          receiveTimeout: appConfig.receiveTimeout,
          sendTimeout: appConfig.sendTimeout,
          headers: const {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        ),
      );

  if (!getIt.isRegistered<Dio>()) {
    getIt.registerLazySingleton<Dio>(() => configuredDio);
  }

  // 3. REST API Client Registration
  if (!getIt.isRegistered<SlipRestClient>()) {
    getIt.registerLazySingleton<SlipRestClient>(
      () => SlipRestClient(getIt<Dio>(), baseUrl: appConfig.baseUrl),
    );
  }

  // 4. Domain Gateway Registration
  if (!getIt.isRegistered<SlipGateway>()) {
    if (gateway != null) {
      getIt.registerLazySingleton<SlipGateway>(() => gateway);
    } else {
      getIt.registerLazySingleton<SlipGateway>(
        () => SlipRemoteGateway(getIt<SlipRestClient>()),
      );
    }
  }

  // 5. Presentation Layer / Cubit Registration
  if (!getIt.isRegistered<SlipCubit>()) {
    if (cubitFactory != null) {
      getIt.registerFactory<SlipCubit>(cubitFactory);
    } else {
      getIt.registerFactory<SlipCubit>(() => SlipCubit(getIt<SlipGateway>()));
    }
  }
}

/// Resets all registered dependencies in the locator (useful in test teardown).
Future<void> resetDependencies() async {
  await getIt.reset();
}
