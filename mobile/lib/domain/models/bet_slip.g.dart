// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bet_slip.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BetSlip _$BetSlipFromJson(Map<String, dynamic> json) => BetSlip(
  bookingCode: json['bookingCode'] as String?,
  selections: (json['selections'] as List<dynamic>)
      .map((e) => BetSelection.fromJson(e as Map<String, dynamic>))
      .toList(),
  totalOdds: (json['totalOdds'] as num).toDouble(),
  isSingleBet: json['isSingleBet'] as bool,
  createdAt: json['createdAt'] as String,
);

Map<String, dynamic> _$BetSlipToJson(BetSlip instance) => <String, dynamic>{
  'bookingCode': instance.bookingCode,
  'selections': instance.selections.map((e) => e.toJson()).toList(),
  'totalOdds': instance.totalOdds,
  'isSingleBet': instance.isSingleBet,
  'createdAt': instance.createdAt,
};
