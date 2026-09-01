import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile/domain/models/app_error.dart';
import 'package:mobile/domain/models/bet_selection.dart';
import 'package:mobile/domain/models/bet_slip.dart';
import 'package:mobile/infrastructure/api/slip_rest_client.dart';
import 'package:mobile/infrastructure/dto/api_response_dto.dart';
import 'package:mobile/infrastructure/gateways/slip_remote_gateway.dart';

class MockSlipRestClient extends Mock implements SlipRestClient {}

void main() {
  late MockSlipRestClient mockClient;
  late SlipRemoteGateway gateway;

  setUp(() {
    mockClient = MockSlipRestClient();
    gateway = SlipRemoteGateway(mockClient);
  });

  const sampleSelection = BetSelection(
    eventId: '72221212',
    eventName: 'Aston Villa vs. Arsenal FC',
    marketId: '72221212546',
    marketName: 'Double Chance & Both Teams To Score (GG/NG)',
    selectionId: '722212125461718',
    selectionName: 'Aston Villa/Draw & Yes',
    odds: 3.35,
    sportId: 'soccer',
    league: 'Premier League',
    region: 'England',
  );

  final sampleSlip = BetSlip.create(
    bookingCode: 'BW6D7ABCFB',
    selections: [sampleSelection],
    totalOdds: 3.35,
    isSingleBet: true,
    createdAt: '2026-08-31T15:40:00.000Z',
  );

  group('SlipRemoteGateway.resolve', () {
    test(
      'successfully resolves booking code and returns canonical BetSlip',
      () async {
        when(
          () => mockClient.resolve({'bookingCode': 'BW6D7ABCFB'}),
        ).thenAnswer(
          (_) async => ApiResponseDto<BetSlip>(success: true, data: sampleSlip),
        );

        final result = await gateway.resolve('BW6D7ABCFB');

        expect(result, equals(sampleSlip));
        verify(
          () => mockClient.resolve({'bookingCode': 'BW6D7ABCFB'}),
        ).called(1);
      },
    );

    test('trims whitespace from booking code input', () async {
      when(() => mockClient.resolve({'bookingCode': 'BW6D7ABCFB'})).thenAnswer(
        (_) async => ApiResponseDto<BetSlip>(success: true, data: sampleSlip),
      );

      final result = await gateway.resolve('  BW6D7ABCFB  ');

      expect(result, equals(sampleSlip));
      verify(() => mockClient.resolve({'bookingCode': 'BW6D7ABCFB'})).called(1);
    });

    test(
      'throws AppError.invalidInput for empty booking code without calling API',
      () async {
        expect(
          () => gateway.resolve('   '),
          throwsA(
            isA<AppError>()
                .having((e) => e.code, 'code', AppErrorCodes.invalidInput)
                .having(
                  (e) => e.message,
                  'message',
                  contains('must not be empty'),
                ),
          ),
        );

        verifyNever(() => mockClient.resolve(any()));
      },
    );

    test(
      'maps backend error envelope with BOOKING_CODE_NOT_FOUND to AppError.notFound',
      () async {
        when(
          () => mockClient.resolve({'bookingCode': 'BW404NOTFOUND'}),
        ).thenAnswer(
          (_) async => const ApiResponseDto<BetSlip>(
            success: false,
            error: ApiErrorDto(
              code: 'BOOKING_CODE_NOT_FOUND',
              message: 'The booking code was not found.',
            ),
          ),
        );

        expect(
          () => gateway.resolve('BW404NOTFOUND'),
          throwsA(
            isA<AppError>()
                .having(
                  (e) => e.code,
                  'code',
                  AppErrorCodes.bookingCodeNotFound,
                )
                .having(
                  (e) => e.message,
                  'message',
                  'The booking code was not found.',
                ),
          ),
        );
      },
    );

    test(
      'maps backend error envelope with INVALID_INPUT to AppError.invalidInput',
      () async {
        when(() => mockClient.resolve({'bookingCode': 'INV'})).thenAnswer(
          (_) async => const ApiResponseDto<BetSlip>(
            success: false,
            error: ApiErrorDto(
              code: 'INVALID_INPUT',
              message: 'Invalid code format.',
            ),
          ),
        );

        expect(
          () => gateway.resolve('INV'),
          throwsA(
            isA<AppError>()
                .having((e) => e.code, 'code', AppErrorCodes.invalidInput)
                .having((e) => e.message, 'message', 'Invalid code format.'),
          ),
        );
      },
    );

    test(
      'maps backend error envelope with STALE_SELECTIONS to AppError.staleSelections',
      () async {
        when(() => mockClient.resolve({'bookingCode': 'BWSTALE'})).thenAnswer(
          (_) async => const ApiResponseDto<BetSlip>(
            success: false,
            error: ApiErrorDto(
              code: 'STALE_SELECTIONS',
              message: 'Selections have expired.',
            ),
          ),
        );

        expect(
          () => gateway.resolve('BWSTALE'),
          throwsA(
            isA<AppError>()
                .having((e) => e.code, 'code', AppErrorCodes.staleSelections)
                .having(
                  (e) => e.message,
                  'message',
                  'Selections have expired.',
                ),
          ),
        );
      },
    );

    test(
      'maps backend error envelope with UPSTREAM_BETWAY_ERROR to AppError.upstreamError',
      () async {
        when(
          () => mockClient.resolve({'bookingCode': 'BWUPSTREAM'}),
        ).thenAnswer(
          (_) async => const ApiResponseDto<BetSlip>(
            success: false,
            error: ApiErrorDto(
              code: 'UPSTREAM_BETWAY_ERROR',
              message: 'Upstream Betway timeout.',
            ),
          ),
        );

        expect(
          () => gateway.resolve('BWUPSTREAM'),
          throwsA(
            isA<AppError>()
                .having(
                  (e) => e.code,
                  'code',
                  AppErrorCodes.upstreamBetwayError,
                )
                .having(
                  (e) => e.message,
                  'message',
                  'Upstream Betway timeout.',
                ),
          ),
        );
      },
    );

    test(
      'throws AppError.internal if backend envelope has success=false but no error payload',
      () async {
        when(() => mockClient.resolve({'bookingCode': 'BWNOERROR'})).thenAnswer(
          (_) async => const ApiResponseDto<BetSlip>(
            success: false,
            data: null,
            error: null,
          ),
        );

        expect(
          () => gateway.resolve('BWNOERROR'),
          throwsA(
            isA<AppError>()
                .having(
                  (e) => e.code,
                  'code',
                  AppErrorCodes.internalServerError,
                )
                .having(
                  (e) => e.message,
                  'message',
                  contains('Invalid response envelope'),
                ),
          ),
        );
      },
    );

    group('DioException mapping', () {
      test('maps DioException with parsed 404 envelope payload', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '/api/v1/resolve'),
          response: Response(
            statusCode: 404,
            requestOptions: RequestOptions(path: '/api/v1/resolve'),
            data: {
              'success': false,
              'error': {
                'code': 'BOOKING_CODE_NOT_FOUND',
                'message': 'Code does not exist on Betway.',
              },
            },
          ),
        );

        when(() => mockClient.resolve(any())).thenThrow(dioException);

        expect(
          () => gateway.resolve('BW404'),
          throwsA(
            isA<AppError>()
                .having(
                  (e) => e.code,
                  'code',
                  AppErrorCodes.bookingCodeNotFound,
                )
                .having(
                  (e) => e.message,
                  'message',
                  'Code does not exist on Betway.',
                )
                .having((e) => e.statusCode, 'statusCode', 404),
          ),
        );
      });

      test('maps DioException with 400 status code fallback', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '/api/v1/resolve'),
          response: Response(
            statusCode: 400,
            requestOptions: RequestOptions(path: '/api/v1/resolve'),
            data: 'Bad request text',
          ),
        );

        when(() => mockClient.resolve(any())).thenThrow(dioException);

        expect(
          () => gateway.resolve('BW400'),
          throwsA(
            isA<AppError>()
                .having((e) => e.code, 'code', AppErrorCodes.invalidInput)
                .having((e) => e.statusCode, 'statusCode', 400),
          ),
        );
      });

      test('maps DioException with 422 status code fallback', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '/api/v1/resolve'),
          response: Response(
            statusCode: 422,
            requestOptions: RequestOptions(path: '/api/v1/resolve'),
            data: 'Stale',
          ),
        );

        when(() => mockClient.resolve(any())).thenThrow(dioException);

        expect(
          () => gateway.resolve('BW422'),
          throwsA(
            isA<AppError>()
                .having((e) => e.code, 'code', AppErrorCodes.staleSelections)
                .having((e) => e.statusCode, 'statusCode', 422),
          ),
        );
      });

      test('maps DioException with 502 status code fallback', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '/api/v1/resolve'),
          response: Response(
            statusCode: 502,
            requestOptions: RequestOptions(path: '/api/v1/resolve'),
            data: 'Bad Gateway',
          ),
        );

        when(() => mockClient.resolve(any())).thenThrow(dioException);

        expect(
          () => gateway.resolve('BW502'),
          throwsA(
            isA<AppError>()
                .having(
                  (e) => e.code,
                  'code',
                  AppErrorCodes.upstreamBetwayError,
                )
                .having((e) => e.statusCode, 'statusCode', 502),
          ),
        );
      });

      test(
        'maps connection timeout DioException to AppError.networkError',
        () async {
          final dioException = DioException(
            requestOptions: RequestOptions(path: '/api/v1/resolve'),
            type: DioExceptionType.connectionTimeout,
            message: 'Connection timed out',
          );

          when(() => mockClient.resolve(any())).thenThrow(dioException);

          expect(
            () => gateway.resolve('BWTIMEOUT'),
            throwsA(
              isA<AppError>()
                  .having((e) => e.code, 'code', AppErrorCodes.networkError)
                  .having(
                    (e) => e.message,
                    'message',
                    contains('Connection timed out'),
                  ),
            ),
          );
        },
      );

      test(
        'maps receive timeout DioException to AppError.networkError',
        () async {
          final dioException = DioException(
            requestOptions: RequestOptions(path: '/api/v1/resolve'),
            type: DioExceptionType.receiveTimeout,
            message: 'Receive timed out',
          );

          when(() => mockClient.resolve(any())).thenThrow(dioException);

          expect(
            () => gateway.resolve('BWTIMEOUT'),
            throwsA(
              isA<AppError>()
                  .having((e) => e.code, 'code', AppErrorCodes.networkError)
                  .having(
                    (e) => e.message,
                    'message',
                    contains('Connection timed out'),
                  ),
            ),
          );
        },
      );

      test(
        'maps connection error DioException to AppError.networkError',
        () async {
          final dioException = DioException(
            requestOptions: RequestOptions(path: '/api/v1/resolve'),
            type: DioExceptionType.connectionError,
            message: 'Connection refused',
          );

          when(() => mockClient.resolve(any())).thenThrow(dioException);

          expect(
            () => gateway.resolve('BWCONNERRO'),
            throwsA(
              isA<AppError>()
                  .having((e) => e.code, 'code', AppErrorCodes.networkError)
                  .having(
                    (e) => e.message,
                    'message',
                    contains('Unable to connect to server'),
                  ),
            ),
          );
        },
      );

      test(
        'maps badCertificate DioException to AppError.networkError',
        () async {
          final dioException = DioException(
            requestOptions: RequestOptions(path: '/api/v1/resolve'),
            type: DioExceptionType.badCertificate,
            message: 'Cert invalid',
          );

          when(() => mockClient.resolve(any())).thenThrow(dioException);

          expect(
            () => gateway.resolve('BWCERT'),
            throwsA(
              isA<AppError>()
                  .having((e) => e.code, 'code', AppErrorCodes.networkError)
                  .having(
                    (e) => e.message,
                    'message',
                    contains('certificate verification failed'),
                  ),
            ),
          );
        },
      );

      test('maps cancel DioException to REQUEST_CANCELLED AppError', () async {
        final dioException = DioException(
          requestOptions: RequestOptions(path: '/api/v1/resolve'),
          type: DioExceptionType.cancel,
        );

        when(() => mockClient.resolve(any())).thenThrow(dioException);

        expect(
          () => gateway.resolve('BWCANCEL'),
          throwsA(
            isA<AppError>()
                .having((e) => e.code, 'code', 'REQUEST_CANCELLED')
                .having(
                  (e) => e.message,
                  'message',
                  'The request was cancelled.',
                ),
          ),
        );
      });
    });

    test('maps other generic exceptions to AppError.internal', () async {
      when(
        () => mockClient.resolve(any()),
      ).thenThrow(Exception('Unexpected crash'));

      expect(
        () => gateway.resolve('BWERR'),
        throwsA(
          isA<AppError>()
              .having((e) => e.code, 'code', AppErrorCodes.internalServerError)
              .having(
                (e) => e.message,
                'message',
                contains('Unexpected crash'),
              ),
        ),
      );
    });
  });
}
