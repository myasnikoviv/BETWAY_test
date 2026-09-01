// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bet_selection.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BetSelection _$BetSelectionFromJson(Map<String, dynamic> json) => BetSelection(
  eventId: json['eventId'] as String,
  eventName: json['eventName'] as String,
  marketId: json['marketId'] as String,
  marketName: json['marketName'] as String,
  selectionId: json['selectionId'] as String,
  selectionName: json['selectionName'] as String,
  odds: (json['odds'] as num).toDouble(),
  sportId: json['sportId'] as String?,
  league: json['league'] as String?,
  region: json['region'] as String?,
  eventStartTime: (json['eventStartTime'] as num?)?.toInt(),
  isMarketActive: json['isMarketActive'] as bool?,
);

Map<String, dynamic> _$BetSelectionToJson(BetSelection instance) =>
    <String, dynamic>{
      'eventId': instance.eventId,
      'eventName': instance.eventName,
      'marketId': instance.marketId,
      'marketName': instance.marketName,
      'selectionId': instance.selectionId,
      'selectionName': instance.selectionName,
      'odds': instance.odds,
      'sportId': instance.sportId,
      'league': instance.league,
      'region': instance.region,
      'eventStartTime': instance.eventStartTime,
      'isMarketActive': instance.isMarketActive,
    };
