import 'package:equatable/equatable.dart';

/// Canonical application error codes across the domain and gateway boundary.
abstract class AppErrorCodes {
  static const String invalidInput = 'INVALID_INPUT';
  static const String bookingCodeNotFound = 'BOOKING_CODE_NOT_FOUND';
  static const String staleSelections = 'STALE_SELECTIONS';
  static const String upstreamBetwayError = 'UPSTREAM_BETWAY_ERROR';
  static const String networkError = 'NETWORK_ERROR';
  static const String internalServerError = 'INTERNAL_SERVER_ERROR';
}

/// Canonical Domain Exception / Error class.
/// Decoupled from transport libraries (Dio/Retrofit) and presentation layers.
class AppError extends Equatable implements Exception {
  /// Machine-readable error code (e.g. 'BOOKING_CODE_NOT_FOUND')
  final String code;

  /// Human-readable error message
  final String message;

  /// HTTP status code if originated from backend / transport
  final int? statusCode;

  /// Optional contextual details
  final dynamic details;

  const AppError({
    required this.code,
    required this.message,
    this.statusCode,
    this.details,
  });

  /// Factory for invalid input errors (HTTP 400).
  factory AppError.invalidInput({
    String message = 'Invalid input provided.',
    dynamic details,
  }) {
    return AppError(
      code: AppErrorCodes.invalidInput,
      message: message,
      statusCode: 400,
      details: details,
    );
  }

  /// Factory for not found errors (HTTP 404).
  factory AppError.notFound({
    String message =
        'The provided Betway booking code could not be found or has expired.',
    dynamic details,
  }) {
    return AppError(
      code: AppErrorCodes.bookingCodeNotFound,
      message: message,
      statusCode: 404,
      details: details,
    );
  }

  /// Factory for stale selection errors (HTTP 422).
  factory AppError.staleSelections({
    String message =
        'One or more selections are no longer active or available.',
    dynamic details,
  }) {
    return AppError(
      code: AppErrorCodes.staleSelections,
      message: message,
      statusCode: 422,
      details: details,
    );
  }

  /// Factory for upstream Betway errors (HTTP 502).
  factory AppError.upstreamError({
    String message = 'Failed to communicate with Betway upstream service.',
    dynamic details,
    int? statusCode,
  }) {
    return AppError(
      code: AppErrorCodes.upstreamBetwayError,
      message: message,
      statusCode: statusCode ?? 502,
      details: details,
    );
  }

  /// Factory for network / connectivity errors.
  factory AppError.networkError({
    String message =
        'Network connection failed. Please check your internet connection.',
    dynamic details,
  }) {
    return AppError(
      code: AppErrorCodes.networkError,
      message: message,
      details: details,
    );
  }

  /// Factory for internal / unhandled errors (HTTP 500).
  factory AppError.internal({
    String message = 'An unexpected internal error occurred.',
    dynamic details,
    int? statusCode,
  }) {
    return AppError(
      code: AppErrorCodes.internalServerError,
      message: message,
      statusCode: statusCode ?? 500,
      details: details,
    );
  }

  @override
  String toString() =>
      'AppError(code: $code, message: $message, statusCode: $statusCode)';

  @override
  List<Object?> get props => [code, message, statusCode, details];
}
