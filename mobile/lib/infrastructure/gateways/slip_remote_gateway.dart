import 'dart:io';
import 'package:dio/dio.dart';
import '../../domain/gateways/slip_gateway.dart';
import '../../domain/models/app_error.dart';
import '../../domain/models/bet_slip.dart';
import '../api/slip_rest_client.dart';
import '../dto/api_response_dto.dart';

/// Remote implementation of [SlipGateway] that communicates with the backend API.
///
/// Strictly encapsulates Dio and Retrofit transport details (DIP & Error Boundary).
/// Guarantees that callers (such as SlipCubit) receive only canonical domain models
/// or domain [AppError] exceptions.
class SlipRemoteGateway implements SlipGateway {
  final SlipRestClient _client;

  const SlipRemoteGateway(this._client);

  @override
  Future<BetSlip> resolve(String bookingCode) async {
    final trimmedCode = bookingCode.trim();
    if (trimmedCode.isEmpty) {
      throw AppError.invalidInput(message: 'Booking code must not be empty.');
    }

    try {
      final response = await _client.resolve({'bookingCode': trimmedCode});

      if (response.success && response.data != null) {
        return response.data!;
      }

      if (response.error != null) {
        throw _mapApiErrorDto(response.error!);
      }

      throw AppError.internal(
        message: 'Invalid response envelope from backend service.',
      );
    } on DioException catch (dioError) {
      throw _mapDioException(dioError);
    } on AppError {
      rethrow;
    } catch (unexpectedError) {
      throw AppError.internal(
        message: 'An unexpected error occurred: $unexpectedError',
      );
    }
  }

  /// Maps an [ApiErrorDto] envelope into a domain [AppError].
  AppError _mapApiErrorDto(ApiErrorDto errorDto, [int? statusCode]) {
    switch (errorDto.code) {
      case AppErrorCodes.invalidInput:
        return AppError.invalidInput(
          message: errorDto.message,
          details: errorDto.details,
        );
      case AppErrorCodes.bookingCodeNotFound:
        return AppError.notFound(
          message: errorDto.message,
          details: errorDto.details,
        );
      case AppErrorCodes.staleSelections:
        return AppError.staleSelections(
          message: errorDto.message,
          details: errorDto.details,
        );
      case AppErrorCodes.upstreamBetwayError:
        return AppError.upstreamError(
          message: errorDto.message,
          details: errorDto.details,
          statusCode: statusCode,
        );
      default:
        return AppError(
          code: errorDto.code,
          message: errorDto.message,
          statusCode: statusCode,
          details: errorDto.details,
        );
    }
  }

  /// Maps a [DioException] into a domain [AppError].
  AppError _mapDioException(DioException dioError) {
    final statusCode = dioError.response?.statusCode;
    final responseData = dioError.response?.data;

    // 1. Attempt to parse backend error envelope if available
    if (responseData is Map<String, dynamic>) {
      final errorMap = responseData['error'];
      if (errorMap is Map<String, dynamic>) {
        try {
          final errorDto = ApiErrorDto.fromJson(errorMap);
          return _mapApiErrorDto(errorDto, statusCode);
        } catch (_) {
          // Fallback to HTTP status mapping if error DTO fails parsing
        }
      }
    }

    // 2. Map based on HTTP status code
    if (statusCode != null) {
      switch (statusCode) {
        case 400:
          return AppError.invalidInput(
            message: 'Invalid booking code format.',
            details: responseData,
          );
        case 404:
          return AppError.notFound(
            message: 'The requested booking code was not found.',
            details: responseData,
          );
        case 422:
          return AppError.staleSelections(
            message:
                'One or more selections in this slip are no longer active.',
            details: responseData,
          );
        case 502:
        case 503:
        case 504:
          return AppError.upstreamError(
            message: 'Upstream Betway service is currently unavailable.',
            statusCode: statusCode,
            details: responseData,
          );
        default:
          return AppError.internal(
            message:
                'Backend server error (${dioError.response?.statusMessage ?? statusCode}).',
            statusCode: statusCode,
            details: responseData,
          );
      }
    }

    // 3. Map transport / connectivity errors
    switch (dioError.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return AppError.networkError(
          message:
              'Connection timed out. Please verify your network and retry.',
          details: dioError.message,
        );
      case DioExceptionType.connectionError:
        return AppError.networkError(
          message:
              'Unable to connect to server. Please check your network connection.',
          details: dioError.message,
        );
      case DioExceptionType.cancel:
        return const AppError(
          code: 'REQUEST_CANCELLED',
          message: 'The request was cancelled.',
        );
      case DioExceptionType.badCertificate:
        return AppError.networkError(
          message: 'Security certificate verification failed.',
          details: dioError.message,
        );
      case DioExceptionType.badResponse:
      case DioExceptionType.unknown:
      default:
        if (dioError.error is SocketException) {
          return AppError.networkError(
            message: 'Network connection unreachable.',
            details: dioError.error.toString(),
          );
        }
        return AppError.internal(
          message: dioError.message ?? 'An unexpected network error occurred.',
          details: dioError.error?.toString(),
        );
    }
  }
}
