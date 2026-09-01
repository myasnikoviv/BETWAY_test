import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../domain/models/bet_slip.dart';
import '../dto/api_response_dto.dart';

part 'slip_rest_client.g.dart';

/// Retrofit REST client for Betway booking code operations.
/// Interacts strictly with our backend API (/api/v1/*), never with Betway directly (INV-01).
@RestApi()
abstract class SlipRestClient {
  factory SlipRestClient(Dio dio, {String? baseUrl}) = _SlipRestClient;

  /// Sends a request to resolve a booking code into a canonical BetSlip.
  @POST('/api/v1/resolve')
  Future<ApiResponseDto<BetSlip>> resolve(@Body() Map<String, dynamic> body);
}
