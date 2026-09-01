import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/domain/models/app_error.dart';

void main() {
  group('AppError', () {
    test('creates invalidInput error with correct code and status 400', () {
      final error = AppError.invalidInput(
        message: 'Code format invalid',
        details: {'field': 'code'},
      );
      expect(error.code, AppErrorCodes.invalidInput);
      expect(error.message, 'Code format invalid');
      expect(error.statusCode, 400);
      expect(error.details, {'field': 'code'});
    });

    test('creates notFound error with correct code and status 404', () {
      final error = AppError.notFound();
      expect(error.code, AppErrorCodes.bookingCodeNotFound);
      expect(error.statusCode, 404);
      expect(error.message, contains('could not be found'));
    });

    test('creates staleSelections error with correct code and status 422', () {
      final error = AppError.staleSelections();
      expect(error.code, AppErrorCodes.staleSelections);
      expect(error.statusCode, 422);
      expect(error.message, contains('no longer active'));
    });

    test('creates upstreamError with correct code and status 502', () {
      final error = AppError.upstreamError();
      expect(error.code, AppErrorCodes.upstreamBetwayError);
      expect(error.statusCode, 502);
      expect(error.message, contains('upstream service'));
    });

    test('creates networkError with correct code', () {
      final error = AppError.networkError();
      expect(error.code, AppErrorCodes.networkError);
      expect(error.statusCode, isNull);
      expect(error.message, contains('internet connection'));
    });

    test('creates internal error with correct code and status 500', () {
      final error = AppError.internal();
      expect(error.code, AppErrorCodes.internalServerError);
      expect(error.statusCode, 500);
      expect(error.message, contains('unexpected internal error'));
    });

    test('implements value equality via Equatable', () {
      final err1 = AppError.notFound(message: 'Slip not found');
      final err2 = AppError.notFound(message: 'Slip not found');
      final err3 = AppError.invalidInput(message: 'Slip not found');

      expect(err1, equals(err2));
      expect(err1.hashCode, equals(err2.hashCode));
      expect(err1, isNot(equals(err3)));
    });

    test('toString returns formatted string representation', () {
      final error = AppError.notFound(message: 'Not found');
      expect(
        error.toString(),
        'AppError(code: BOOKING_CODE_NOT_FOUND, message: Not found, statusCode: 404)',
      );
    });
  });
}
