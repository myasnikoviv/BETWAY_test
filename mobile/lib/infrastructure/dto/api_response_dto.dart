import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'api_response_dto.g.dart';

/// Error details within the standard backend response envelope.
@JsonSerializable()
class ApiErrorDto extends Equatable {
  final String code;
  final String message;
  final dynamic details;

  const ApiErrorDto({required this.code, required this.message, this.details});

  factory ApiErrorDto.fromJson(Map<String, dynamic> json) =>
      _$ApiErrorDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ApiErrorDtoToJson(this);

  @override
  List<Object?> get props => [code, message, details];
}

/// Standard JSON envelope returned by all `/api/v1/*` backend endpoints.
@JsonSerializable(genericArgumentFactories: true)
class ApiResponseDto<T> extends Equatable {
  final bool success;
  final T? data;
  final ApiErrorDto? error;

  const ApiResponseDto({required this.success, this.data, this.error});

  factory ApiResponseDto.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) => _$ApiResponseDtoFromJson(json, fromJsonT);

  Map<String, dynamic> toJson(Object? Function(T value) toJsonT) =>
      _$ApiResponseDtoToJson(this, toJsonT);

  @override
  List<Object?> get props => [success, data, error];
}
