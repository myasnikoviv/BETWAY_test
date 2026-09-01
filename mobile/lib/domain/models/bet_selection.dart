import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'bet_selection.g.dart';

/// Canonical domain model representing an individual betting selection (leg).
/// Decoupled from external bookmaker (Betway) payload schemas.
@JsonSerializable()
class BetSelection extends Equatable {
  /// External event identifier (e.g. "72221212")
  final String eventId;

  /// Human-readable event description (e.g. "Aston Villa vs. Arsenal FC")
  final String eventName;

  /// External market identifier (e.g. "72221212546")
  final String marketId;

  /// Human-readable market description (e.g. "Double Chance & Both Teams To Score (GG/NG)")
  final String marketName;

  /// External outcome/selection identifier (e.g. "722212125461718")
  final String selectionId;

  /// Human-readable outcome name (e.g. "Aston Villa/Draw & Yes")
  final String selectionName;

  /// Decimal odds value (e.g. 3.35)
  final double odds;

  /// Sport category identifier (e.g. "soccer")
  final String? sportId;

  /// Competition / League name (e.g. "Premier League")
  final String? league;

  /// Geographic region (e.g. "England")
  final String? region;

  /// Event start timestamp in epoch seconds
  final int? eventStartTime;

  /// Flag indicating if the market is currently active/open
  final bool? isMarketActive;

  const BetSelection({
    required this.eventId,
    required this.eventName,
    required this.marketId,
    required this.marketName,
    required this.selectionId,
    required this.selectionName,
    required this.odds,
    this.sportId,
    this.league,
    this.region,
    this.eventStartTime,
    this.isMarketActive,
  });

  /// Creates a [BetSelection] from a JSON map.
  factory BetSelection.fromJson(Map<String, dynamic> json) =>
      _$BetSelectionFromJson(json);

  /// Converts this [BetSelection] instance into a JSON map.
  Map<String, dynamic> toJson() => _$BetSelectionToJson(this);

  @override
  List<Object?> get props => [
    eventId,
    eventName,
    marketId,
    marketName,
    selectionId,
    selectionName,
    odds,
    sportId,
    league,
    region,
    eventStartTime,
    isMarketActive,
  ];
}
