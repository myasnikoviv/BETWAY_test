import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import 'bet_selection.dart';

part 'bet_slip.g.dart';

/// Canonical domain model representing a structured betting slip.
/// Decoupled from bookmaker-specific DTO payloads.
@JsonSerializable(explicitToJson: true)
class BetSlip extends Equatable {
  /// Optional booking code identifying the slip on Betway (e.g. "BW6D7ABCFB")
  final String? bookingCode;

  /// Array of individual betting legs / selections
  final List<BetSelection> selections;

  /// Cumulative product of all selection odds, rounded to 2 decimal places
  final double totalOdds;

  /// Single (1 selection) vs. Multi bet classification
  final bool isSingleBet;

  /// ISO timestamp when the slip was created / resolved
  final String createdAt;

  const BetSlip({
    this.bookingCode,
    required this.selections,
    required this.totalOdds,
    required this.isSingleBet,
    required this.createdAt,
  });

  /// Factory constructor to create a [BetSlip] with automated total odds and single bet calculation.
  factory BetSlip.create({
    String? bookingCode,
    required List<BetSelection> selections,
    double? totalOdds,
    bool? isSingleBet,
    String? createdAt,
  }) {
    final computedTotalOdds = totalOdds ?? calculateTotalOdds(selections);
    final computedIsSingle = isSingleBet ?? (selections.length == 1);
    final computedCreatedAt =
        createdAt ?? DateTime.now().toUtc().toIso8601String();

    return BetSlip(
      bookingCode: bookingCode,
      selections: selections,
      totalOdds: computedTotalOdds,
      isSingleBet: computedIsSingle,
      createdAt: computedCreatedAt,
    );
  }

  /// Calculates cumulative total decimal odds rounded to 2 decimal places.
  static double calculateTotalOdds(List<BetSelection> selections) {
    if (selections.isEmpty) return 0.0;
    final product = selections.fold<double>(
      1.0,
      (acc, s) => acc * (s.odds.isFinite ? s.odds : 1.0),
    );
    return double.parse(product.toStringAsFixed(2));
  }

  /// Creates a [BetSlip] from a JSON map.
  factory BetSlip.fromJson(Map<String, dynamic> json) =>
      _$BetSlipFromJson(json);

  /// Converts this [BetSlip] instance into a JSON map.
  Map<String, dynamic> toJson() => _$BetSlipToJson(this);

  @override
  List<Object?> get props => [
    bookingCode,
    selections,
    totalOdds,
    isSingleBet,
    createdAt,
  ];
}
